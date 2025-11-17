#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Deploy Firestore Indexes
Standalone script to deploy Firestore indexes to staging or production.
"""

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Optional

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


def print_header(message: str):
    """Print a formatted header message."""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{message.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")


def print_success(message: str):
    """Print a success message."""
    print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")


def print_error(message: str):
    """Print an error message."""
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")


def print_warning(message: str):
    """Print a warning message."""
    print(f"{Colors.WARNING}⚠ {message}{Colors.ENDC}")


def print_info(message: str):
    """Print an info message."""
    print(f"{Colors.OKBLUE}ℹ {message}{Colors.ENDC}")


def run_command(command: str, check: bool = True) -> bool:
    """Run a shell command."""
    try:
        subprocess.run(
            command,
            shell=True,
            check=check,
            encoding='utf-8',
            errors='replace'
        )
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Command failed: {command}")
        print_error(f"Error: {e}")
        return False
    except UnicodeDecodeError as e:
        print_error(f"Encoding error running command: {command}")
        print_error(f"Error: {e}")
        return False


def get_project_root() -> Path:
    """Get the project root directory."""
    return Path(__file__).parent.parent.parent


def load_firebaserc() -> Optional[dict]:
    """Load .firebaserc configuration."""
    firebase_dir = get_project_root() / "firebase"
    firebaserc_path = firebase_dir / ".firebaserc"

    if not firebaserc_path.exists():
        print_error(f".firebaserc not found at {firebaserc_path}")
        print_info("Please run setup_firebase_env.py first")
        return None

    with open(firebaserc_path, 'r') as f:
        return json.load(f)


def select_environment() -> Optional[str]:
    """Prompt user to select environment."""
    firebaserc = load_firebaserc()
    if not firebaserc:
        return None

    projects = firebaserc.get('projects', {})
    if not projects:
        print_error("No projects configured in .firebaserc")
        return None

    print(f"\n{Colors.BOLD}Select environment:{Colors.ENDC}")
    environments = list(projects.keys())

    for i, env in enumerate(environments, 1):
        project_id = projects[env]
        print(f"{i}. {env} ({project_id})")

    while True:
        try:
            choice = input("\nEnter choice: ").strip()
            idx = int(choice) - 1
            if 0 <= idx < len(environments):
                return environments[idx]
            else:
                print_error("Invalid choice")
        except (ValueError, KeyboardInterrupt):
            print_error("\nCancelled")
            return None


def show_index_summary():
    """Display summary of indexes that will be deployed."""
    firebase_dir = get_project_root() / "firebase"
    indexes_file = firebase_dir / "config" / "firestore.indexes.json"

    if not indexes_file.exists():
        return

    with open(indexes_file, 'r') as f:
        indexes_config = json.load(f)

    indexes = indexes_config.get('indexes', [])

    print(f"\n{Colors.BOLD}Indexes to be deployed:{Colors.ENDC}")
    for i, index in enumerate(indexes, 1):
        collection = index['collectionGroup']
        fields = [f"{field['fieldPath']} ({field.get('order', field.get('arrayConfig', 'ASCENDING'))})"
                  for field in index['fields']]
        print(f"\n{i}. Collection: {collection}")
        print(f"   Fields: {', '.join(fields)}")

    print(f"\n{Colors.BOLD}Total indexes: {len(indexes)}{Colors.ENDC}")


def deploy_indexes(environment: str) -> bool:
    """
    Deploy Firestore indexes to specified environment.

    Args:
        environment: Environment alias (e.g., 'staging', 'production')

    Returns:
        True if deployment succeeded
    """
    print_header(f"Deploying Firestore Indexes to {environment.upper()}")

    firebaserc = load_firebaserc()
    if not firebaserc:
        return False

    project_id = firebaserc['projects'].get(environment)
    if not project_id:
        print_error(f"Environment '{environment}' not found in .firebaserc")
        return False

    firebase_dir = get_project_root() / "firebase"
    indexes_file = firebase_dir / "config" / "firestore.indexes.json"

    if not indexes_file.exists():
        print_error(f"Indexes file not found: {indexes_file}")
        return False

    print_info(f"Project: {project_id}")
    print_info(f"Indexes file: {indexes_file}")

    # Show index summary
    show_index_summary()

    # Confirm deployment
    print(f"\n{Colors.WARNING}This will deploy Firestore indexes to {environment} ({project_id}){Colors.ENDC}")
    print_warning("Index creation may take several minutes to complete")
    confirm = input("\nContinue? (yes/no): ").strip().lower()

    if confirm != 'yes':
        print_info("Deployment cancelled")
        return False

    # Change to firebase directory
    original_dir = os.getcwd()
    os.chdir(firebase_dir)

    try:
        print_info("\nDeploying indexes...")
        success = run_command(
            f"firebase deploy --only firestore:indexes --project {project_id}",
            check=False
        )

        if success:
            print_success("\nFirestore indexes deployment initiated!")
            print_warning("Note: Index creation may take several minutes to complete")
            print_info(f"Monitor progress: https://console.firebase.google.com/project/{project_id}/firestore/indexes")
            return True
        else:
            print_error("\nDeployment failed")
            print_warning("This usually means Firestore database doesn't exist yet")
            print_info("\nTo fix this:")
            print_info(f"1. Go to: https://console.firebase.google.com/project/{project_id}/firestore")
            print_info("2. Click 'Create database'")
            print_info("3. Choose 'Production mode'")
            print_info("4. Select your region")
            print_info("5. Wait for database creation")
            print_info("6. Re-run this script")
            return False

    finally:
        os.chdir(original_dir)


def main():
    """Main script execution."""
    print_header("Deploy Firestore Indexes")

    # Select environment
    environment = select_environment()
    if not environment:
        sys.exit(1)

    # Deploy indexes
    success = deploy_indexes(environment)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print_error("\n\nDeployment cancelled by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"\n\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
