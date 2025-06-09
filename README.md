# Multi-Agent Health Insight System
## Transform Your Apple Health Data into Actionable Intelligence

> **A comprehensive multi-agent system that extracts, analyzes, and visualizes 12+ years of health data from Apple Health exports using Claude Desktop, Snowflake, and advanced AI agents.**

[![Architecture](docs/images/arch-images/multi-agent-component-architecture.png)](docs/images/arch-images/multi-agent-component-architecture.png)

## Overview

This project demonstrates the power of modern AI agent architectures by solving a real-world problem: **Apple Health data is rich but unusable**. Despite having comprehensive health records spanning multiple providers, users can't perform meaningful analysis, track trends, or correlate medications with outcomes.

Our solution transforms 200+ page Apple Health PDFs into a conversational health intelligence system with **100% extraction accuracy** and natural language querying capabilities.

## Architecture & Technology Stack

[![Agent Building Tooling Stack](docs/images/arch-images/agent-building-tooling-stack.png)](docs/images/arch-images/agent-building-tooling-stack.png)

The system leverages three core technologies:
- **Claude Desktop**: No-code agent creation with natural language instructions
- **Model Context Protocol (MCP)**: Seamless connections between agents and enterprise systems
- **Snowflake Cortex**: Enterprise-grade analytics with natural language processing

## Problem Statement

**Real-world challenge**: Apple Health aggregates comprehensive medical data but provides no analytical capabilities.

**What users need but can't do:**
- ❌ Track cholesterol trends over time
- ❌ Identify abnormal lab results quickly  
- ❌ Correlate medication changes with health outcomes
- ❌ Generate insights from years of health history
- ❌ Share meaningful data visualizations with healthcare providers

**Our solution**: A multi-agent system that transforms static health exports into interactive, conversational health intelligence.

## System Components

### 1. Health Data Extractor Agent
**Role**: Schema-based extraction with 100% accuracy requirement

**Capabilities**:
- Processes 200+ page Apple Health PDF exports
- Extracts data using Claude Opus 4 with structured JSON schemas
- Organizes by clinical type and year to optimize context windows
- Validates extraction accuracy against source documents

**Configuration**:
- **Agent Platform**: Claude Desktop
- **LLM**: Claude Opus 4 (document intelligence optimized)
- **Knowledge Base**: Apple Health PDF + JSON extraction schemas
- **Output**: Structured JSON files by category and year

### 2. Health Analyst Agent  
**Role**: Data ingestion, analytics, and natural language querying

**Capabilities**:
- Imports extracted JSON into Snowflake data warehouse
- Enables natural language health queries via Cortex Analyst
- Generates interactive visualizations using Claude Artifacts
- Provides comprehensive health dashboards and trend analysis

**Configuration**:
- **Agent Platform**: Claude Desktop
- **LLM**: Claude Opus 4 
- **Tools**: Custom MCP Server with Snowflake integration
- **Output**: Interactive React visualizations and health insights

## Sample Analytics & Visualizations

Our system generates comprehensive health insights:

### Cholesterol Trend Analysis (2013-2025)
[![Cholesterol Analysis](docs/images/query-analysis-images/query-1-cholesterol-trend-analysis.png)](docs/images/query-analysis-images/query-1-cholesterol-trend-analysis.png)

**Query**: *"What's my cholesterol trend over the past decade?"*

**Insights Generated**:
- 33% decrease in total cholesterol over 12 years
- Identification of concerning triglyceride spike in 2025
- Correlation with medication adherence patterns
- Clear visualization of normal ranges vs. actual values

### Advanced Correlation Analysis
[![Medication Correlation](docs/images/query-analysis-images/query-2-medication-lab-correlation.png)](docs/images/query-analysis-images/query-2-medication-lab-correlation.png)

**Query**: *"Analyze cholesterol medication adherence patterns and correlate with lab results over time"*

**Demonstrates**:
- Multi-factor analysis across medications, labs, and dosing
- Timeline correlation between statin therapy and cholesterol improvement
- Impact of dosage adjustments on health outcomes

### Abnormal Lab Detection
[![Abnormal Labs](docs/images/query-analysis-images/query-3-abnormal-lab-results.png)](docs/images/query-analysis-images/query-3-abnormal-lab-results.png)

**Query**: *"Show my abnormal lab results from recent tests"*

**Features**:
- Automated detection of values outside normal ranges
- Trend identification across multiple biomarkers
- Clinical relevance scoring and recommendations

### Complex Multi-Factor Analysis
[![Weight Correlation](docs/images/query-analysis-images/query-4-weight-med-lab-correlation.png)](docs/images/query-analysis-images/query-4-weight-med-lab-correlation.png)

**Query**: *"How has my HbA1c changed since starting metformin, and is there correlation with weight measurements?"*

**Advanced Analytics**:
- Three-way correlation analysis (medication + labs + vitals)
- Statistical significance testing
- Predictive trend modeling
- Clinical decision support insights

## Technical Implementation

### Data Architecture
```
Database: HEALTH_INTELLIGENCE
Schema: HEALTH_RECORDS
Tables: PATIENTS, HEALTH_RECORDS, IMPORTS
```

**Design Principles**:
- Unified health records table (no separate tables per data type)
- Optimized for natural language query generation
- Snowflake Cortex Analyst compatible schema design
- Enterprise-grade data lineage and audit trails

### Custom MCP Server Tools

#### 1. Health Data Import Tool
```python
@mcp.tool()
async def snowflake_import_analyze_health_records_v2():
    """Import extracted health JSON files into Snowflake warehouse"""
```

**Features**:
- Batch processing of JSON extraction files
- Data validation and quality reporting
- Import statistics and visualization dashboard generation
- Error handling and rollback capabilities

#### 2. Natural Language Query Tool  
```python
@mcp.tool()
async def execute_health_query_v2():
    """Execute natural language health queries via Cortex Analyst"""
```

**Capabilities**:
- Snowflake Cortex Analyst integration
- Semantic model-powered SQL generation
- Complex multi-table joins and correlations
- Real-time query execution and result formatting

### Semantic Model Configuration
**File**: `semantic-model/snowflake/health_intelligence_semantic_model.yaml`

**Features**:
- Business-friendly data definitions for Cortex Analyst
- Pre-configured health metrics and relationships
- Natural language query optimization
- Support for complex temporal and correlation queries

## Getting Started

### Prerequisites
- **Claude Desktop** (for agent creation and management)
- **Snowflake Account** (for data warehousing and Cortex Analyst)
- **Python 3.9+** with `uv` package manager
- **Apple Health Export** (PDF format)

### Step 1: Export Your Apple Health Data

1. Open Apple Health app on iPhone
2. Tap your profile picture (top right)
3. Scroll down to "Export All Health Data"
4. Share the generated ZIP file
5. Extract and locate the `export.pdf` file (200+ pages)

### Step 2: Build the Health Data Extractor Agent

#### Create Agent in Claude Desktop
1. Open Claude Desktop
2. Create new project: "Health Data Extractor Agent"
3. Select Claude Opus 4 as the LLM
4. Upload agent instructions: [`agents/extractor-agent/config/agent-instructions.md`](agents/extractor-agent/config/agent-instructions.md)

#### Configure Knowledge Base
1. Upload your Apple Health `export.pdf`
2. Upload extraction schemas from [`agents/extractor-agent/knowledge/`](agents/extractor-agent/knowledge/):
   - `clinical-data-extraction-schema.json`
   - `lab-results-extraction-schema.json`
   - `medications-extraction-schema.json`
   - `vitals-extraction-schema.json`

#### Extract Your Health Data
1. Start with: *"Extract my lab results into organized JSON files"*
2. Continue with: *"Extract my medications"*, *"Extract my vitals"*, *"Extract my clinical data"*
3. Download all generated JSON artifacts
4. Save to a local directory (e.g., `extracted-data/`)

### Step 3: Set Up Snowflake Database

#### Create Database Infrastructure
```sql
-- Execute the DDL script
source data-store/snowflake/ddl/health_intelligence_ddl.sql
```

This creates:
- `HEALTH_INTELLIGENCE` database
- `HEALTH_RECORDS` schema with tables: `PATIENTS`, `HEALTH_RECORDS`, `IMPORTS`
- Required stages and permissions for Cortex Analyst

#### Upload Semantic Model
```bash
# Upload semantic model to Snowflake stage
PUT file://semantic-model/snowflake/health_intelligence_semantic_model.yaml @RAW_DATA;
```

### Step 4: Configure MCP Server

#### Install Dependencies
```bash
cd tools/health-mcp
uv install
```

#### Set Environment Variables
```bash
export SNOWFLAKE_USER="your_username"
export SNOWFLAKE_ACCOUNT="your_account"
export SNOWFLAKE_PRIVATE_KEY_PATH="/path/to/your/private_key.p8"
export SNOWFLAKE_WAREHOUSE="your_warehouse"
export SNOWFLAKE_DATABASE="HEALTH_INTELLIGENCE"
export SNOWFLAKE_SCHEMA="HEALTH_RECORDS"
export SNOWFLAKE_ROLE="ACCOUNTADMIN"
export SNOWFLAKE_SEMANTIC_MODEL_FILE="@RAW_DATA/health_intelligence_semantic_model.yaml"
```

#### Test MCP Tools
```bash
# Test data import functionality
uv run test_import.py

# Test natural language querying
uv run test_query.py
```

### Step 5: Build the Health Analyst Agent

#### Create Agent in Claude Desktop
1. Create new project: "Health Analyst Agent"
2. Select Claude Opus 4 as the LLM
3. Upload agent instructions: [`agents/analyst-agent/config/agent-instructions.md`](agents/analyst-agent/config/agent-instructions.md)

#### Configure MCP Servers
1. Open Claude Desktop settings
2. Add MCP server configuration:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/path/to/extracted-data"]
    },
    "health-mcp": {
      "command": "uv",
      "args": ["--directory", "/path/to/tools/health-mcp", "run", "python", "src/health_mcp.py"],
      "env": {
        "SNOWFLAKE_USER": "your_username",
        "SNOWFLAKE_ACCOUNT": "your_account"
      }
    }
  }
}
```

### Step 6: Analyze Your Health Data

#### Import Data
Share the path to your extracted JSON files with the Health Analyst Agent:
*"Please import my health data from /path/to/extracted-data/"*

#### Start Querying
Try these example queries:
- *"What's my cholesterol trend over the past 5 years?"*
- *"Show abnormal lab results from recent tests"*
- *"Correlate my blood pressure medications with my readings"*
- *"How has my HbA1c changed since starting metformin?"*

## Development Commands

```bash
# Install dependencies
uv install

# Run tests
uv run pytest

# Format code
uv run black src/
uv run isort src/

# Type checking
uv run mypy src/

# Run MCP health server locally
uv run python src/health_mcp.py
```

## Project Structure

```
├── agents/                          # Agent configurations
│   ├── extractor-agent/            # Health Data Extractor Agent
│   │   ├── config/                 # Agent instructions and descriptions
│   │   └── knowledge/              # JSON extraction schemas
│   └── analyst-agent/              # Health Analyst Agent
│       └── config/                 # Agent instructions
├── data-store/                     # Database schemas and scripts
│   └── snowflake/
│       └── ddl/                    # Snowflake DDL for health database
├── semantic-model/                 # Cortex Analyst configuration
│   └── snowflake/                  # YAML semantic model definitions
├── tools/                          # Custom MCP server implementation
│   └── health-mcp/                 # Snowflake integration tools
├── example/                        # Sample extracted health data
│   └── extraction/                 # JSON files by category and year
├── docs/                           # Documentation and demo materials
│   ├── images/                     # Architecture diagrams and screenshots
│   └── videos/                     # Demo video scripts and flows
└── requirements/                   # Technical specifications
    └── technical/                  # Implementation requirements
```

## Key Features

### 🎯 **100% Extraction Accuracy**
- Schema-based extraction with validation
- Character-for-character precision requirements
- Comprehensive error detection and correction

### 🧠 **Advanced Natural Language Processing**
- Snowflake Cortex Analyst integration
- Complex multi-table correlation queries
- Intelligent query preprocessing and enhancement

### 📊 **Interactive Visualizations**
- Real-time React component generation
- Clinical-grade charts with normal range overlays
- Mobile-responsive health dashboards

### 🔐 **Enterprise-Grade Security**
- Snowflake enterprise data platform
- Encrypted connections and secure authentication
- Audit trails and data lineage tracking

### 🚀 **Scalable Architecture**
- Multi-agent design patterns
- Model Context Protocol for extensibility
- Comprehensive error handling and monitoring

## Demo Videos

### Part 1: Building Agents with Claude Desktop
**Coming Soon**: Complete walkthrough of agent creation, configuration, and health data extraction workflow.

### Part 2: Implementing MCP Tools with Claude Code  
**Coming Soon**: Technical deep-dive into building custom MCP servers, database integration, and semantic model development.

## Use Cases & Applications

### Personal Health Management
- Track biomarker trends over years
- Identify medication effectiveness patterns
- Prepare data-driven reports for healthcare providers
- Monitor health goals and lifestyle interventions

### Healthcare Provider Integration
- Supplement patient visits with comprehensive historical data
- Identify patterns across multiple provider systems
- Support clinical decision-making with longitudinal insights
- Generate automated health summaries

### Research & Analytics
- Population health trend analysis (anonymized)
- Medication effectiveness studies
- Health outcome correlation research
- Preventive care optimization

## Technical Highlights

### Agent Architecture Innovation
- **Multi-Agent Specialization**: Each agent optimized for specific tasks (extraction vs. analysis)
- **Context Window Optimization**: Intelligent data chunking strategies for large document processing
- **Tool Composition**: Custom MCP tools that extend agent capabilities beyond base models

### Data Engineering Excellence
- **Unified Health Records Model**: Simplified schema design optimized for natural language queries
- **Semantic Model Engineering**: Business-friendly data definitions that enable complex query generation
- **Real-time Analytics Pipeline**: From extraction to visualization in minutes, not hours

### Product Management Vision
- **User-Centric Design**: Complex technical implementation hidden behind simple natural language interface
- **Scalable Architecture**: Foundation that supports enterprise deployment and multi-tenant usage
- **Extensible Framework**: MCP-based tool ecosystem that supports rapid feature development

## Future Roadmap

### Enhanced Analytics Capabilities
- [ ] Predictive health modeling and risk assessment
- [ ] Integration with wearable device streams (Apple Watch, etc.)
- [ ] AI-powered health recommendations and goal setting
- [ ] Multi-patient family health analysis

### Enterprise Features
- [ ] Healthcare provider API integrations
- [ ] HIPAA compliance and audit logging
- [ ] Multi-tenant support for healthcare organizations
- [ ] Real-time alerting and monitoring systems

### Platform Extensions
- [ ] Mobile app for health data capture and insights
- [ ] Integration with electronic health record (EHR) systems
- [ ] Support for additional health data formats (FHIR, HL7)
- [ ] Advanced ML models for pattern recognition

## Contributing

This project serves as a reference implementation for building multi-agent systems. Key areas for contribution:

1. **Additional Health Data Sources**: Expand support beyond Apple Health
2. **Enhanced Visualizations**: New chart types and interactive features  
3. **Advanced Analytics**: ML models for predictive health insights
4. **Tool Ecosystem**: Additional MCP tools for healthcare integrations

## Author

**Product Management Executive & Technical Leader**

*Demonstrating the intersection of technical depth, product vision, and execution capability in AI agent development.*

**Portfolio Highlights**:
- Multi-agent system architecture and implementation
- Custom MCP server development for enterprise integrations
- Natural language interface design for complex data systems
- Advanced health analytics platform

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

*Transform your health data from a static export into dynamic, actionable intelligence. Experience the future of personal health analytics today.*