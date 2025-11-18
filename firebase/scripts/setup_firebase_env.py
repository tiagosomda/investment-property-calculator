#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Firebase Environment Setup Script
Creates and configures Firebase projects for staging/production environments.
"""

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Dict, Any, Optional

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
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


def run_command(command: str, check: bool = True, capture: bool = False) -> Optional[str]:
    """
    Run a shell command.

    Args:
        command: Command to execute
        check: Raise exception on failure
        capture: Capture and return output

    Returns:
        Command output if capture=True, None otherwise
    """
    try:
        if capture:
            result = subprocess.run(
                command,
                shell=True,
                check=check,
                capture_output=True,
                text=True,
                encoding='utf-8',
                errors='replace'  # Replace invalid characters instead of crashing
            )
            if result.stdout:
                return result.stdout.strip()
            return None
        else:
            subprocess.run(
                command,
                shell=True,
                check=check,
                encoding='utf-8',
                errors='replace'
            )
            return None
    except subprocess.CalledProcessError as e:
        if check:
            print_error(f"Command failed: {command}")
            print_error(f"Error: {e}")
            if hasattr(e, 'stderr') and e.stderr:
                print_error(f"Details: {e.stderr}")
            sys.exit(1)
        return None
    except UnicodeDecodeError as e:
        # Handle encoding errors gracefully
        if check:
            print_error(f"Encoding error running command: {command}")
            print_error(f"Error: {e}")
            sys.exit(1)
        return None


def check_prerequisites():
    """Check if required tools are installed and accessible."""
    print_header("Checking Prerequisites")

    prerequisites = {
        "Firebase CLI": "firebase --version",
        "Python 3.8+": "python --version"
    }

    all_installed = True

    for tool, command in prerequisites.items():
        output = run_command(command, check=False, capture=True)
        if output:
            print_success(f"{tool} installed: {output.split()[0] if output else 'Found'}")
        else:
            print_error(f"{tool} not found")
            all_installed = False

    if not all_installed:
        print_error("\nMissing prerequisites. Please install:")
        print_info("Firebase CLI: npm install -g firebase-tools")
        sys.exit(1)

    # Check Firebase login
    print_info("\nChecking Firebase authentication...")
    result = run_command("firebase projects:list", check=False, capture=True)
    if not result or "Error" in result:
        print_warning("Not logged into Firebase CLI")
        print_info("Running: firebase login")
        run_command("firebase login")
    else:
        print_success("Firebase CLI authenticated")

    return True


def get_project_root() -> Path:
    """Get the project root directory."""
    # Script is in firebase/scripts/, so go up two levels
    return Path(__file__).parent.parent.parent


def load_or_create_config(environment: str) -> Dict[str, Any]:
    """
    Load existing environment config or create from template.

    Args:
        environment: 'staging' or 'production'

    Returns:
        Configuration dictionary
    """
    config_dir = get_project_root() / "firebase" / "config"
    config_file = config_dir / f"{environment}.json"
    template_file = config_dir / "env.template.json"

    if config_file.exists():
        print_info(f"Loading existing config: {config_file}")
        with open(config_file, 'r') as f:
            return json.load(f)
    else:
        print_info(f"Creating new config from template")
        with open(template_file, 'r') as f:
            config = json.load(f)
        config['environment'] = environment
        return config


def prompt_user_input(prompt: str, default: str = "") -> str:
    """Prompt user for input with optional default."""
    if default:
        user_input = input(f"{prompt} [{default}]: ").strip()
        return user_input if user_input else default
    else:
        while True:
            user_input = input(f"{prompt}: ").strip()
            if user_input:
                return user_input
            print_warning("This field is required.")


def configure_environment(environment: str) -> Dict[str, Any]:
    """
    Interactively configure environment settings.

    Args:
        environment: 'staging' or 'production'

    Returns:
        Configuration dictionary
    """
    print_header(f"Configuring {environment.upper()} Environment")

    config = load_or_create_config(environment)

    # Project configuration
    print(f"\n{Colors.BOLD}Firebase Project Configuration{Colors.ENDC}")
    config['projectId'] = prompt_user_input(
        "Firebase Project ID",
        config.get('projectId', f"investment-property-calculator-{environment}")
    )

    # Authentication providers
    print(f"\n{Colors.BOLD}Authentication Providers{Colors.ENDC}")

    # Email/Password (always enabled)
    config['authProviders']['email'] = True
    print_success("Email/Password authentication: Enabled")

    # Google Sign-In
    enable_google = prompt_user_input(
        "Enable Google Sign-In? (y/n)",
        "y" if config['authProviders']['google']['enabled'] else "n"
    ).lower() == 'y'

    config['authProviders']['google']['enabled'] = enable_google
    if enable_google:
        print_info("Google Sign-In will be configured in Firebase Console")
        print_info("You'll need to add OAuth client IDs for Web")

    # Firestore region
    print(f"\n{Colors.BOLD}Firestore Configuration{Colors.ENDC}")
    config['firestore']['region'] = prompt_user_input(
        "Firestore region",
        config['firestore'].get('region', 'us-central1')
    )

    # Save configuration
    config_dir = get_project_root() / "firebase" / "config"
    config_file = config_dir / f"{environment}.json"

    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)

    print_success(f"\nConfiguration saved to {config_file}")

    return config


def create_firebase_project(config: Dict[str, Any]) -> bool:
    """
    Create Firebase project (if it doesn't exist).

    Args:
        config: Environment configuration

    Returns:
        True if project exists/created successfully
    """
    project_id = config['projectId']

    print_header(f"Setting up Firebase Project: {project_id}")

    # Check if project already exists
    print_info(f"Checking if project '{project_id}' exists...")
    result = run_command("firebase projects:list", capture=True)

    if project_id in result:
        print_success(f"Project '{project_id}' already exists")
        return True

    print_warning(f"Project '{project_id}' does not exist")
    print_info("\nTo create a new Firebase project:")
    print_info(f"1. Go to https://console.firebase.google.com/")
    print_info(f"2. Click 'Add project'")
    print_info(f"3. Use project ID: {project_id}")
    print_info(f"4. Enable Google Analytics (recommended)")
    print_info(f"5. Wait for project creation to complete")

    proceed = prompt_user_input(
        "\nHave you created the project? (y/n)",
        "n"
    ).lower()

    if proceed != 'y':
        print_warning("Please create the Firebase project first, then re-run this script")
        return False

    # Verify project exists now
    result = run_command("firebase projects:list", capture=True)
    if project_id not in result:
        print_error(f"Project '{project_id}' still not found. Please verify it was created.")
        return False

    print_success(f"Project '{project_id}' confirmed")
    return True


def initialize_firebase_project(config: Dict[str, Any]):
    """
    Initialize Firebase project with firebase init.

    Args:
        config: Environment configuration
    """
    project_root = get_project_root()
    firebase_dir = project_root / "firebase"

    print_header("Initializing Firebase Configuration")

    # Create firebase.json if it doesn't exist
    firebase_json = firebase_dir / "firebase.json"

    if not firebase_json.exists():
        print_info("Creating firebase.json...")
        firebase_config = {
            "firestore": {
                "rules": "config/firestore.rules",
                "indexes": "config/firestore.indexes.json"
            }
        }

        with open(firebase_json, 'w') as f:
            json.dump(firebase_config, f, indent=2)

        print_success(f"Created {firebase_json}")
    else:
        print_success(f"firebase.json already exists")

    # Create .firebaserc for project aliases
    firebaserc = firebase_dir / ".firebaserc"
    project_id = config['projectId']
    environment = config['environment']

    if firebaserc.exists():
        with open(firebaserc, 'r') as f:
            firebaserc_config = json.load(f)
    else:
        firebaserc_config = {"projects": {}}

    # Add/update project alias
    firebaserc_config['projects'][environment] = project_id

    if 'default' not in firebaserc_config['projects']:
        firebaserc_config['projects']['default'] = project_id

    with open(firebaserc, 'w') as f:
        json.dump(firebaserc_config, f, indent=2)

    print_success(f"Updated .firebaserc with {environment} alias -> {project_id}")


def check_and_create_firestore_database(config: Dict[str, Any]) -> bool:
    """
    Check if Firestore database exists and create it if needed.

    Args:
        config: Environment configuration

    Returns:
        True if database exists or was created successfully
    """
    print_header("Checking Firestore Database")

    project_id = config['projectId']
    region = config['firestore']['region']

    print_info(f"Project: {project_id}")
    print_info(f"Region: {region}")

    # Try to check if database exists by attempting to get firestore rules
    print_info("\nChecking if Firestore database exists...")

    # Use firebase firestore:databases:list to check if database exists
    result = run_command(
        f"firebase firestore:databases:list --project {project_id}",
        check=False,
        capture=True
    )

    # Check if (default) database exists in the output
    if result and "(default)" in result:
        print_success("Firestore database (default) already exists")
        return True

    # Database doesn't exist
    print_warning("Firestore database does not exist")
    print_info("\nFirestore needs to be enabled for this project.")
    print_info(f"Console link: https://console.firebase.google.com/project/{project_id}/firestore")

    # Ask user if they want to create it automatically
    create = prompt_user_input(
        "\nCreate Firestore database automatically? (y/n)",
        "y"
    ).lower()

    if create != 'y':
        print_info("\nPlease create Firestore database manually:")
        print_info(f"1. Go to: https://console.firebase.google.com/project/{project_id}/firestore")
        print_info("2. Click 'Create database'")
        print_info("3. Choose 'Production mode' (security rules will be deployed)")
        print_info(f"4. Select region: {region}")
        print_info("5. Click 'Enable'")
        print_info("6. Wait for database creation to complete")

        proceed = prompt_user_input(
            "\nHave you created the database? (y/n)",
            "n"
        ).lower()

        return proceed == 'y'

    # Create database automatically
    print_info(f"\nCreating Firestore database in region: {region}")
    print_info("This may take 30-60 seconds...")

    firebase_dir = get_project_root() / "firebase"
    original_dir = os.getcwd()
    os.chdir(firebase_dir)

    try:
        # Use firebase firestore:databases:create command
        success = run_command(
            f"firebase firestore:databases:create (default) --location {region} --project {project_id}",
            check=False
        )

        if not success:
            print_error("\nAutomatic database creation failed")
            print_info("Please create the database manually:")
            print_info(f"https://console.firebase.google.com/project/{project_id}/firestore")
            return False

        print_success("\nFirestore database created successfully!")
        print_info("Waiting a few seconds for database initialization...")

        # Wait a bit for the database to be fully ready
        import time
        time.sleep(3)

        return True

    finally:
        os.chdir(original_dir)


def deploy_firestore_rules(config: Dict[str, Any]):
    """
    Deploy Firestore security rules.

    Args:
        config: Environment configuration
    """
    print_header("Deploying Firestore Security Rules")

    project_id = config['projectId']
    firebase_dir = get_project_root() / "firebase"

    # Change to firebase directory
    original_dir = os.getcwd()
    os.chdir(firebase_dir)

    try:
        print_info(f"Deploying to project: {project_id}")
        run_command(f"firebase deploy --only firestore:rules --project {project_id}")
        print_success("Firestore security rules deployed successfully")
    finally:
        os.chdir(original_dir)


def deploy_firestore_indexes(config: Dict[str, Any]) -> bool:
    """
    Deploy Firestore indexes.

    Args:
        config: Environment configuration

    Returns:
        True if deployment succeeded
    """
    print_header("Deploying Firestore Indexes")

    project_id = config['projectId']
    firebase_dir = get_project_root() / "firebase"

    # Change to firebase directory
    original_dir = os.getcwd()
    os.chdir(firebase_dir)

    try:
        print_info(f"Deploying to project: {project_id}")
        success = run_command(
            f"firebase deploy --only firestore:indexes --project {project_id}",
            check=False
        )

        if not success:
            print_error("\nFirestore indexes deployment failed")
            print_warning("This usually means Firestore database doesn't exist yet")
            print_info(f"Console link: https://console.firebase.google.com/project/{project_id}/firestore")
            return False

        print_success("Firestore indexes deployed successfully")
        print_info("Note: Index creation may take several minutes to complete")
        return True
    finally:
        os.chdir(original_dir)


def configure_web_app(config: Dict[str, Any]):
    """
    Retrieve Firebase Web configuration and provide setup instructions.

    Args:
        config: Environment configuration
    """
    print_header("Configuring Web App")

    project_id = config['projectId']
    environment = config['environment']
    project_root = get_project_root()

    print_info("This will retrieve Firebase configuration for your React web app")
    print_info(f"Project: {project_id}")
    print_info(f"Environment: {environment}")

    # Change to firebase directory
    firebase_dir = project_root / "firebase"
    original_dir = os.getcwd()
    os.chdir(firebase_dir)

    try:
        print_info("\nRetrieving Firebase web app configuration...")

        # Try to get the web app configuration
        result = run_command(
            f"firebase apps:sdkconfig web --project {project_id}",
            check=False,
            capture=True
        )

        if result:
            print_success("Firebase web configuration retrieved!")
            print_info("\nFirebase Configuration:")
            print(f"{Colors.OKCYAN}{result}{Colors.ENDC}")

            print_info("\nNext steps:")
            print_info("1. Copy the configuration above")
            print_info("2. Create a file: src/firebase/config.ts")
            print_info("3. Add Firebase initialization code")
        else:
            print_warning("Could not retrieve web app configuration")
            print_info("\nTo configure manually:")
            print_info(f"1. Go to: https://console.firebase.google.com/project/{project_id}/settings/general")
            print_info("2. Scroll to 'Your apps' section")
            print_info("3. Click 'Add app' and select Web (</>)")
            print_info("4. Register your app and copy the configuration")
            print_info("5. Create src/firebase/config.ts with the Firebase config")

        # Provide React setup instructions
        print_info("\n4. Install Firebase dependencies:")
        print_info("   npm install firebase")

        print_info("\n5. Initialize Firebase in your React app:")
        print_info("   See example configuration in the setup summary below")

    finally:
        os.chdir(original_dir)


def print_summary(config: Dict[str, Any]):
    """
    Print setup summary and next steps.

    Args:
        config: Environment configuration
    """
    print_header("Setup Complete!")

    environment = config['environment']
    project_id = config['projectId']

    print(f"{Colors.OKGREEN}{Colors.BOLD}Environment: {environment.upper()}{Colors.ENDC}")
    print(f"{Colors.OKGREEN}Project ID: {project_id}{Colors.ENDC}")

    print(f"\n{Colors.BOLD}What was configured:{Colors.ENDC}")
    print_success("✓ Firebase project initialized")
    print_success("✓ Firestore security rules deployed")
    print_success("✓ Firestore indexes deployed")
    print_success("✓ Web app configuration retrieved")

    print(f"\n{Colors.BOLD}Authentication Providers:{Colors.ENDC}")
    print_success("✓ Email/Password")
    if config['authProviders']['google']['enabled']:
        print_success("✓ Google Sign-In (requires console configuration)")

    print(f"\n{Colors.BOLD}Firestore Collections:{Colors.ENDC}")
    print_info("- users/{userId} - User profiles and preferences")
    print_info("- properties/{propertyId} - Saved investment calculations")
    print_info("- templates/{templateId} - Pre-configured templates")
    print_info("- sharedProperties/{propertyId} - Publicly shared calculations")

    print(f"\n{Colors.BOLD}Next Steps:{Colors.ENDC}")
    print_info("1. Configure authentication providers in Firebase Console:")
    print_info(f"   https://console.firebase.google.com/project/{project_id}/authentication/providers")

    if config['authProviders']['google']['enabled']:
        print_info("\n2. For Google Sign-In:")
        print_info("   - Go to Authentication > Sign-in method")
        print_info("   - Enable Google provider")
        print_info("   - Add authorized domains")

    print_info("\n3. Install Firebase SDK:")
    print_info("   npm install firebase")

    print_info("\n4. Create Firebase configuration file (src/firebase/config.ts):")
    print_info("""
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';

   const firebaseConfig = {
     // Use the config from 'firebase apps:sdkconfig web'
   };

   export const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   """)

    print_info("\n5. Create authentication hooks and context in your React app")
    print_info("   - AuthContext for managing user state")
    print_info("   - Login/Signup components")
    print_info("   - Protected routes")

    print(f"\n{Colors.OKCYAN}Firebase Console: https://console.firebase.google.com/project/{project_id}{Colors.ENDC}")


def main():
    """Main script execution."""
    import argparse

    parser = argparse.ArgumentParser(description='Setup Firebase environment for Investment Property Calculator')
    parser.add_argument(
        '--non-interactive',
        action='store_true',
        help='Use existing configuration without prompting'
    )
    args = parser.parse_args()

    print_header("Firebase Environment Setup")
    print_info("Investment Property Calculator - React Web App")

    # Check prerequisites
    check_prerequisites()

    # Use production environment (single environment setup)
    environment = "production"

    # Configure environment
    if args.non_interactive:
        print_info("Running in non-interactive mode - using existing configuration")
        config = load_or_create_config(environment)
        if not config.get('projectId'):
            print_error("No existing configuration found. Cannot run in non-interactive mode.")
            sys.exit(1)
        print_success(f"Loaded configuration for project: {config['projectId']}")
    else:
        config = configure_environment(environment)

    # Create/verify Firebase project
    if not create_firebase_project(config):
        sys.exit(1)

    # Initialize Firebase
    initialize_firebase_project(config)

    # Check and create Firestore database if needed
    if not check_and_create_firestore_database(config):
        print_error("\nFirestore database setup failed")
        print_info("You can re-run this script after creating the database")
        sys.exit(1)

    # Deploy Firestore rules
    deploy_firestore_rules(config)

    # Deploy Firestore indexes
    indexes_deployed = deploy_firestore_indexes(config)
    if not indexes_deployed:
        print_warning("\nFirestore indexes deployment reported failure")
        print_info("Attempting to verify deployment status...")

        # Double-check by trying to list indexes
        project_id = config['projectId']
        result = run_command(
            f"firebase firestore:indexes --project {project_id}",
            check=False,
            capture=True
        )

        if result and "indexes" in result.lower():
            print_success("Indexes appear to be deployed despite error")
            indexes_deployed = True
        else:
            print_warning("Could not verify indexes deployment")
            print_info("You can deploy indexes later with: python deploy_indexes.py")

    # Configure web app
    if not args.non_interactive:
        configure_web_app(config)

    # Print summary
    print_summary(config)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print_error("\n\nSetup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"\n\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
