#!/usr/bin/env python3
"""
Script to upload environment variables from .env.local to GitHub Secrets
Requires: GitHub CLI (gh) - https://cli.github.com/
"""

import os
import subprocess
import sys
from pathlib import Path


def check_gh_cli():
    """Check if GitHub CLI is installed."""
    try:
        subprocess.run(
            ["gh", "--version"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Error: GitHub CLI (gh) is not installed.")
        print("Please install it from: https://cli.github.com/")
        sys.exit(1)


def check_gh_auth():
    """Check if authenticated with GitHub CLI."""
    try:
        subprocess.run(
            ["gh", "auth", "status"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
    except subprocess.CalledProcessError:
        print("Error: Not authenticated with GitHub CLI.")
        print("Please run: gh auth login")
        sys.exit(1)


def parse_env_line(line):
    """Parse a line from .env file into key-value pair."""
    line = line.strip()

    # Skip empty lines and comments
    if not line or line.startswith('#'):
        return None, None

    # Split on first = sign
    if '=' not in line:
        return None, None

    key, _, value = line.partition('=')
    key = key.strip()
    value = value.strip()

    # Remove quotes from value
    if value.startswith('"') and value.endswith('"'):
        value = value[1:-1]
    elif value.startswith("'") and value.endswith("'"):
        value = value[1:-1]

    return key, value


def set_github_secret(key, value):
    """Set a GitHub secret using gh CLI."""
    try:
        process = subprocess.Popen(
            ["gh", "secret", "set", key, "--body", "-"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        process.communicate(input=value)

        if process.returncode != 0:
            print(f"Warning: Failed to set secret {key}")
            return False
        return True
    except Exception as e:
        print(f"Error setting secret {key}: {e}")
        return False


def main():
    """Main function to upload secrets from .env.local."""
    # Check prerequisites
    check_gh_cli()
    check_gh_auth()

    # Check if .env.local exists
    env_file = Path(".env.local")
    if not env_file.exists():
        print("Error: .env.local file not found in current directory.")
        sys.exit(1)

    print("Reading secrets from .env.local...")
    print()

    # Read and process .env.local
    secrets_count = 0
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            key, value = parse_env_line(line)

            if key and value:
                print(f"Setting secret: {key}")
                if set_github_secret(key, value):
                    secrets_count += 1

    print()
    if secrets_count > 0:
        print(f"✓ Successfully uploaded {secrets_count} secret(s) to GitHub!")
    else:
        print("No secrets were uploaded.")

    print()
    print("Next steps:")
    print("1. Go to Settings → Pages and set Source to 'GitHub Actions'")
    print("2. Push to main branch or manually trigger the deployment workflow")


if __name__ == "__main__":
    main()
