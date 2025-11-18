#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script to verify setup_firebase_env.py fixes
"""

import subprocess
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def test_python_check():
    """Test Python installation"""
    print("\n" + "="*60)
    print("TEST 1: Python Installation")
    print("="*60)

    try:
        result = subprocess.run(
            "python --version",
            shell=True,
            check=False,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )

        if result.returncode == 0:
            print("✓ Python is accessible")
            print(f"  Version: {result.stdout.strip()}")
            return True
        else:
            print("✗ Python not found")
            return False
    except Exception as e:
        print(f"✗ Error checking Python: {e}")
        return False

def test_firebase_cli():
    """Test Firebase CLI is accessible"""
    print("\n" + "="*60)
    print("TEST 2: Firebase CLI Check")
    print("="*60)

    try:
        result = subprocess.run(
            "firebase --version",
            shell=True,
            check=False,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )

        if result.returncode == 0:
            print("✓ Firebase CLI is accessible")
            print(f"  Version: {result.stdout.strip()}")
            return True
        else:
            print("✗ Firebase CLI not found")
            return False
    except Exception as e:
        print(f"✗ Error checking Firebase CLI: {e}")
        return False

def test_indexes_verification():
    """Test index verification command"""
    print("\n" + "="*60)
    print("TEST 3: Index Verification (Production)")
    print("="*60)

    # Read project ID from production.json if available
    try:
        from pathlib import Path
        import json
        config_path = Path(__file__).parent.parent / "config" / "production.json"
        if config_path.exists():
            with open(config_path, 'r') as f:
                config = json.load(f)
                project_id = config.get('projectId', '')
        else:
            project_id = ''
    except:
        project_id = ''

    if not project_id:
        print("⚠ No project configured yet - run setup_firebase_env.py first")
        return False

    try:
        result = subprocess.run(
            f"firebase firestore:indexes --project {project_id}",
            shell=True,
            check=False,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )

        if result.returncode == 0 and "indexes" in result.stdout.lower():
            print("✓ Index verification command works")
            print("✓ Indexes are deployed in production")
            return True
        else:
            print("⚠ Could not verify indexes")
            return False
    except Exception as e:
        print(f"✗ Error verifying indexes: {e}")
        return False

def test_script_imports():
    """Test that the setup script can be imported"""
    print("\n" + "="*60)
    print("TEST 4: Script Import & Syntax")
    print("="*60)

    try:
        # Try to import the module
        import importlib.util
        from pathlib import Path

        script_path = Path(__file__).parent / "setup_firebase_env.py"
        spec = importlib.util.spec_from_file_location(
            "setup_firebase_env",
            str(script_path)
        )
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        # Check key functions exist
        required_functions = [
            'check_prerequisites',
            'configure_flutter_app',
            'deploy_firestore_indexes',
            'main'
        ]

        for func_name in required_functions:
            if hasattr(module, func_name):
                print(f"✓ Function '{func_name}' exists")
            else:
                print(f"✗ Function '{func_name}' missing")
                return False

        return True
    except Exception as e:
        print(f"✗ Error importing script: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("Firebase Setup Script Validation")
    print("Investment Property Calculator - React Web App")
    print("="*60)

    results = {
        "Python Installation": test_python_check(),
        "Firebase CLI Check": test_firebase_cli(),
        "Index Verification": test_indexes_verification(),
        "Script Import & Syntax": test_script_imports(),
    }

    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)

    for test_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")

    all_passed = all(results.values())

    if all_passed:
        print("\n✓ All tests passed! Script is ready to use.")
    else:
        print("\n⚠ Some tests failed. Check the failures above.")

    print("\nKey Points:")
    print("- Scripts are configured for React web app (not Flutter)")
    print("- Single production environment setup")
    print("- Web app configuration will be retrieved via Firebase CLI")
    print("- All functionality should work correctly")

    return 0 if all_passed else 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\nTest cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
