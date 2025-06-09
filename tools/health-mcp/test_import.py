#!/usr/bin/env python3
"""
Test script for Health MCP import functionality
Tests the snowflake_import_analyze_health_records_v2 tool with sample data
"""
import sys
import json
import asyncio
from pathlib import Path
from pprint import pprint

# Add src to path
sys.path.append(str(Path(__file__).parent / "src"))

from health_mcp import snowflake_import_analyze_health_records_v2

async def test_import():
    """Test the import function with sample data"""
    
    print("🏥 Health MCP Import Tool Test")
    print("=" * 50)
    
    # Robust path resolution for sample files - go up 3 levels to project root
    base_path = Path(__file__).parent.parent.parent / "example" / "extraction"
    
    print(f"Looking for sample data in: {base_path}")
    
    if not base_path.exists():
        print(f"❌ No data files found in example/extraction/")
        print(f"Checked directory: {base_path}")
        print(f"Expected files:")
        print(f"  - lab_results_*.json")
        print(f"  - medications_*.json")
        print(f"  - vitals_*.json")
        print(f"  - clinical_data_consolidated.json")
        return
    
    # List files found
    import glob
    patterns = ["lab_results_*.json", "medications_*.json", "vitals_*.json", "clinical_data_consolidated.json"]
    found_files = []
    for pattern in patterns:
        files = glob.glob(str(base_path / pattern))
        found_files.extend([Path(f).name for f in files])
    
    print(f"Found {len(found_files)} files: {found_files}")
    
    if not found_files:
        print("❌ No matching JSON files found in the directory")
        return
    
    # Call the import function with directory path
    print("\n🔄 Starting import...")
    print("Note: This requires Snowflake environment variables to be set:")
    print("  - SNOWFLAKE_USER")
    print("  - SNOWFLAKE_ACCOUNT") 
    print("  - SNOWFLAKE_PRIVATE_KEY_PATH")
    print("  - SNOWFLAKE_WAREHOUSE")
    print("  - SNOWFLAKE_DATABASE") 
    print("  - SNOWFLAKE_SCHEMA")
    print("  - SNOWFLAKE_ROLE")
    print()
    
    try:
        result = await snowflake_import_analyze_health_records_v2(
            file_directory=str(base_path)
        )
        
        # Display results
        print("=" * 60)
        if result.get("success"):
            print("✅ Import successful!")
            print(f"Patient: {result.get('patient_name', 'N/A')}")
            print(f"DOB: {result.get('patient_dob', 'N/A')}")
            print(f"Total records: {result.get('total_records', 0)}")
            
            # Display statistics
            stats = result.get("statistics", {})
            print(f"\n📊 Import Statistics:")
            print(f"Records by category:")
            for category, count in stats.get("records_by_category", {}).items():
                print(f"  - {category}: {count}")
            
            print(f"\n📅 Timeline coverage:")
            timeline = stats.get("timeline_coverage", {})
            for year, count in sorted(timeline.items()):
                print(f"  - {year}: {count} records")
            
            print(f"\n📈 Data Quality:")
            quality = stats.get("data_quality", {})
            for metric, data in quality.items():
                if isinstance(data, dict):
                    print(f"  - {metric}: {data.get('count', 0)}/{data.get('total', 0)} ({data.get('percentage', 0)}%)")
            
            print(f"\n💡 Key Insights:")
            for insight in stats.get("key_insights", []):
                print(f"  - {insight}")
                
        else:
            print("❌ Import failed!")
            print(f"Error: {result.get('error', 'Unknown error')}")
            if result.get('error_details'):
                print(f"Details: {result.get('error_details')}")
        
        print("=" * 60)
        return result
        
    except Exception as e:
        print(f"❌ Test failed with exception: {str(e)}")
        import traceback
        print("Traceback:")
        print(traceback.format_exc())

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
    
    print("🔧 Environment Check:")
    print("=" * 30)
    
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
    
    if missing_vars:
        print(f"\n⚠️  Missing environment variables: {', '.join(missing_vars)}")
        print("Please set these before running the test:")
        for var in missing_vars:
            print(f"  export {var}='your_value'")
        return False
    else:
        print("\n✅ All required environment variables are set!")
        return True

if __name__ == "__main__":
    print("Health MCP Import Tool Test")
    print("=" * 40)
    
    # Check environment first
    if not check_environment():
        print("\n❌ Environment check failed. Please set required variables and try again.")
        sys.exit(1)
    
    print("\n" + "=" * 40)
    
    # Run the test
    asyncio.run(test_import())