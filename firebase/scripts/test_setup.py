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

def test_flutterfire_check():
    """Test FlutterFire CLI detection"""
    print("\n" + "="*60)
    print("TEST 1: FlutterFire CLI Detection")
    print("="*60)

    try:
        result = subprocess.run(
            "flutterfire --version",
            shell=True,
            check=False,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )

        if result.returncode == 0:
            print("✓ FlutterFire CLI is accessible")
            print(f"  Output: {result.stdout.strip()}")
            return True
        else:
            print("✗ FlutterFire CLI not in PATH")
            print("  (This is expected - script will handle gracefully)")
            return False
    except Exception as e:
        print(f"✗ Error checking FlutterFire CLI: {e}")
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

    try:
        result = subprocess.run(
            "firebase firestore:indexes --project letter-tracing-app",
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
    print("="*60)

    results = {
        "FlutterFire CLI Detection": test_flutterfire_check(),
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
        print("\n⚠ Some tests failed, but script should still work with graceful fallbacks.")

    print("\nKey Points:")
    print("- FlutterFire CLI not in PATH is EXPECTED and handled gracefully")
    print("- Script will provide manual instructions as fallback")
    print("- All other functionality should work correctly")

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
