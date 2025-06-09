#!/usr/bin/env python3
"""
Test script for Health MCP query functionality
Tests the execute_health_query_v2 tool with natural language queries from agent instructions
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
AGENT_INSTRUCTION_QUERIES = [
    "What's my cholesterol trend over time?",
    "Show me my cholesterol trends over the past 5 years",
    "What medications am I currently taking?",
    "Show my abnormal lab results from this year",
    "Show my blood pressure trends by month",
    "How have my vital signs changed over the years?",
    "How have my glucose levels changed over time?",
    "What's my average HbA1c level?",
    "What medications am I taking for diabetes?",
    "Show me all cholesterol medications I've taken",
    "Which medications were discontinued and when?",
    "List my active medical conditions",
    "What was my cholesterol level in March 2023?",
]

# Complex analytical queries from agent instructions
COMPLEX_QUERIES = [
    "Analyze cholesterol relevant medication adherence patterns over that time period and how do they correlate with these cholesterol lab results",
    "How has my HbA1c level changed since I started taking metformin, has my dosage been adjusted over time based on my lab results, and is there a correlation between these changes and my weight measurements during the same period?",
    "Compare my lab results before and after starting a medication",
    "Show all lab tests from my last physical"
]

# Quick smoke test queries
SMOKE_TEST_QUERIES = [
    "Show my recent lab results",
    "What medications am I taking?",
    "Show my cholesterol levels"
]

async def test_single_query(query: str, show_details: bool = True):
    """Test a single query"""
    print(f"\n🔍 Testing Query: {query}")
    print("=" * 80)
    
    try:
        result = await execute_health_query_v2(query)
        
        if result.get("query_successful"):
            print("✅ Query successful!")
            
            # Show interpretation if available
            interpretation = result.get('interpretation', '')
            if interpretation:
                print(f"📝 Interpretation: {interpretation}")
            
            # Show generated SQL
            sql = result.get('sql', '')
            if sql and show_details:
                print(f"🔧 Generated SQL:")
                print(f"   {sql}")
            
            # Show result summary
            result_count = result.get('result_count', 0)
            print(f"📊 Results: {result_count} records returned")
            
            # Show sample results
            results = result.get("results", [])
            if results and show_details:
                print(f"📋 Sample data (first 3 rows):")
                for i, row in enumerate(results[:3]):
                    print(f"   Row {i+1}: {row}")
                if len(results) > 3:
                    print(f"   ... and {len(results) - 3} more rows")
            
            # Show health metrics
            metrics = result.get("data_metrics", {})
            if metrics and show_details:
                print(f"🏥 Health Metrics:")
                print(f"   - Data category: {metrics.get('data_category', 'Unknown')}")
                print(f"   - Health focus: {metrics.get('health_focus', 'Unknown')}")
                print(f"   - Has date data: {metrics.get('has_date_data', False)}")
                print(f"   - Has numeric data: {metrics.get('has_numeric_data', False)}")
                
        else:
            print("❌ Query failed!")
            print(f"Error: {result.get('error', 'Unknown error')}")
            
            # Show Cortex Analyst response if available
            if 'cortex_response' in result:
                print(f"Cortex response: {result['cortex_response']}")
            
            # Show error details
            if result.get('error_details') and show_details:
                print(f"Details: {result.get('error_details')}")
            
    except Exception as e:
        print(f"❌ Test exception: {str(e)}")
        import traceback
        if show_details:
            print("Traceback:")
            print(traceback.format_exc())
    
    return result

async def test_query_suite(queries: list, suite_name: str, show_details: bool = True):
    """Test a suite of queries"""
    print(f"\n🧪 {suite_name}")
    print("=" * 80)
    
    successful_queries = 0
    failed_queries = 0
    
    for i, query in enumerate(queries, 1):
        print(f"\n[{i}/{len(queries)}]", end="")
        result = await test_single_query(query, show_details)
        
        if result.get("query_successful"):
            successful_queries += 1
        else:
            failed_queries += 1
    
    # Summary
    print(f"\n📊 {suite_name} Summary:")
    print(f"✅ Successful: {successful_queries}")
    print(f"❌ Failed: {failed_queries}")
    print(f"📈 Success rate: {(successful_queries / len(queries) * 100):.1f}%")

async def interactive_test():
    """Interactive single query testing"""
    print("🔍 Interactive Health Query Testing")
    print("=" * 50)
    print("Enter natural language health questions to test Cortex Analyst.")
    print("Examples:")
    print("  - Show my cholesterol trends over time")
    print("  - What medications am I currently taking?")
    print("  - How have my glucose levels changed?")
    print()
    
    while True:
        query = input("Enter your health question (or 'quit' to exit): ")
        if query.lower() in ['quit', 'exit', 'q']:
            break
        
        await test_single_query(query, show_details=True)

def check_environment():
    """Check if required environment variables are set"""
    import os
    
    required_vars = [
        "SNOWFLAKE_USER",
        "SNOWFLAKE_ACCOUNT", 
        "SNOWFLAKE_PRIVATE_KEY_PATH",
        "SNOWFLAKE_WAREHOUSE",
        "SNOWFLAKE_DATABASE",
        "SNOWFLAKE_SCHEMA",
        "SNOWFLAKE_ROLE"
    ]
    
    optional_vars = [
        "SNOWFLAKE_SEMANTIC_MODEL_FILE"
    ]
    
    print("🔧 Environment Check for Cortex Analyst:")
    print("=" * 50)
    
    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if value:
            if "KEY" in var:
                print(f"✅ {var}: ***REDACTED***")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: NOT SET")
            missing_vars.append(var)
    
    for var in optional_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {value}")
        else:
            print(f"⚠️  {var}: NOT SET (using default)")
    
    if missing_vars:
        print(f"\n⚠️  Missing required environment variables: {', '.join(missing_vars)}")
        print("Please set these before running query tests:")
        for var in missing_vars:
            print(f"  export {var}='your_value'")
        return False
    else:
        print("\n✅ All required environment variables are set!")
        print("\n📋 Additional Notes:")
        print("- Semantic model must be uploaded to @RAW_DATA stage in Snowflake")
        print("- Health data must be imported first using test_import.py")
        print("- Cortex Analyst must have access to the semantic model file")
        return True

async def main():
    """Main test function"""
    print("🏥 Health MCP Query Tool Test Suite")
    print("=" * 60)
    print("This script tests the execute_health_query_v2 function with:")
    print("1. Agent instruction queries (basic health questions)")
    print("2. Complex analytical queries (correlation analysis)")
    print("3. Interactive testing mode")
    print()
    
    # Check environment first
    if not check_environment():
        print("\n❌ Environment check failed. Please set required variables and try again.")
        return
    
    print("\nChoose test mode:")
    print("1. Quick smoke test (3 basic queries)")
    print("2. Agent instruction queries (13 queries from agent instructions)")
    print("3. Complex analytical queries (4 advanced queries)")
    print("4. All queries (smoke + agent + complex)")
    print("5. Interactive single query test")
    
    choice = input("\nEnter choice (1-5): ").strip()
    
    if choice == "1":
        await test_query_suite(SMOKE_TEST_QUERIES, "Quick Smoke Test", show_details=True)
    elif choice == "2":
        await test_query_suite(AGENT_INSTRUCTION_QUERIES, "Agent Instruction Queries", show_details=False)
    elif choice == "3":
        await test_query_suite(COMPLEX_QUERIES, "Complex Analytical Queries", show_details=True)
    elif choice == "4":
        await test_query_suite(SMOKE_TEST_QUERIES, "Quick Smoke Test", show_details=False)
        await test_query_suite(AGENT_INSTRUCTION_QUERIES, "Agent Instruction Queries", show_details=False)
        await test_query_suite(COMPLEX_QUERIES, "Complex Analytical Queries", show_details=True)
    elif choice == "5":
        await interactive_test()
    else:
        print("Invalid choice. Running smoke test...")
        await test_query_suite(SMOKE_TEST_QUERIES, "Quick Smoke Test", show_details=True)

if __name__ == "__main__":
    print("Health MCP Cortex Analyst Query Test")
    print("=" * 50)
    
    # Run the test
    asyncio.run(main())