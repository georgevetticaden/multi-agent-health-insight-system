# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-agent system for extracting and analyzing health data from Apple Health PDF exports. Two agents work together:
- **Extractor Agent** (COMPLETE): Converts PDFs to structured JSON with 100% accuracy requirement
- **Analyst Agent** (TO BUILD): Imports data to Snowflake and enables natural language querying via Cortex Analyst

## Current Status

✅ **Completed:**
- Extractor Agent configuration and schemas
- Sample extracted JSON files in `/example/extraction/`
- Analyst Agent instructions in `/agents/analyst-agent/config/`

❌ **To Build:**
- Snowflake database schema
- MCP tools for data import and querying
- Semantic model for natural language processing

## Your Task

Help build the Analyst Agent implementation based on:
1. Agent instructions: `/agents/analyst-agent/config/agent-instructions.md`
2. Sample data: `/example/extraction/` 
3. Technical requirements: `/requirements/technical/`
   - `data-modeling-principles.md` - Database design guidance
   - `mcp-tool-requirements.md` - MCP tool structure and dependencies
   - `cortex-analyst-semantic-model-requirements.txt` - Semantic model specifications

## Commands

```bash
# Install dependencies (uses uv package manager)
uv install

# Run tests
uv run pytest

# Format code
uv run black src/
uv run isort src/

# Type checking
uv run mypy src/

# Run MCP health server
uv run python src/health_mcp.py
```

## Architecture

```
User → Extractor Agent → JSON Files → Analyst Agent → Snowflake → Cortex Analyst
         ↓                              ↓
    PDF Documents                  MCP Server (health_mcp.py)
```

Key directories:
- `/agents/`: Agent configurations and instructions
- `/tools/health-mcp/`: MCP server implementation for Snowflake integration
- `/agents/extractor-agent/knowledge/`: JSON schemas for extracted data (lab results, vitals, medications, clinical data)
- `/data-store/snowflake/`: SQL for tables and views
- `/semantic-model/snowflake/`: YAML config for natural language queries (Cortex Analyst semantic models)

## Development Approach - INCREMENTAL BUILD

Please follow this **step-by-step incremental approach**:

### Phase 1: Database Foundation
1. Analyze requirements and sample data
2. Create Snowflake DDL in `/data-store/snowflake/ddl/`
   - **IMPORTANT**: Validate DDL using the checklist in `data-modeling-principles.md`
   - Ensure all syntax is valid Snowflake SQL before finalizing

### Phase 2: Import Tool (First MCP Tool)
3. Build **ONLY** the import tool in `/tools/health-mcp/`:
   - Create `pyproject.toml`
   - Create `src/health_mcp.py` with **ONLY** `snowflake_import_analyze_health_records_v2` tool
   - Create test script for import functionality
   - **DO NOT** create the query tool yet

### Phase 3: Semantic Model
4. Develop semantic model in `/semantic-model/snowflake/`
   - Follow `/requirements/technical/cortex-analyst-semantic-model-requirements.txt`
   - Provide upload instructions to Snowflake RAW_DATA stage

### Phase 4: Query Tool (Second MCP Tool) 
5. **After semantic model is tested**, add the query tool:
   - Add `execute_health_query_v2` function to existing `health_mcp.py`
   - Create test script for query functionality

### Phase 5: Claude Desktop Integration
6. Configure Claude Desktop as MCP host to connect to Health MCP server
7. Test complete Health Analyst Agent workflow in Claude Desktop

## Project Structure

Create files in these specific directories:

```
/data-store/
└── snowflake/
    ├── ddl/
    │   └── health_intelligence_ddl.sql    # Main DDL file
    └── scripts/
        └── verify_import.sql              # Verification queries

/tools/
└── health-mcp/
    ├── pyproject.toml
    ├── src/
    │   └── health_mcp.py                  # Build incrementally
    ├── test_import.py                     # Phase 2
    └── test_query.py                      # Phase 4

/semantic-model/
└── snowflake/
    └── health_intelligence_semantic_model.yaml
```

## Key Requirements

- Database: HEALTH_INTELLIGENCE
- Schema: HEALTH_RECORDS  
- Use Snowflake Cortex Analyst for natural language queries
- Support queries shown in agent instructions
- Generate import statistics for visualization dashboard

## Semantic Model Creation

When asked to create a semantic model for Cortex Analyst:
- **Default location**: `/semantic-model/snowflake/health_intelligence_semantic_model.yaml`
- **Key requirements**: Follow `/requirements/technical/cortex-analyst-semantic-model-requirements.txt`
- **Context sources**: Agent instructions, Snowflake table structure, visualization requirements
- **Auto-provide upload instructions**: Include commands for uploading to Snowflake RAW_DATA stage

## Development Guidelines

1. **MCP Tool Development**: Tools use `@mcp.tool()` decorator in `health_mcp.py`. Required environment variables:
   - SNOWFLAKE_USER, SNOWFLAKE_ACCOUNT, SNOWFLAKE_PRIVATE_KEY_PATH
   - SNOWFLAKE_WAREHOUSE, SNOWFLAKE_DATABASE (HEALTH_INTELLIGENCE), SNOWFLAKE_SCHEMA (HEALTH_RECORDS), SNOWFLAKE_ROLE
   - SNOWFLAKE_SEMANTIC_MODEL_FILE

2. **Data Flow**: Extracted JSON files are organized by year (e.g., `lab_results_2024.json`). The system handles data from 2013-2025.

3. **Schema Validation**: Use document schemas in `/agents/extractor-agent/knowledge/` when processing health data. Each category (lab results, vitals, medications, clinical data) has its own schema.

4. **Testing**: Focus on data extraction accuracy and Snowflake integration. The extractor agent requires 100% accuracy - no missing or incorrect data.

5. **Visualization Components**: React/TypeScript components in `/docs/video/visual-components/` demonstrate system capabilities.

## Testing Guidance

When asked to test the tools:
- **Create test scripts** but don't execute them
- **Provide clear terminal commands** for users to run
- **List commands step-by-step** with explanations
- Let users run tests in their own terminal for better debugging

Example: "Here are the commands to test the import tool:"
```bash
cd tools/health-mcp
uv sync
export SNOWFLAKE_USER="..."
uv run test_import.py
```

## Important Context

- The **agent instructions** define the tools needed and their expected behavior
- The **technical requirements** provide implementation patterns and best practices
- Always cross-reference both when building components
- Tool names and parameters are specified in the agent instructions
- Build incrementally: import tool first, then semantic model, then query tool, then Claude Desktop integration

## Claude Desktop Integration (Phase 5)

After query tool testing is complete, configure Claude Desktop to use the Health MCP server:
- Create `claude_desktop_config.json` configuration file
- Configure MCP server connection with proper environment variables
- Provide setup instructions for testing the complete Health Analyst Agent
- **DO NOT** offer multiple options - this is the standard next step after query tool completion