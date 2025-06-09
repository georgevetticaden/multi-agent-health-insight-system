# Claude Desktop Integration Setup

This guide configures Claude Desktop to use the Health MCP server, enabling the complete Health Analyst Agent workflow.

## Prerequisites

✅ **MCP tools tested**: Both `test_import.py` and `test_query.py` should pass  
✅ **Semantic model uploaded**: `health_intelligence_semantic_model.yaml` in Snowflake `@RAW_DATA` stage  
✅ **Health data imported**: Sample data imported via `snowflake_import_analyze_health_records_v2`  
✅ **Environment variables**: All Snowflake credentials configured  

## Step 1: Locate Claude Desktop Config Directory

**macOS:**
```bash
~/Library/Application Support/Claude/
```

**Windows:**
```bash
%APPDATA%\Claude\
```

**Linux:**
```bash
~/.config/Claude/
```

## Step 2: Configure Claude Desktop

1. **Copy the configuration file:**
   ```bash
   # Navigate to your project directory
   cd /Users/aju/Dropbox/Development/Git/multi-agent-health-insight-system-test-run-1
   
   # Copy config to Claude Desktop directory (macOS)
   cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **Update the configuration with your details:**
   
   Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:
   
   ```json
   {
     "mcpServers": {
       "health-analysis-server": {
         "command": "/opt/homebrew/bin/uv",
         "args": [
           "--directory",
           "/Users/aju/Dropbox/Development/Git/multi-agent-health-insight-system-test-run-1/tools/health-mcp",
           "run",
           "src/health_mcp.py"
         ],
         "env": {
           "SNOWFLAKE_USER": "YOUR_ACTUAL_USERNAME",
           "SNOWFLAKE_ACCOUNT": "YOUR_ACTUAL_ACCOUNT",
           "SNOWFLAKE_PRIVATE_KEY_PATH": "~/.ssh/snowflake/snowflake_key.p8",
           "SNOWFLAKE_WAREHOUSE": "COMPUTE_WH",
           "SNOWFLAKE_DATABASE": "HEALTH_INTELLIGENCE",
           "SNOWFLAKE_SCHEMA": "HEALTH_RECORDS",
           "SNOWFLAKE_ROLE": "ACCOUNTADMIN",
           "SNOWFLAKE_SEMANTIC_MODEL_FILE": "health_intelligence_semantic_model.yaml"
         }
       }
     }
   }
   ```

3. **Verify uv path (if needed):**
   ```bash
   which uv
   # Update the "command" path in config if different
   ```

## Step 3: Update Project Path

**IMPORTANT**: Update the absolute path in the config file to match your system:

Replace:
```
"/Users/aju/Dropbox/Development/Git/multi-agent-health-insight-system-test-run-1/tools/health-mcp"
```

With your actual project path:
```bash
# Find your current path
pwd
# Should output something like: /Users/YOUR_USERNAME/path/to/multi-agent-health-insight-system-test-run-1
```

## Step 4: Restart Claude Desktop

1. **Quit Claude Desktop completely**
2. **Restart Claude Desktop**
3. **Look for MCP connection indicator** (usually shows connected servers in UI)

## Step 5: Test Health Analyst Agent

Open a new conversation in Claude Desktop and test these scenarios:

### **Test 1: Agent Introduction**
```
What can you do?
```
**Expected**: Health Analyst welcome message with capabilities overview

### **Test 2: Data Import**
```
I have health data extracted from Apple Health PDFs. The files are located in:
/Users/aju/Dropbox/Development/Git/multi-agent-health-insight-system-test-run-1/example/extraction

Please import and analyze this data.
```
**Expected**: 
- Import statistics dashboard
- Visual breakdown by category (Lab Results, Medications, Vitals, Clinical Data)
- Timeline coverage chart
- Data quality indicators
- Key insights

### **Test 3: Natural Language Queries**
```
What's my cholesterol trend over time?
```
**Expected**: Cholesterol data with trend analysis and visualizations

```
What medications am I currently taking?
```
**Expected**: Current medication list with dosages and frequencies

```
Show my abnormal lab results from this year
```
**Expected**: Filtered abnormal results with reference ranges

## Step 6: Advanced Testing

### **Complex Analytical Query:**
```
Analyze cholesterol relevant medication adherence patterns over that time period and how do they correlate with these cholesterol lab results
```
**Expected**: Multi-factor correlation analysis between medications and lab values

### **Multi-Provider Analysis:**
```
Compare results across different doctors and healthcare systems
```
**Expected**: Provider-based analysis with insights

## Troubleshooting

### **MCP Server Not Connecting**
1. Check Claude Desktop Developer Console for errors
2. Verify all file paths are absolute and correct
3. Ensure uv is installed and accessible
4. Test MCP server independently:
   ```bash
   cd tools/health-mcp
   uv run src/health_mcp.py
   ```

### **Environment Variable Issues**
1. Verify all Snowflake credentials in config
2. Test credentials with standalone tools:
   ```bash
   cd tools/health-mcp
   uv run test_import.py
   uv run test_query.py
   ```

### **Semantic Model Not Found**
1. Verify semantic model is uploaded:
   ```sql
   LIST @HEALTH_INTELLIGENCE.HEALTH_RECORDS.RAW_DATA;
   ```
2. Check file name matches config exactly

### **Query Failures**
1. Ensure health data is imported first
2. Check Cortex Analyst permissions
3. Verify semantic model validates in Snowflake UI

## Configuration Notes

- **Security**: Never commit actual credentials to version control
- **Path handling**: Use absolute paths for reliability
- **Environment isolation**: MCP server runs in isolated uv environment
- **Logging**: Check Claude Desktop logs for detailed debugging

## Success Indicators

✅ **MCP Connection**: Claude Desktop shows connected health-analysis-server  
✅ **Agent Response**: Welcome message displays correctly  
✅ **Import Works**: Dashboard visualizations generate  
✅ **Queries Work**: Natural language questions return health data  
✅ **Visualizations**: Charts and trends display properly  

## Next Steps

Once working, you can:
- **Demo the system**: Show complete health analytics workflow
- **Add more data**: Import additional patient data
- **Extend queries**: Test more complex analytical questions
- **Customize agent**: Modify agent instructions for specific use cases

The Health Analyst Agent is now fully operational in Claude Desktop! 🎉