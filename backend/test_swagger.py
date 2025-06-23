#!/usr/bin/env python3
"""
Test script to verify Swagger documentation is working.
Run this after starting your FastAPI server.
"""

import requests
import json


def test_swagger_endpoints():
    base_url = "http://localhost:8000"

    print("🚀 Testing Swagger Documentation Endpoints")
    print("=" * 50)

    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health Check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health Check Failed: {e}")

    # Test OpenAPI schema
    try:
        response = requests.get(f"{base_url}/openapi.json")
        if response.status_code == 200:
            schema = response.json()
            print(f"✅ OpenAPI Schema: {response.status_code}")
            print(f"   - Title: {schema.get('info', {}).get('title', 'N/A')}")
            print(f"   - Version: {schema.get('info', {}).get('version', 'N/A')}")
            print(f"   - Paths: {len(schema.get('paths', {}))}")
            print(f"   - Tags: {len(schema.get('tags', []))}")
        else:
            print(f"❌ OpenAPI Schema: {response.status_code}")
    except Exception as e:
        print(f"❌ OpenAPI Schema Failed: {e}")

    # Test Swagger UI
    try:
        response = requests.get(f"{base_url}/docs")
        if response.status_code == 200:
            print(
                f"✅ Swagger UI: {response.status_code} - Available at {base_url}/docs"
            )
        else:
            print(f"❌ Swagger UI: {response.status_code}")
    except Exception as e:
        print(f"❌ Swagger UI Failed: {e}")

    # Test ReDoc
    try:
        response = requests.get(f"{base_url}/redoc")
        if response.status_code == 200:
            print(f"✅ ReDoc: {response.status_code} - Available at {base_url}/redoc")
        else:
            print(f"❌ ReDoc: {response.status_code}")
    except Exception as e:
        print(f"❌ ReDoc Failed: {e}")

    print("\n📖 Documentation URLs:")
    print(f"   - Swagger UI: {base_url}/docs")
    print(f"   - ReDoc: {base_url}/redoc")
    print(f"   - OpenAPI JSON: {base_url}/openapi.json")


if __name__ == "__main__":
    test_swagger_endpoints()
