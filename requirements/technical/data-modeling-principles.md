# Data Modeling Principles for Health Analytics

## Core Design Philosophy

### Keep It Simple
- Favor unified designs over normalized complexity
- Optimize for analytics queries, not transactional processing
- Minimize joins for better natural language query performance

### Recommended Patterns

#### Required Tables (3 tables total)
1. **PATIENTS** - Basic patient demographics (patient_id, name, date_of_birth)
2. **HEALTH_RECORDS** - Unified table for all health data
3. **IMPORTS** (or IMPORT_BATCHES) - Track data import operations

#### Patient Data
- Separate PATIENTS table with basic demographics
- Link to HEALTH_RECORDS via patient_id foreign key
- Keep patient data normalized (not embedded)

#### Health Records
- Use a **unified records approach** for all health data types
- Use a discriminator column (like record_type) to distinguish between:
  - Lab results
  - Medications
  - Vital signs
  - Clinical data (conditions, procedures, allergies, immunizations)
- This approach simplifies queries and improves Cortex Analyst compatibility

#### Import Tracking
- Track batch imports for audit and data lineage
- Store metadata about source files and import statistics
- Use VARCHAR to store JSON strings for simplicity
  - `SOURCE_FILES VARCHAR(4000)` to store JSON array of file names
  - `RECORDS_BY_TYPE VARCHAR(4000)` to store JSON object with counts
  - `IMPORT_STATISTICS VARCHAR(16000)` to store detailed import metrics

### Why Unified Design Works Well

1. **Natural Language Friendly**: Fewer tables mean simpler query generation
2. **Flexible Schema**: Easy to add new health data types
3. **Performance**: Single table scans instead of complex joins
4. **Maintenance**: Simpler to understand and modify

### Anti-Patterns to Avoid

❌ Separate tables for each data type (labs, meds, vitals, etc.)
❌ Over-normalization with many lookup tables
❌ Complex hierarchical structures
❌ Separate provider/facility tables unless truly needed

### Critical: Reserved Words That Break Cortex Analyst

❌ **NEVER use these strings in column names - they cause validation failures:**
- Any column containing "NAME" (USER_NAME, ITEM_NAME, PATIENT_NAME, etc.)
- Any column containing "TYPE" (RECORD_TYPE, DATA_TYPE, USER_TYPE, etc.)
- Any column containing "UNIT" (MEASUREMENT_UNIT, BUSINESS_UNIT, etc.)

✅ **Use these alternatives instead:**
- Instead of "NAME" → Use: IDENTITY, DESCRIPTION, LABEL, TITLE
- Instead of "TYPE" → Use: CATEGORY, KIND, CLASS, ROLE
- Instead of "UNIT" → Use: DIMENSION, SCALE, MEASURE, SEGMENT

### Example Query Simplicity

With unified design:
```sql
SELECT * FROM health_records 
WHERE record_type = 'LAB' 
  AND name = 'Cholesterol Total'
```

Instead of:
```sql
SELECT * FROM lab_results l
JOIN patients p ON l.patient_id = p.patient_id
JOIN providers pr ON l.provider_id = pr.provider_id
WHERE l.test_name = 'Cholesterol Total'
```

### Important Design Guidelines

#### Let Cortex Analyst Handle Complexity
- **NO VIEWS AT ALL** - The semantic model will define common query patterns
- **No stored procedures** - Natural language processing replaces predefined functions
- **Base tables only** - Just PATIENTS, HEALTH_RECORDS, and IMPORTS
- **No optional views** - Even for "human inspection" - keep DDL minimal

#### Snowflake-Specific Considerations
- **No explicit indexes** - Snowflake automatically manages micro-partitions and data organization
- **Use clustering keys instead** - For frequently filtered columns, use: `ALTER TABLE table_name CLUSTER BY (column1, column2)`
- **Avoid CREATE INDEX statements** - These will cause errors in standard Snowflake tables
- **No views in base DDL** - Let Cortex Analyst handle query patterns
- **Use VARCHAR for JSON storage** - Simplest approach for storing JSON strings:
  ```sql
  -- RECOMMENDED: Use VARCHAR for JSON strings (simplest, no type conversion issues)
  SOURCE_FILES VARCHAR(4000),  -- Stores JSON array: '["file1.json", "file2.json"]'
  RECORDS_BY_TYPE VARCHAR(4000),  -- Stores JSON object: '{"Lab Results": 50, "Medications": 20}'
  IMPORT_STATISTICS VARCHAR(16000),  -- Stores larger JSON with detailed stats
  
  -- AVOID: Complex types that require special handling
  SOURCE_FILES ARRAY,  -- Causes type mismatch errors with json.dumps()
  SOURCE_FILES VARIANT  -- Works but adds unnecessary complexity
  ```
  
  Note: When you need to query the JSON data, use Snowflake's JSON parsing functions:
  ```sql
  -- Parse JSON string to extract values
  SELECT PARSE_JSON(RECORDS_BY_TYPE)::"Lab Results" as lab_count
  FROM IMPORTS;
  ```
- **Use MERGE for upserts** - Snowflake doesn't support INSERT ... ON DUPLICATE KEY. Use MERGE instead:
  ```sql
  MERGE INTO table_name t
  USING (SELECT ... ) s
  ON t.key = s.key
  WHEN MATCHED THEN UPDATE SET ...
  WHEN NOT MATCHED THEN INSERT ...
  ```

#### Permission Requirements
For Cortex Analyst to work, only one permission is needed:
```sql
-- Grant Cortex Analyst access (assuming ACCOUNTADMIN for demo)
GRANT DATABASE ROLE SNOWFLAKE.CORTEX_USER TO ROLE ACCOUNTADMIN;
```
Note: Don't create or reference custom roles like ANALYST_ROLE - assume ACCOUNTADMIN for demos

#### Required Stage for Semantic Model
Create a stage for uploading the semantic model file:
```sql
-- Create stage for semantic model file
CREATE STAGE IF NOT EXISTS RAW_DATA
    FILE_FORMAT = (TYPE = 'JSON');
```
This stage will be used to store the semantic model YAML file for Cortex Analyst.

#### Table Creation Order
Important: Create tables in this order to avoid foreign key errors:
1. PATIENTS (no dependencies)
2. IMPORTS (depends on PATIENTS)
3. HEALTH_RECORDS (depends on both PATIENTS and IMPORTS)

#### Essential Fields for Unified Design
When creating the HEALTH_RECORDS table, ensure these medication-specific fields are included:
- **FOR_CONDITION** - Critical for understanding why medications are prescribed
- **FREQUENCY** - Essential for dosing schedules (once daily, twice daily, etc.)

These fields may be empty for non-medication records but are crucial for medication analysis.

Remember: The goal is to create a simple, flexible foundation that Cortex Analyst can work with effectively.

## DDL Validation Checklist

**Before finalizing the DDL, validate that:**

### ✅ Correct Snowflake Syntax
- [ ] UUID generation uses `UUID_STRING()` not `GENERATE_UUID()`
- [ ] Primary keys use `PRIMARY KEY` not `PRIMARY KEY CONSTRAINT`
- [ ] Foreign keys are created AFTER all referenced tables exist
- [ ] Default values use valid Snowflake functions: `CURRENT_TIMESTAMP()`, `UUID_STRING()`
- [ ] No CHECK constraints (they cause syntax errors)
- [ ] No CREATE INDEX statements (use CLUSTER BY instead)
- [ ] Comments use `COMMENT ON` syntax, not `ALTER TABLE ... COMMENT`

### ✅ Critical: Cortex Analyst Reserved Words
**NEVER use these strings in ANY part of column names - they cause validation errors:**
- [ ] No column names containing "NAME" (e.g., avoid USER_NAME, FULL_NAME, ITEM_NAME)
- [ ] No column names containing "TYPE" (e.g., avoid RECORD_TYPE, DATA_TYPE, CONTENT_TYPE)  
- [ ] No column names containing "UNIT" (e.g., avoid MEASUREMENT_UNIT, BUSINESS_UNIT)

**Examples of problematic vs. safe column names:**
```sql
-- ❌ PROBLEMATIC: Will cause Cortex Analyst validation errors
PATIENT_NAME → Use: PATIENT_IDENTITY
RECORD_TYPE → Use: RECORD_CATEGORY  
MEASUREMENT_UNIT → Use: MEASUREMENT_DIMENSION
ITEM_NAME → Use: ITEM_DESCRIPTION
USER_TYPE → Use: USER_ROLE
DATA_UNIT → Use: DATA_SEGMENT

-- ✅ SAFE: These work without issues
PATIENT_IDENTITY, RECORD_CATEGORY, MEASUREMENT_DIMENSION
ITEM_DESCRIPTION, USER_ROLE, DATA_SEGMENT
```

### ✅ Data Types
- [ ] Use `VARCHAR(n)` not `TEXT` or `STRING`
- [ ] Use `NUMBER` or `INTEGER` not `INT`
- [ ] Use `TIMESTAMP_NTZ` or `TIMESTAMP_LTZ` not just `TIMESTAMP`
- [ ] JSON data stored as `VARCHAR(4000)` not `ARRAY` or `VARIANT`
- [ ] Primary keys should be `VARCHAR(36)` with `DEFAULT UUID_STRING()`, NOT `NUMBER AUTOINCREMENT`

### ✅ Table Creation Order
1. First: PATIENTS (no dependencies)
2. Second: IMPORTS (references PATIENTS)
3. Last: HEALTH_RECORDS (references both)

### ✅ Required Elements
- [ ] CREATE DATABASE IF NOT EXISTS HEALTH_INTELLIGENCE
- [ ] CREATE SCHEMA IF NOT EXISTS HEALTH_RECORDS
- [ ] CREATE STAGE IF NOT EXISTS RAW_DATA
- [ ] GRANT DATABASE ROLE SNOWFLAKE.CORTEX_USER TO ROLE ACCOUNTADMIN

### ✅ Forbidden Elements
- [ ] NO views (CREATE VIEW statements)
- [ ] NO stored procedures
- [ ] NO functions
- [ ] NO sequences
- [ ] NO triggers

### Common Snowflake DDL Errors to Avoid:
```sql
-- ❌ WRONG: Will cause "Unknown function" error
DEFAULT GENERATE_UUID()

-- ✅ CORRECT: Use Snowflake's UUID function
DEFAULT UUID_STRING()

-- ❌ WRONG: Will cause "unexpected 'CHECK'" error
CREATE TABLE example (
    status VARCHAR(50) CHECK (status IN ('Active', 'Inactive'))
);

-- ✅ CORRECT: No CHECK constraints
CREATE TABLE example (
    status VARCHAR(50)
);

-- ❌ WRONG: Will cause foreign key error
CREATE TABLE health_records (
    import_id VARCHAR(36),
    FOREIGN KEY (import_id) REFERENCES imports(import_id)  -- imports doesn't exist yet!
);

-- ✅ CORRECT: Create tables in dependency order

-- ❌ WRONG: Invalid COMMENT syntax
ALTER TABLE PATIENTS COMMENT = 'Patient demographics';
ALTER TABLE HEALTH_RECORDS ALTER COLUMN NAME COMMENT = 'Test name';

-- ✅ CORRECT: Use COMMENT ON syntax
COMMENT ON TABLE PATIENTS IS 'Patient demographics';
COMMENT ON COLUMN HEALTH_RECORDS.NAME IS 'Test name';

-- ❌ WRONG: AUTOINCREMENT doesn't work well with application-generated IDs
CREATE TABLE PATIENTS (
    PATIENT_ID NUMBER AUTOINCREMENT PRIMARY KEY
);

-- ✅ CORRECT: Use VARCHAR with UUID_STRING() for primary keys
CREATE TABLE PATIENTS (
    PATIENT_ID VARCHAR(36) PRIMARY KEY DEFAULT UUID_STRING()
);
```

## Critical Lessons Learned: Reserved Words

### 🚨 Most Common Cortex Analyst Validation Failure
**Problem**: Column names containing "NAME", "TYPE", or "UNIT" cause validation errors like:
- "SQL compilation error: invalid identifier 'NAME'"
- Semantic model validation failures

**Root Cause**: These strings are treated as reserved words by Cortex Analyst's validation engine, even when they appear as part of compound column names.

**Solution**: Completely avoid these strings in column names:

```sql
-- ❌ THESE WILL FAIL VALIDATION:
PATIENT_NAME, USER_NAME, ITEM_NAME, FULL_NAME
RECORD_TYPE, DATA_TYPE, USER_TYPE, CONTENT_TYPE  
MEASUREMENT_UNIT, BUSINESS_UNIT, PRICE_UNIT

-- ✅ USE THESE ALTERNATIVES INSTEAD:
PATIENT_IDENTITY, USER_IDENTITY, ITEM_DESCRIPTION, FULL_IDENTITY
RECORD_CATEGORY, DATA_CATEGORY, USER_ROLE, CONTENT_CATEGORY
MEASUREMENT_DIMENSION, BUSINESS_SEGMENT, PRICE_SCALE
```

### Validation Checklist Additions
Before deploying any semantic model:
- [ ] **Scan all column names for "NAME" - rename to IDENTITY, DESCRIPTION, LABEL**
- [ ] **Scan all column names for "TYPE" - rename to CATEGORY, KIND, ROLE, CLASS**  
- [ ] **Scan all column names for "UNIT" - rename to DIMENSION, SCALE, MEASURE**
- [ ] **Test semantic model upload to confirm no reserved word errors**

This rule supersedes normal SQL reserved word guidelines - even compound names like `PATIENT_NAME` will fail validation.