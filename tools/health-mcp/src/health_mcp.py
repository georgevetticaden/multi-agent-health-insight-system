#!/usr/bin/env python3
"""
Health MCP Server - Import tool for Health Intelligence System
Provides tools for importing health data into Snowflake
"""

import os
import sys
import json
import uuid
import logging
import glob
import traceback
import time
import base64
import hashlib
from datetime import datetime, date, timezone, timedelta
from decimal import Decimal
from pathlib import Path
from typing import Dict, Any, List, Optional
from collections import defaultdict

import snowflake.connector
import requests
import jwt
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from mcp.server.fastmcp import FastMCP

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize MCP server
mcp = FastMCP("health-analysis-mcp-server")

# Environment variables
SNOWFLAKE_USER = os.getenv("SNOWFLAKE_USER")
SNOWFLAKE_ACCOUNT = os.getenv("SNOWFLAKE_ACCOUNT") 
SNOWFLAKE_PRIVATE_KEY_PATH = os.getenv("SNOWFLAKE_PRIVATE_KEY_PATH")
SNOWFLAKE_WAREHOUSE = os.getenv("SNOWFLAKE_WAREHOUSE", "COMPUTE_WH")
SNOWFLAKE_DATABASE = os.getenv("SNOWFLAKE_DATABASE", "HEALTH_INTELLIGENCE")
SNOWFLAKE_SCHEMA = os.getenv("SNOWFLAKE_SCHEMA", "HEALTH_RECORDS")
SNOWFLAKE_ROLE = os.getenv("SNOWFLAKE_ROLE", "ACCOUNTADMIN")
SNOWFLAKE_SEMANTIC_MODEL_FILE = os.getenv("SNOWFLAKE_SEMANTIC_MODEL_FILE", "health_intelligence_semantic_model.yaml")

def get_private_key():
    """Load private key from file"""
    if not SNOWFLAKE_PRIVATE_KEY_PATH:
        raise ValueError("SNOWFLAKE_PRIVATE_KEY_PATH environment variable not set")
    
    key_path = Path(SNOWFLAKE_PRIVATE_KEY_PATH).expanduser()
    if not key_path.exists():
        raise FileNotFoundError(f"Private key file not found: {key_path}")
    
    with open(key_path, 'rb') as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None,
            backend=default_backend()
        )
    return private_key

def get_snowflake_connection():
    """Create Snowflake connection using key-pair authentication"""
    try:
        private_key = get_private_key()
        
        return snowflake.connector.connect(
            user=SNOWFLAKE_USER,
            account=SNOWFLAKE_ACCOUNT,
            private_key=private_key,
            warehouse=SNOWFLAKE_WAREHOUSE,
            database=SNOWFLAKE_DATABASE,
            schema=SNOWFLAKE_SCHEMA,
            role=SNOWFLAKE_ROLE
        )
    except Exception as e:
        logger.error(f"Failed to connect to Snowflake: {str(e)}")
        raise

def parse_date(date_str: str) -> Optional[date]:
    """Parse date string to date object"""
    if not date_str:
        return None
    
    try:
        # Handle various date formats
        if len(date_str) == 10 and '-' in date_str:
            return datetime.strptime(date_str, '%Y-%m-%d').date()
        elif len(date_str) == 10 and '/' in date_str:
            return datetime.strptime(date_str, '%m/%d/%Y').date()
        else:
            # Try ISO format
            return datetime.fromisoformat(date_str.replace('Z', '+00:00')).date()
    except Exception as e:
        logger.warning(f"Could not parse date '{date_str}': {e}")
        return None

def extract_patient_info(file_path: str) -> Dict[str, Any]:
    """Extract patient information from header_fields in JSON file"""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
            
        if "header_fields" in data:
            header = data["header_fields"]
            return {
                "patient_identity": header.get("Patient_Name", "Unknown Patient"),
                "date_of_birth": parse_date(header.get("Date_Of_Birth")),
                "patient_age": header.get("Patient_Age"),
                "report_date": parse_date(header.get("Report_Date"))
            }
    except Exception as e:
        logger.warning(f"Could not extract patient info from {file_path}: {e}")
    
    return {}

def ensure_patient_exists(conn, patient_info: Dict[str, Any]) -> str:
    """Ensure patient exists in database and return patient_id"""
    cursor = conn.cursor()
    
    try:
        # Generate UUID for patient
        patient_id = str(uuid.uuid4())
        
        # Insert patient record
        cursor.execute("""
            INSERT INTO PATIENTS (PATIENT_ID, PATIENT_IDENTITY, DATE_OF_BIRTH, PATIENT_AGE)
            VALUES (%s, %s, %s, %s)
        """, (
            patient_id,
            patient_info.get("patient_identity", "Unknown Patient"),
            patient_info.get("date_of_birth"),
            patient_info.get("patient_age")
        ))
        
        logger.info(f"Created patient record with ID: {patient_id}")
        return patient_id
        
    except Exception as e:
        logger.error(f"Failed to create patient record: {str(e)}")
        raise
    finally:
        cursor.close()

def create_import_record(conn, patient_id: str, source_files: List[str]) -> str:
    """Create import record and return import_id"""
    cursor = conn.cursor()
    
    try:
        import_id = str(uuid.uuid4())
        
        cursor.execute("""
            INSERT INTO IMPORTS (IMPORT_ID, PATIENT_ID, SOURCE_FILES, IMPORT_STATUS)
            VALUES (%s, %s, %s, %s)
        """, (
            import_id,
            patient_id,
            json.dumps(source_files),
            'IN_PROGRESS'
        ))
        
        logger.info(f"Created import record with ID: {import_id}")
        return import_id
        
    except Exception as e:
        logger.error(f"Failed to create import record: {str(e)}")
        raise
    finally:
        cursor.close()

def process_lab_results(data: Dict, patient_id: str, import_id: str, source_file: str) -> List[Dict]:
    """Process lab results data into health records"""
    records = []
    
    if "Lab_Results" not in data:
        return records
    
    for lab_session in data["Lab_Results"]:
        test_date = parse_date(lab_session.get("Test_Date"))
        provider = lab_session.get("Provider", "Unknown Provider")
        
        for test in lab_session.get("Tests", []):
            record = {
                "record_id": str(uuid.uuid4()),
                "patient_id": patient_id,
                "import_id": import_id,
                "record_category": "LAB",
                "record_date": test_date,
                "provider": provider,
                "item_description": test.get("Test_Name"),
                "value_text": test.get("Test_Value"),
                "measurement_dimension": test.get("Test_Unit"),
                "reference_range": test.get("Reference_Range"),
                "flag": test.get("Flag"),
                "test_category": test.get("Test_Category"),
                "source_file": source_file
            }
            
            # Try to parse numeric value
            try:
                value_str = str(test.get("Test_Value", "")).strip()
                if value_str and value_str.replace('.', '').replace('-', '').isdigit():
                    record["value_numeric"] = float(value_str)
            except:
                pass
            
            records.append(record)
    
    return records

def process_medications(data: Dict, patient_id: str, import_id: str, source_file: str) -> List[Dict]:
    """Process medications data into health records"""
    records = []
    
    if "Medications" not in data:
        return records
    
    for med in data["Medications"]:
        record = {
            "record_id": str(uuid.uuid4()),
            "patient_id": patient_id,
            "import_id": import_id,
            "record_category": "MEDICATION",
            "record_date": parse_date(med.get("Prescription_Date")),
            "provider": med.get("Provider", "Unknown Provider"),
            "item_description": med.get("Medication_Name"),
            "dosage": med.get("Dosage"),
            "form": med.get("Form"),
            "for_condition": med.get("For_Condition"),
            "frequency": med.get("Frequency"),
            "medication_status": med.get("Status", "PRESCRIBED"),
            "source_file": source_file
        }
        records.append(record)
    
    return records

def process_vitals(data: Dict, patient_id: str, import_id: str, source_file: str) -> List[Dict]:
    """Process vitals data into health records"""
    records = []
    
    if "Vitals" not in data:
        return records
    
    for vital in data["Vitals"]:
        record = {
            "record_id": str(uuid.uuid4()),
            "patient_id": patient_id,
            "import_id": import_id,
            "record_category": "VITAL",
            "record_date": parse_date(vital.get("Measurement_Date")),
            "provider": vital.get("Provider", "Unknown Provider"),
            "item_description": vital.get("Vital_Type"),
            "value_numeric": vital.get("Vital_Value"),
            "measurement_dimension": vital.get("Vital_Unit"),
            "vital_category": vital.get("Vital_Type"),
            "source_file": source_file
        }
        records.append(record)
    
    return records

def process_clinical_data(data: Dict, patient_id: str, import_id: str, source_file: str) -> List[Dict]:
    """Process clinical data (conditions, procedures, allergies, immunizations)"""
    records = []
    
    # Process Conditions
    if "Conditions" in data:
        for condition in data["Conditions"]:
            record = {
                "record_id": str(uuid.uuid4()),
                "patient_id": patient_id,
                "import_id": import_id,
                "record_category": "CONDITION",
                "record_date": parse_date(condition.get("Diagnosis_Date")),
                "provider": condition.get("Provider", "Unknown Provider"),
                "item_description": condition.get("Condition_Name"),
                "condition_status": condition.get("Status"),
                "source_file": source_file
            }
            records.append(record)
    
    # Process Procedures
    if "Procedures" in data:
        for procedure in data["Procedures"]:
            record = {
                "record_id": str(uuid.uuid4()),
                "patient_id": patient_id,
                "import_id": import_id,
                "record_category": "PROCEDURE",
                "record_date": parse_date(procedure.get("Procedure_Date")),
                "provider": procedure.get("Provider", "Unknown Provider"),
                "item_description": procedure.get("Procedure_Name"),
                "procedure_category": procedure.get("Procedure_Type"),
                "source_file": source_file
            }
            records.append(record)
    
    # Process Allergies
    if "Allergies" in data:
        for allergy in data["Allergies"]:
            record = {
                "record_id": str(uuid.uuid4()),
                "patient_id": patient_id,
                "import_id": import_id,
                "record_category": "ALLERGY",
                "record_date": parse_date(allergy.get("Record_Date")),
                "provider": allergy.get("Provider", "Unknown Provider"),
                "item_description": allergy.get("Allergy"),
                "allergy_category": "ALLERGY",
                "source_file": source_file
            }
            records.append(record)
    
    # Process Immunizations
    if "Immunizations" in data:
        for immunization in data["Immunizations"]:
            record = {
                "record_id": str(uuid.uuid4()),
                "patient_id": patient_id,
                "import_id": import_id,
                "record_category": "IMMUNIZATION",
                "record_date": parse_date(immunization.get("Immunization_Date")),
                "provider": immunization.get("Provider", "Unknown Provider"),
                "item_description": immunization.get("Vaccine_Name"),
                "vaccine_category": immunization.get("Vaccine_Type"),
                "source_file": source_file
            }
            records.append(record)
    
    return records

def bulk_insert_health_records(conn, records: List[Dict]):
    """Bulk insert health records into database"""
    if not records:
        return
    
    cursor = conn.cursor()
    
    try:
        # Prepare insert statement
        insert_sql = """
            INSERT INTO HEALTH_RECORDS (
                RECORD_ID, PATIENT_ID, IMPORT_ID, RECORD_CATEGORY, RECORD_DATE, PROVIDER,
                ITEM_DESCRIPTION, VALUE_TEXT, VALUE_NUMERIC, MEASUREMENT_DIMENSION, 
                REFERENCE_RANGE, FLAG, TEST_CATEGORY, DOSAGE, FORM, FOR_CONDITION, 
                FREQUENCY, MEDICATION_STATUS, VITAL_CATEGORY, CONDITION_STATUS, 
                VACCINE_CATEGORY, PROCEDURE_CATEGORY, ALLERGY_CATEGORY
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        """
        
        # Prepare data for bulk insert
        insert_data = []
        for record in records:
            insert_data.append((
                record.get("record_id"),
                record.get("patient_id"),
                record.get("import_id"),
                record.get("record_category"),
                record.get("record_date"),
                record.get("provider"),
                record.get("item_description"),
                record.get("value_text"),
                record.get("value_numeric"),
                record.get("measurement_dimension"),
                record.get("reference_range"),
                record.get("flag"),
                record.get("test_category"),
                record.get("dosage"),
                record.get("form"),
                record.get("for_condition"),
                record.get("frequency"),
                record.get("medication_status"),
                record.get("vital_category"),
                record.get("condition_status"),
                record.get("vaccine_category"),
                record.get("procedure_category"),
                record.get("allergy_category")
            ))
        
        # Execute bulk insert
        cursor.executemany(insert_sql, insert_data)
        logger.info(f"Inserted {len(records)} health records")
        
    except Exception as e:
        logger.error(f"Failed to insert health records: {str(e)}")
        raise
    finally:
        cursor.close()

def calculate_import_statistics(records: List[Dict], source_files: List[str]) -> Dict[str, Any]:
    """Calculate comprehensive import statistics"""
    
    # Records by category
    records_by_category = defaultdict(int)
    for record in records:
        category = record.get("record_category", "Unknown")
        if category == "LAB":
            records_by_category["Lab Results"] += 1
        elif category == "MEDICATION":
            records_by_category["Medications"] += 1
        elif category == "VITAL":
            records_by_category["Vitals"] += 1
        else:
            records_by_category["Clinical Data"] += 1
    
    # Timeline coverage (records by year)
    timeline_coverage = defaultdict(int)
    for record in records:
        record_date = record.get("record_date")
        if record_date:
            year = record_date.year if hasattr(record_date, 'year') else int(str(record_date)[:4])
            timeline_coverage[year] += 1
    
    # Data quality metrics
    total_records = len(records)
    lab_records = [r for r in records if r.get("record_category") == "LAB"]
    med_records = [r for r in records if r.get("record_category") == "MEDICATION"]
    
    lab_with_ranges = len([r for r in lab_records if r.get("reference_range")])
    med_with_status = len([r for r in med_records if r.get("medication_status")])
    records_with_dates = len([r for r in records if r.get("record_date")])
    
    # Key insights
    key_insights = []
    
    # Most recent lab test
    lab_dates = [r.get("record_date") for r in lab_records if r.get("record_date")]
    if lab_dates:
        most_recent_lab = max(lab_dates)
        key_insights.append(f"Most recent lab test: {most_recent_lab}")
    
    # Active medications estimate
    recent_meds = [r for r in med_records if r.get("record_date") and r.get("record_date") >= date(2024, 1, 1)]
    key_insights.append(f"Recent medications: {len(recent_meds)}")
    
    # Years with most data
    if timeline_coverage:
        top_years = sorted(timeline_coverage.items(), key=lambda x: x[1], reverse=True)[:2]
        years_list = [str(year) for year, _ in top_years]
        key_insights.append(f"Years with most complete data: {', '.join(years_list)}")
    
    # Unique lab tests
    unique_lab_tests = set(r.get("item_description") for r in lab_records if r.get("item_description"))
    key_insights.append(f"Total unique lab tests tracked: {len(unique_lab_tests)}")
    
    return {
        "total_records": total_records,
        "records_by_category": dict(records_by_category),
        "timeline_coverage": dict(timeline_coverage),
        "data_quality": {
            "lab_results_with_ranges": {
                "count": lab_with_ranges,
                "total": len(lab_records),
                "percentage": round((lab_with_ranges / len(lab_records) * 100) if lab_records else 0, 1)
            },
            "medications_with_status": {
                "count": med_with_status,
                "total": len(med_records),
                "percentage": round((med_with_status / len(med_records) * 100) if med_records else 0, 1)
            },
            "records_with_dates": {
                "count": records_with_dates,
                "total": total_records,
                "percentage": round((records_with_dates / total_records * 100) if total_records else 0, 1)
            }
        },
        "key_insights": key_insights,
        "source_files": source_files
    }

def update_import_record(conn, import_id: str, statistics: Dict[str, Any]):
    """Update import record with final statistics"""
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE IMPORTS 
            SET RECORDS_BY_CATEGORY = %s,
                IMPORT_STATISTICS = %s,
                TOTAL_RECORDS = %s,
                IMPORT_STATUS = %s
            WHERE IMPORT_ID = %s
        """, (
            json.dumps(statistics["records_by_category"]),
            json.dumps(statistics),
            statistics["total_records"],
            'COMPLETED',
            import_id
        ))
        
        logger.info(f"Updated import record {import_id} with statistics")
        
    except Exception as e:
        logger.error(f"Failed to update import record: {str(e)}")
        raise
    finally:
        cursor.close()

@mcp.tool()
async def snowflake_import_analyze_health_records_v2(
    file_directory: str
) -> Dict[str, Any]:
    """
    Import health data from directory of JSON files into Snowflake and return comprehensive statistics
    
    Args:
        file_directory: Directory path containing extracted JSON health data files
        
    Returns:
        Dictionary with import results and detailed statistics for dashboard visualization
    """
    try:
        logger.info(f"Starting health data import from directory: {file_directory}")
        
        # Expand and validate directory path
        expanded_path = os.path.expanduser(file_directory)
        if not os.path.exists(expanded_path):
            return {
                "success": False,
                "error": f"Directory not found: {file_directory}"
            }
        
        # Find JSON files in directory
        file_patterns = [
            "lab_results_*.json",
            "vitals_*.json",
            "medications_*.json",
            "clinical_data_consolidated.json"
        ]
        
        source_files = []
        for pattern in file_patterns:
            files = glob.glob(os.path.join(expanded_path, pattern))
            source_files.extend(files)
        
        if not source_files:
            return {
                "success": False,
                "error": f"No health data JSON files found in directory: {file_directory}"
            }
        
        logger.info(f"Found {len(source_files)} data files: {[os.path.basename(f) for f in source_files]}")
        
        # Extract patient information from first available file
        patient_info = {}
        for file_path in source_files:
            patient_info = extract_patient_info(file_path)
            if patient_info.get("patient_identity") and patient_info.get("date_of_birth"):
                break
        
        if not patient_info.get("patient_identity") or not patient_info.get("date_of_birth"):
            return {
                "success": False,
                "error": "Could not extract patient information from header_fields in JSON files"
            }
        
        # Connect to Snowflake
        conn = get_snowflake_connection()
        
        try:
            # Create patient record
            patient_id = ensure_patient_exists(conn, patient_info)
            
            # Create import record
            import_id = create_import_record(conn, patient_id, [os.path.basename(f) for f in source_files])
            
            # Process all files and collect health records
            all_records = []
            
            for file_path in source_files:
                logger.info(f"Processing file: {os.path.basename(file_path)}")
                
                try:
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                    
                    source_file = os.path.basename(file_path)
                    
                    # Process different data types
                    lab_records = process_lab_results(data, patient_id, import_id, source_file)
                    med_records = process_medications(data, patient_id, import_id, source_file)
                    vital_records = process_vitals(data, patient_id, import_id, source_file)
                    clinical_records = process_clinical_data(data, patient_id, import_id, source_file)
                    
                    all_records.extend(lab_records)
                    all_records.extend(med_records)
                    all_records.extend(vital_records)
                    all_records.extend(clinical_records)
                    
                    logger.info(f"Processed {len(lab_records + med_records + vital_records + clinical_records)} records from {source_file}")
                    
                except Exception as e:
                    logger.error(f"Error processing file {file_path}: {str(e)}")
                    continue
            
            if not all_records:
                return {
                    "success": False,
                    "error": "No valid health records found in the provided files"
                }
            
            # Bulk insert all records
            bulk_insert_health_records(conn, all_records)
            
            # Calculate statistics
            statistics = calculate_import_statistics(all_records, [os.path.basename(f) for f in source_files])
            
            # Update import record with statistics
            update_import_record(conn, import_id, statistics)
            
            # Commit transaction
            conn.commit()
            
            logger.info(f"Successfully imported {len(all_records)} health records for {patient_info['patient_identity']}")
            
            return {
                "success": True,
                "message": f"Successfully imported health records for {patient_info['patient_identity']}",
                "patient_name": patient_info["patient_identity"],
                "patient_dob": str(patient_info["date_of_birth"]),
                "patient_id": patient_id,
                "import_id": import_id,
                "total_records": len(all_records),
                "statistics": statistics
            }
            
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Import failed: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "error": f"Import failed: {str(e)}",
            "error_details": traceback.format_exc()
        }

def call_cortex_analyst(query: str) -> Dict[str, Any]:
    """Call Snowflake Cortex Analyst REST API using JWT authentication"""
    try:
        logger.info(f"Calling Cortex Analyst with query: {query}")
        
        # Get authentication details
        user = SNOWFLAKE_USER
        account = SNOWFLAKE_ACCOUNT
        
        # Load private key
        expanded_path = os.path.expanduser(SNOWFLAKE_PRIVATE_KEY_PATH)
        with open(expanded_path, 'rb') as key_file:
            private_key_data = key_file.read()
        
        p_key = serialization.load_pem_private_key(
            private_key_data,
            password=None,
            backend=default_backend()
        )
        
        # Generate JWT token
        def clean_account_identifier(acct):
            if not '.global' in acct:
                idx = acct.find('.')
                if idx > 0:
                    acct = acct[0:idx]
            acct = acct.replace('.', '-')
            return acct.upper()
        
        clean_account = clean_account_identifier(account)
        upper_user = user.upper()
        
        # Calculate public key fingerprint - USE CORRECT METHOD NAME
        public_key_raw = p_key.public_key().public_bytes(  # ← public_bytes, not public_key_bytes
            encoding=serialization.Encoding.DER,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        sha256hash = hashlib.sha256()
        sha256hash.update(public_key_raw)
        public_key_fp = 'SHA256:' + base64.b64encode(sha256hash.digest()).decode('utf-8')
        
        # Create JWT - USE UTC DATETIME
        now = datetime.now(timezone.utc)  # ← UTC datetime, not time.time()
        lifetime = timedelta(minutes=59)
        
        payload = {
            "iss": f"{clean_account}.{upper_user}.{public_key_fp}",
            "sub": f"{clean_account}.{upper_user}",
            "iat": int(now.timestamp()),
            "exp": int((now + lifetime).timestamp())
        }
        
        token = jwt.encode(payload, p_key, algorithm="RS256")
        if isinstance(token, bytes):
            token = token.decode('utf-8')
        
        # Call Cortex Analyst API
        base_url = f"https://{account.lower()}.snowflakecomputing.com/api/v2/cortex/analyst/message"
        
        headers = {
            "Authorization": f"Bearer {token}",
            "X-Snowflake-Authorization-Token-Type": "KEYPAIR_JWT",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        # CONSTRUCT FULL STAGE PATH
        semantic_model_filename = SNOWFLAKE_SEMANTIC_MODEL_FILE
        semantic_model_file = f"@{SNOWFLAKE_DATABASE}.{SNOWFLAKE_SCHEMA}.RAW_DATA/{semantic_model_filename}"
        
        request_body = {
            "timeout": 60000,
            "messages": [
                {"role": "user", "content": [{"type": "text", "text": query}]}
            ],
            "semantic_model_file": semantic_model_file
        }
        
        logger.info(f"Calling Cortex Analyst API: {base_url}")
        logger.info(f"Semantic model: {semantic_model_file}")
        
        response = requests.post(base_url, headers=headers, json=request_body)
        
        # Log response details for debugging
        logger.info(f"Response status: {response.status_code}")
        if response.status_code != 200:
            logger.error(f"Response body: {response.text}")
        
        response.raise_for_status()
        return response.json()
            
    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            logger.error(f"Response body: {e.response.text}")
        raise Exception(f"Cortex Analyst call failed: {str(e)}")
    except Exception as e:
        logger.error(f"Cortex Analyst error: {str(e)}")
        raise Exception(f"Cortex Analyst call failed: {str(e)}")

def execute_query(sql: str) -> List[Dict[str, Any]]:
    """Execute SQL query and return results as list of dictionaries"""
    try:
        conn = get_snowflake_connection()
        cursor = conn.cursor()
        
        logger.info(f"Executing SQL: {sql}")
        cursor.execute(sql)
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        
        results = []
        for row in rows:
            # HANDLE ALL NON-JSON-SERIALIZABLE TYPES
            converted_row = []
            for value in row:
                if isinstance(value, (datetime, date)):
                    converted_row.append(value.isoformat())
                elif isinstance(value, Decimal):  # ← CRITICAL: Handle Decimal types
                    converted_row.append(float(value))
                elif value is None:
                    converted_row.append(None)
                else:
                    converted_row.append(value)
            results.append(dict(zip(columns, converted_row)))
        
        logger.info(f"Query returned {len(results)} rows")
        return results
        
    except Exception as e:
        logger.error(f"SQL execution failed: {str(e)}")
        raise Exception(f"SQL execution failed: {str(e)}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

def calculate_health_metrics(query: str, results: List[Dict]) -> Dict[str, Any]:
    """Calculate basic health-specific metrics"""
    if not results:
        return {"message": "No data to analyze"}
    
    metrics = {
        "row_count": len(results),
        "columns": list(results[0].keys()) if results else [],
        "has_date_data": any("date" in str(k).lower() for k in results[0].keys()) if results else False,
        "has_numeric_data": any(isinstance(v, (int, float)) for v in results[0].values()) if results else False
    }
    
    # Add query-specific insights
    query_lower = query.lower()
    if "cholesterol" in query_lower:
        metrics["data_category"] = "lab_results"
        metrics["health_focus"] = "cardiovascular"
    elif "medication" in query_lower:
        metrics["data_category"] = "medications"
        metrics["health_focus"] = "treatment"
    elif "blood pressure" in query_lower:
        metrics["data_category"] = "vitals"
        metrics["health_focus"] = "cardiovascular"
    elif "hba1c" in query_lower or "glucose" in query_lower:
        metrics["data_category"] = "lab_results"
        metrics["health_focus"] = "diabetes"
    else:
        metrics["data_category"] = "general"
        metrics["health_focus"] = "general"
    
    return metrics

@mcp.tool()
async def execute_health_query_v2(query: str) -> Dict[str, Any]:
    """
    Execute natural language health queries using Cortex Analyst.
    
    Args:
        query: Natural language query about health data
        
    Returns:
        Query results with metadata including SQL generated, results, and health-specific metrics
    """
    try:
        logger.info(f"Processing health query: {query}")
        
        # Call Cortex Analyst to translate query
        cortex_response = call_cortex_analyst(query)
        
        # Extract SQL from response
        sql = None
        interpretation = ""
        
        if "message" in cortex_response and "content" in cortex_response["message"]:
            for content_item in cortex_response["message"]["content"]:
                if content_item.get("type") == "sql":
                    sql = content_item.get("statement")
                if content_item.get("type") == "text":
                    interpretation += content_item.get("text", "") + "\n\n"
        
        if not sql:
            # Fallback extraction methods
            if "sql" in cortex_response:
                sql = cortex_response["sql"]
            elif "code" in cortex_response:
                sql = cortex_response["code"]
        
        if not sql:
            return {
                "error": "Could not extract SQL from Cortex Analyst response",
                "query": query,
                "query_successful": False,
                "cortex_response": cortex_response
            }
        
        logger.info(f"Executing SQL: {sql}")
        
        # Execute the generated SQL
        results = execute_query(sql)
        
        # Calculate metrics based on query type
        metrics = calculate_health_metrics(query, results)
        
        # Return results in expected format
        return {
            "query": query,
            "interpretation": interpretation.strip(),
            "sql": sql,
            "results": results,
            "result_count": len(results),
            "data_metrics": metrics,
            "query_successful": True,
            "execution_time": "Not provided",
            "warnings": []
        }
        
    except Exception as e:
        logger.error(f"Query error: {str(e)}")
        return {
            "error": str(e),
            "error_details": traceback.format_exc(),
            "query": query,
            "query_successful": False
        }

if __name__ == "__main__":
    # Run the MCP server
    mcp.run()