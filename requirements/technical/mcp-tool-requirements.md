# MCP Tool Requirements

## Overview
MCP (Model Context Protocol) tools enable agents to interact with external systems. For the Health Analyst Agent, we need tools that connect to Snowflake for data operations.

## Standard MCP Project Structure

```
tools/
└── health-mcp/
    ├── pyproject.toml      # Project dependencies and metadata
    └── src/
        └── health_mcp.py   # Main MCP server implementation
```

## pyproject.toml Configuration

The `pyproject.toml` must include proper build configuration for uv:

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "health-mcp"
version = "0.1.0"
description = "MCP tools for Health Intelligence System"
requires-python = ">=3.10"
dependencies = [
    "mcp>=1.0.0",
    "snowflake-connector-python>=3.0.0",
    "cryptography>=42.0.0",
    "python-dateutil>=2.8.0",
    "requests>=2.31.0",
    "PyJWT>=2.8.0"
]

[tool.hatch.build.targets.wheel]
packages = ["src"]
```

Note: The `[tool.hatch.build.targets.wheel]` section is required to tell hatchling where to find the package files.

## Package Management with uv

Use `uv` for managing Python environments and dependencies:

### Installation
```bash
cd tools/health-mcp
uv sync  # Creates virtual environment and installs dependencies
```

### Running with uv
```bash
# Run the MCP server
uv run src/health_mcp.py

# Run test scripts
uv run test_import.py
```

### Claude Desktop Configuration
Configure in `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "health-analysis-server": {
      "command": "/path/to/.local/bin/uv",
      "args": [
        "--directory",
        "/path/to/tools/health-mcp",
        "run",
        "src/health_mcp.py"
      ],
      "env": {
        "SNOWFLAKE_USER": "username",
        "SNOWFLAKE_ACCOUNT": "account",
        "SNOWFLAKE_WAREHOUSE": "COMPUTE_WH",
        "SNOWFLAKE_DATABASE": "HEALTH_INTELLIGENCE",
        "SNOWFLAKE_SCHEMA": "HEALTH_RECORDS",
        "SNOWFLAKE_ROLE": "ACCOUNTADMIN",
        "SNOWFLAKE_PRIVATE_KEY_PATH": "~/.ssh/snowflake/snowflake_key.p8"
      }
    }
  }
}
```

## Required Dependencies

### Core MCP Requirements
- **mcp** - The MCP server framework
- **Python 3.10+** - Required for MCP compatibility

### Snowflake Integration
- **snowflake-connector-python** - Official Snowflake connector
- **cryptography** - For key-pair authentication (loading private keys)

### Data Processing
- **python-dateutil** - For flexible date parsing
- Standard library modules: json, uuid, os, pathlib

## Private Key Authentication Pattern

When using key-pair authentication with Snowflake:
```python
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization

def get_private_key():
    """Load private key from file"""
    key_path = Path(SNOWFLAKE_PRIVATE_KEY_PATH).expanduser()
    with open(key_path, 'rb') as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None,
            backend=default_backend()
        )
    return private_key
```

Note: The private key object is passed directly to the Snowflake connector

## Authentication Requirements

Snowflake connections should use key-pair authentication for security:
- Private key file path from environment variable
- JWT token generation for authentication
- No passwords stored in code

### Correct Snowflake Connection Pattern

```python
def get_snowflake_connection():
    """Create Snowflake connection using key-pair authentication"""
    private_key = get_private_key()
    
    return snowflake.connector.connect(
        user=SNOWFLAKE_USER,
        account=SNOWFLAKE_ACCOUNT,
        private_key=private_key,  # Pass the key object directly
        warehouse=SNOWFLAKE_WAREHOUSE,
        database=SNOWFLAKE_DATABASE,
        schema=SNOWFLAKE_SCHEMA,
        role=SNOWFLAKE_ROLE
    )
```

**Important**: Do NOT use `authenticator='oauth'` with JWT tokens. Pass the private_key object directly to the connect method.

## Tool Implementation Pattern

MCP tools should follow this pattern:

```python
from mcp.server.fastmcp import FastMCP

# Initialize MCP server
mcp = FastMCP("health-analysis-mcp-server")

# Define tools using decorators
@mcp.tool()
def tool_name(param1: str, param2: list) -> dict:
    """Tool description"""
    # Implementation
    return result
```

## Environment Variables

Tools should read configuration from environment:
- SNOWFLAKE_USER
- SNOWFLAKE_ACCOUNT
- SNOWFLAKE_PRIVATE_KEY_PATH
- SNOWFLAKE_WAREHOUSE
- SNOWFLAKE_DATABASE
- SNOWFLAKE_SCHEMA
- SNOWFLAKE_ROLE
- SNOWFLAKE_SEMANTIC_MODEL_FILE (for Cortex Analyst)

## Error Handling

- Return structured error responses with clear messages
- Include error details for debugging
- Handle missing environment variables gracefully
- Validate input parameters before processing

## Data Import Patterns

When importing health records:
1. Track source file for each record in the SOURCE_FILE column
2. Use the exact column names from the DDL (no NUMERIC_VALUE column)
3. Convert numeric values inline when needed: `TRY_CAST(VALUE AS NUMERIC)`
4. Use executemany for bulk inserts with proper parameter binding

### Clinical Data vs Metadata Classification

**Process as Health Records (these have dates and represent patient health events):**
- `Lab_Results` - Laboratory test results with Test_Date and Provider
- `Medications` - Prescriptions with Prescription_Date and Provider  
- `Vitals` - Vital signs with Measurement_Date and Provider
- `Allergies` - Patient allergies with Record_Date and Provider
- `Conditions` - Medical diagnoses with Diagnosis_Date and Provider
- `Procedures` - Medical procedures with Date and Provider
- `Immunizations` - Vaccines with Date and Provider

**Skip as Metadata (reference information, not health events):**
- `Provider_Information` - Healthcare provider directory (metadata only)
- `header_fields` - Patient demographics for PATIENTS table

**Key Rules**: 
1. Import data that represents something that happened to the patient on a specific date
2. Capture provider name directly from each health record's "Provider" field  
3. No lookup tables - provider information is already embedded in each health record
4. Extract patient demographics from header_fields for PATIENTS table
5. **IMPORTANT**: Handle IDs correctly in Snowflake:
   ```python
   # ❌ WRONG: cursor.lastrowid doesn't work in Snowflake
   cursor.execute("INSERT INTO PATIENTS ...")
   patient_id = cursor.lastrowid  # Returns None!
   
   # ✅ CORRECT: Generate UUID in Python or use RETURNING clause
   patient_id = str(uuid.uuid4())
   cursor.execute("INSERT INTO PATIENTS (PATIENT_ID, ...) VALUES (%s, ...)", (patient_id, ...))
   
   # OR use RETURNING (if supported):
   cursor.execute("INSERT INTO PATIENTS (...) VALUES (...) RETURNING PATIENT_ID")
   patient_id = cursor.fetchone()[0]
   ```
6. Handle file paths robustly - support both absolute and relative paths:
   ```python
   # In the import tool, check if file exists at given path
   file_path = Path(json_file)
   if not file_path.exists():
       # Try relative to a common base if absolute path doesn't work
       # This handles different working directories gracefully
       alt_path = Path(__file__).parent.parent / json_file
       if alt_path.exists():
           file_path = alt_path
   ```
6. Store JSON data as VARCHAR strings using `json.dumps()`:
   ```python
   # Simple and reliable - just store JSON as VARCHAR
   cursor.execute("""
       INSERT INTO IMPORTS (SOURCE_FILES, RECORDS_BY_TYPE, IMPORT_STATISTICS)
       VALUES (%s, %s, %s)
   """, (
       json.dumps(["file1.json", "file2.json"]),  # VARCHAR column
       json.dumps({"Lab Results": 50}),           # VARCHAR column
       json.dumps(statistics_dict)                # VARCHAR column
   ))
   ```

## Import Tool Implementation

### CRITICAL: Correct Import Tool Signature

The `snowflake_import_analyze_health_records_v2` tool must use this exact signature:

```python
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
        # Expand and validate directory path
        expanded_path = os.path.expanduser(file_directory)
        if not os.path.exists(expanded_path):
            return {
                "success": False,
                "error": f"Directory not found: {file_directory}"
            }
        
        # Extract patient information from header_fields of first available file
        patient_name = None
        patient_dob = None
        patient_age = None
        
        # Search for files and extract patient info from header_fields
        import glob
        for pattern in ["lab_results_*.json", "vitals_*.json", "medications_*.json", "clinical_data_consolidated.json"]:
            files = glob.glob(os.path.join(expanded_path, pattern))
            if files and (not patient_name or not patient_dob or not patient_age):
                try:
                    with open(files[0], 'r') as f:
                        data = json.load(f)
                        if "header_fields" in data:
                            header = data["header_fields"]
                            if not patient_name:
                                patient_name = header.get("Patient_Name", "Unknown Patient")
                            if not patient_dob:
                                patient_dob = header.get("Date_Of_Birth")
                            if not patient_age:
                                patient_age = header.get("Patient_Age")
                            
                            if patient_name and patient_dob and patient_age:
                                break
                except Exception as e:
                    logger.warning(f"Could not extract patient info from {files[0]}: {e}")
        
        if not patient_name or not patient_dob:
            return {
                "success": False,
                "error": "Could not extract patient information from header_fields in JSON files"
            }
        
        # Process all JSON files in directory
        # ... (rest of import implementation)
        
        return {
            "success": True,
            "message": f"Successfully imported health records for {patient_name}",
            "patient_name": patient_name,
            "patient_dob": patient_dob,
            "statistics": import_statistics
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Import failed: {str(e)}"
        }
```

### Expected File Structure

The tool expects JSON files with this structure:
```json
{
    "header_fields": {
        "Patient_Name": "GEORGE VETTICADEN",
        "Date_Of_Birth": "1980-03-26", 
        "Patient_Age": 45,
        "Report_Date": "2025-05-16"
    },
    "Lab_Results": [...],
    "Medications": [...],
    "Vitals": [...],
    "Conditions": [...]
}
```

### File Pattern Discovery

The tool automatically discovers files matching these patterns:
- `lab_results_*.json`
- `vitals_*.json` 
- `medications_*.json`
- `clinical_data_consolidated.json`

## Import Statistics Structure

Return comprehensive statistics matching the visualization requirements:
```python
{
    "total_records": int,
    "records_by_category": {
        "Lab Results": int,
        "Medications": int,
        "Vitals": int,
        "Clinical Data": int
    },
    "timeline_coverage": {
        2023: int,  # Records per year
        2024: int
    },
    "data_quality": {
        "lab_results_with_ranges": {"count": int, "total": int, "percentage": float},
        "medications_with_status": {"count": int, "total": int, "percentage": float},
        "records_with_dates": {"count": int, "total": int, "percentage": float}
    },
    "key_insights": [
        "Most recent lab test: YYYY-MM-DD",
        "Active medications: N",
        "Years with most complete data: YYYY, YYYY",
        "Total unique lab tests tracked: N"
    ]
}
```

## Cortex Analyst Query Tool Implementation

### CRITICAL: Correct Cortex Analyst Usage

The `execute_health_query_v2` tool must follow this exact pattern to work with Snowflake Cortex Analyst:

```python
@mcp.tool()
async def execute_health_query_v2(query: str) -> Dict[str, Any]:
    """
    Execute natural language health queries using Cortex Analyst.
    
    Args:
        query: Natural language query
        
    Returns:
        Query results with metadata
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
                "query_successful": False
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
```

### Required Helper Functions

```python
import requests
import jwt
import time
import base64
import hashlib
from cryptography.hazmat.primitives import serialization

def call_cortex_analyst(query: str) -> Dict[str, Any]:
    """Call Snowflake Cortex Analyst REST API using JWT authentication"""
    try:
        # Load private key
        private_key = get_private_key()
        
        # Generate public key fingerprint
        public_key = private_key.public_key()
        public_key_der = public_key.public_key_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        public_key_fp = "SHA256:" + base64.b64encode(hashlib.sha256(public_key_der).digest()).decode('ascii')
        
        # Clean account identifier
        account = SNOWFLAKE_ACCOUNT
        if account.endswith('.global'):
            account = account[:-7]
        clean_account = account.replace('.', '-').upper()
        upper_user = SNOWFLAKE_USER.upper()
        
        # Create JWT token
        now = int(time.time())
        payload = {
            'iss': f"{clean_account}.{upper_user}.{public_key_fp}",
            'sub': f"{clean_account}.{upper_user}",
            'iat': now,
            'exp': now + 3540  # 59 minutes
        }
        
        token = jwt.encode(payload, private_key, algorithm='RS256')
        
        # Construct endpoint URL
        base_url = f"https://{account.lower()}.snowflakecomputing.com/api/v2/cortex/analyst/message"
        
        # Prepare headers
        headers = {
            "Authorization": f"Bearer {token}",
            "X-Snowflake-Authorization-Token-Type": "KEYPAIR_JWT",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        # Prepare request body
        semantic_model_file = f"@{SNOWFLAKE_DATABASE}.{SNOWFLAKE_SCHEMA}.RAW_DATA/{SNOWFLAKE_SEMANTIC_MODEL_FILE}"
        request_body = {
            "timeout": 60000,
            "messages": [
                {"role": "user", "content": [{"type": "text", "text": query}]}
            ],
            "semantic_model_file": semantic_model_file
        }
        
        # Make HTTP request
        response = requests.post(base_url, headers=headers, json=request_body)
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        raise Exception(f"Cortex Analyst call failed: {str(e)}")

def execute_query(sql: str) -> List[Dict[str, Any]]:
    """Execute SQL query and return results as list of dictionaries"""
    try:
        conn = get_snowflake_connection()
        cursor = conn.cursor()
        
        cursor.execute(sql)
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        
        results = []
        for row in rows:
            results.append(dict(zip(columns, row)))
        
        return results
        
    except Exception as e:
        raise Exception(f"SQL execution failed: {str(e)}")
    finally:
        cursor.close()
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
    elif "medication" in query_lower:
        metrics["data_category"] = "medications"
    elif "blood pressure" in query_lower:
        metrics["data_category"] = "vitals"
    else:
        metrics["data_category"] = "general"
    
    return metrics
```

## CRITICAL CORTEX ANALYST IMPLEMENTATION ERRORS TO AVOID

Based on actual implementation experience, these are the exact errors that will occur and how to prevent them:

### 🚨 ERROR 1: AttributeError - 'RSA' object has no attribute 'public_key_bytes'

**Problem**: Using incorrect method name for extracting public key bytes
```python
# ❌ WRONG: Will cause AttributeError
public_key_der = public_key.public_key_bytes(
    encoding=serialization.Encoding.DER,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
)
```

**Solution**: Use correct method name
```python
# ✅ CORRECT: Use public_bytes, not public_key_bytes
public_key_der = public_key.public_bytes(
    encoding=serialization.Encoding.DER,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
)
```

### 🚨 ERROR 2: 401 Unauthorized - JWT Authentication Failure

**Problem**: Incorrect JWT token generation or account identifier cleaning
```python
# ❌ WRONG: Improper account cleaning and timestamp handling
account = SNOWFLAKE_ACCOUNT.split('.')[0].replace('-', '_').upper()
now = int(time.time())
payload = {
    'iss': f"{account}.{user}.{public_key_fp}",
    'iat': now,
    'exp': now + 3540
}
```

**Solution**: Use proper account cleaning and UTC timestamps
```python
# ✅ CORRECT: Proper account identifier cleaning and UTC timestamps
def clean_account_identifier(acct):
    if not '.global' in acct:
        idx = acct.find('.')
        if idx > 0:
            acct = acct[0:idx]
    acct = acct.replace('.', '-')
    return acct.upper()

clean_account = clean_account_identifier(account)
upper_user = user.upper()

# Use UTC datetime, not time.time()
now = datetime.now(timezone.utc)
lifetime = timedelta(minutes=59)

payload = {
    "iss": f"{clean_account}.{upper_user}.{public_key_fp}",
    "sub": f"{clean_account}.{upper_user}",
    "iat": int(now.timestamp()),
    "exp": int((now + lifetime).timestamp())
}
```

### 🚨 ERROR 3: 400 Bad Request - Semantic Model File Path Issues

**Problem**: Incorrect semantic model file path construction
```python
# ❌ WRONG: Missing stage prefix or incorrect path
semantic_model_file = SNOWFLAKE_SEMANTIC_MODEL_FILE
# Results in: "health_intelligence_semantic_model.yaml" (missing @stage)
```

**Solution**: Always construct full stage path
```python
# ✅ CORRECT: Include full stage path
semantic_model_filename = SNOWFLAKE_SEMANTIC_MODEL_FILE or "health_intelligence_semantic_model.yaml"
semantic_model_file = f"@{SNOWFLAKE_DATABASE}.{SNOWFLAKE_SCHEMA}.RAW_DATA/{semantic_model_filename}"
# Results in: "@HEALTH_INTELLIGENCE.HEALTH_RECORDS.RAW_DATA/health_intelligence_semantic_model.yaml"
```

### 🚨 ERROR 4: JSON Serialization - "Object of type Decimal is not JSON serializable"

**Problem**: Snowflake returns Decimal objects that can't be JSON serialized
```python
# ❌ WRONG: Not handling Decimal types
for value in row:
    if isinstance(value, (datetime, date)):
        converted_row.append(value.isoformat())
    # Missing Decimal handling - will cause JSON error
    else:
        converted_row.append(value)
```

**Solution**: Convert Decimal to float
```python
# ✅ CORRECT: Handle all non-JSON-serializable types
from decimal import Decimal

for value in row:
    if isinstance(value, (datetime, date)):
        converted_row.append(value.isoformat())
    elif isinstance(value, Decimal):
        converted_row.append(float(value))  # Convert Decimal to float
    elif value is None:
        converted_row.append(None)
    else:
        converted_row.append(value)
```

### 🚨 ERROR 5: Missing Required Imports

**Problem**: Missing imports for Cortex Analyst functionality
```python
# ❌ WRONG: Missing required imports
import time
import base64
# Missing: hashlib, timezone, timedelta, Decimal
```

**Solution**: Include all required imports
```python
# ✅ CORRECT: Complete import list for Cortex Analyst
import time
import base64
import hashlib
from decimal import Decimal
from datetime import datetime, date, timezone, timedelta
import requests
import jwt
```

## WORKING CORTEX ANALYST IMPLEMENTATION TEMPLATE

Based on proven working code, use this exact implementation pattern:

```python
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
        semantic_model_filename = SNOWFLAKE_SEMANTIC_MODEL_FILE or "semantic_model.yaml"
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
```

## VALIDATION CHECKLIST FOR CORTEX ANALYST IMPLEMENTATION

Before testing, verify:
- [ ] **Import check**: `from decimal import Decimal` included
- [ ] **Import check**: `from datetime import datetime, date, timezone, timedelta` included  
- [ ] **Import check**: `import hashlib, base64, requests, jwt` included
- [ ] **Method check**: Uses `public_bytes()`, not `public_key_bytes()`
- [ ] **Auth check**: Uses UTC datetime with `datetime.now(timezone.utc)`
- [ ] **Auth check**: Includes proper account identifier cleaning function
- [ ] **Path check**: Semantic model path includes full `@DATABASE.SCHEMA.STAGE/filename` format
- [ ] **Type check**: Query results handler includes Decimal conversion to float
- [ ] **Error check**: HTTP errors include response body in logs for debugging
- [ ] **Env check**: All required environment variables documented and checked
- [ ] **Test path check**: Test scripts use `Path(__file__).parent.parent.parent / "example" / "extraction"` for sample data
- [ ] **Test path check**: Include error message showing checked directory if files not found

### CRITICAL ERRORS TO AVOID

❌ **WRONG: Direct SNOWFLAKE.CORTEX.ANALYST() SQL function call**
```python
# This is INCORRECT and will fail with "Unknown function" error
cortex_query = f"""
    SELECT SNOWFLAKE.CORTEX.ANALYST(
        '{SNOWFLAKE_SEMANTIC_MODEL_FILE}',
        '{query.replace("'", "''")}'
    ) as result
"""
```

❌ **WRONG: Adding visualization logic in MCP tool**
```python
# Don't do this - visualization is handled by Claude in agent instructions
def analyze_results_for_visualization(results, columns, query):
    # This should NOT be in the MCP tool
```

❌ **WRONG: Missing requests dependency**
```toml
# Incomplete dependencies will cause import errors
dependencies = [
    "mcp>=1.0.0",
    "snowflake-connector-python>=3.0.0"
    # Missing "requests>=2.31.0" - needed for REST API calls
]
```

✅ **CORRECT: Use HTTP REST API pattern and return simple results**
- Make HTTP POST request to Cortex Analyst REST endpoint
- Use Snowflake session token for authentication  
- Call `call_cortex_analyst()` to get SQL from HTTP response
- Execute the generated SQL with `execute_query()`
- Return results with basic metadata only
- Let Claude handle visualization in agent instructions

### Why REST API Instead of SQL Function?
The SQL function `SNOWFLAKE.CORTEX.ANALYST()` may not be available in all Snowflake accounts or may require special permissions. The REST API endpoint is more reliable and provides better error handling.

## Testing Approach - Integration Testing

For demos and validation, use **integration tests** that write real data to Snowflake:

### Test Script Pattern
Create a test script that:
1. Uses sample data from `/example/extraction/` directory
2. Calls the import tool with real patient data
3. Writes actual records to Snowflake tables
4. Returns import statistics for verification

### Benefits for Demo
- Shows real data in Snowflake tables
- Provides test data for Cortex Analyst semantic model testing
- Demonstrates the complete workflow end-to-end
- Validates all components work together

### 🚨 CRITICAL: Test Script Path Resolution Error

**Problem**: Test scripts often fail to find sample data files due to incorrect relative path assumptions.

**Common Error**: 
```bash
❌ No data files found in example/extraction/
Checked directory: /Users/.../tools/example/extraction  # WRONG PATH
```

**Root Cause**: Test script assumes wrong directory structure when using relative paths from `tools/health-mcp/` directory.

**Solution**: Always use robust path resolution that accounts for project structure:

```python
# ❌ WRONG: Only goes up one level from tools/health-mcp/
base_path = Path(__file__).parent.parent / "example" / "extraction"
# Results in: tools/example/extraction (DOESN'T EXIST)

# ✅ CORRECT: Go up two levels to reach project root, then navigate to example data
base_path = Path(__file__).parent.parent.parent / "example" / "extraction"  
# Results in: project-root/example/extraction (CORRECT)

# EVEN BETTER: Add error checking and debugging
if not base_path.exists():
    print(f"❌ No data files found in example/extraction/")
    print(f"Checked directory: {base_path}")
    return
```

**Directory Structure Reference**:
```
project-root/
├── tools/
│   └── health-mcp/          ← test script runs from here
│       ├── test_import.py   ← Path(__file__) points here
│       └── src/
└── example/
    └── extraction/          ← target directory is here
        ├── lab_results_2024.json
        ├── medications_2024.json
        └── ...
```

**Path Resolution Logic**:
- `Path(__file__).parent` = `tools/health-mcp/`
- `Path(__file__).parent.parent` = `tools/`
- `Path(__file__).parent.parent.parent` = `project-root/`
- `Path(__file__).parent.parent.parent / "example" / "extraction"` = `project-root/example/extraction/` ✅

### Example Test Scripts

#### Import Test Script (test_import.py)
```python
#!/usr/bin/env python3
"""
Test script for Health MCP import functionality
Tests the snowflake_import_analyze_health_records_v2 tool with sample data
"""
import sys
import json
from pathlib import Path
from pprint import pprint

# Add src to path
sys.path.append(str(Path(__file__).parent / "src"))

from health_mcp import snowflake_import_analyze_health_records_v2

async def test_import():
    """Test the import function with sample data"""
    
    # Robust path resolution for sample files
    base_path = Path(__file__).parent.parent.parent / "example" / "extraction"
    
    if not base_path.exists():
        print(f"❌ No data files found in example/extraction/")
        print(f"Checked directory: {base_path}")
        return
    
    print("🏥 Health MCP Import Tool Test")
    print("=" * 50)
    print(f"Directory: {base_path}")
    
    # Call the import function with directory path
    print("\n🔄 Starting import...")
    result = await snowflake_import_analyze_health_records_v2(
        file_directory=str(base_path)
    )
    
    # Display results
    if result.get("success"):
        print("\n✅ Import successful!")
        stats = result.get("statistics", {})
        print(f"Total records: {stats.get('total_records', 0)}")
        pprint(stats.get("records_by_category", {}))
    else:
        print(f"\n❌ Import failed!")
        print(f"Error: {result.get('error', 'Unknown error')}")
    
    return result

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_import())
```

#### Query Test Script (test_query.py)
```python
#!/usr/bin/env python3
"""
Test script for Health MCP query functionality
Tests the execute_health_query_v2 tool with natural language queries
"""
import sys
import json
import asyncio
from pathlib import Path
from pprint import pprint

# Add src to path
sys.path.append(str(Path(__file__).parent / "src"))

from health_mcp import execute_health_query_v2

# Test queries from agent instructions
TEST_QUERIES = [
    "Show me my cholesterol trends over the past 5 years",
    "What medications am I currently taking?",
    "Show my abnormal lab results from this year",
    "Show my blood pressure trends by month",
    "What medications am I taking for diabetes?",
    "How have my HbA1c levels changed over time?"
]

async def test_single_query(query: str):
    """Test a single query"""
    print(f"\n🔍 Testing Query: {query}")
    print("=" * 60)
    
    try:
        result = await execute_health_query_v2(query)
        
        if result.get("query_successful"):
            print("✅ Query successful!")
            print(f"Interpretation: {result.get('interpretation', 'N/A')}")
            print(f"Results: {result.get('result_count', 0)} records")
            print(f"SQL Generated: {result.get('sql', 'N/A')}")
            
            # Show sample results
            results = result.get("results", [])
            if results:
                print(f"Sample data: {results[0] if len(results) > 0 else 'None'}")
            
            # Show metrics
            metrics = result.get("data_metrics", {})
            if metrics:
                print(f"Data category: {metrics.get('data_category', 'Unknown')}")
        else:
            print("❌ Query failed!")
            print(f"Error: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

async def test_all_queries():
    """Test all predefined queries"""
    print("🧪 Health MCP Query Tool Test Suite")
    print("=" * 60)
    
    for i, query in enumerate(TEST_QUERIES, 1):
        print(f"\n[{i}/{len(TEST_QUERIES)}]", end="")
        await test_single_query(query)

async def interactive_test():
    """Interactive single query testing"""
    print("🔍 Interactive Query Testing")
    print("=" * 40)
    
    while True:
        query = input("\nEnter your health question (or 'quit' to exit): ")
        if query.lower() in ['quit', 'exit', 'q']:
            break
        
        await test_single_query(query)

async def main():
    """Main test function"""
    print("Health MCP Query Tool Test")
    print("=" * 40)
    print("1. Test all predefined queries")
    print("2. Interactive single query test")
    print("3. Quick smoke test")
    
    choice = input("\nChoose test type (1-3): ")
    
    if choice == "1":
        await test_all_queries()
    elif choice == "2":
        await interactive_test()
    elif choice == "3":
        await test_single_query("Show my recent lab results")
    else:
        print("Invalid choice")

if __name__ == "__main__":
    asyncio.run(main())
```

### Running Tests
```bash
cd tools/health-mcp
uv sync  # Install dependencies
uv run test_import.py  # Run test with uv
```

This approach ensures you have real data for the semantic model testing phase.

### Important: Test Execution Guidance
When asked to test the import tool, **provide terminal commands** for the user to run instead of executing tests directly. This allows users to:
- Run commands in their own terminal with proper environment setup
- See real-time output and debug if needed
- Use split-screen to view both Claude Code and terminal output

Example response pattern:
```
"I've created the test script. Here are the commands to run in your terminal:

1. Navigate to the tools directory:
   cd tools/health-mcp

2. Install dependencies:
   uv sync

3. Set environment variables:
   export SNOWFLAKE_USER="your_username"
   [... other exports ...]

4. Run the test:
   uv run test_import.py
"
```