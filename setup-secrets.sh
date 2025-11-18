#!/bin/bash

# Script to upload environment variables from .env.local to GitHub Secrets
# Requires: GitHub CLI (gh) - https://cli.github.com/

set -e

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub CLI."
    echo "Please run: gh auth login"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "Error: .env.local file not found in current directory."
    exit 1
fi

echo "Reading secrets from .env.local..."
echo ""

# Read .env.local and set each secret
while IFS='=' read -r key value; do
    # Skip empty lines and comments
    if [[ -z "$key" ]] || [[ "$key" =~ ^#.* ]]; then
        continue
    fi

    # Remove any quotes from the value
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

    echo "Setting secret: $key"
    echo "$value" | gh secret set "$key" --body -

done < .env.local

echo ""
echo "✓ All secrets have been uploaded to GitHub!"
echo ""
echo "Next steps:"
echo "1. Go to Settings → Pages and set Source to 'GitHub Actions'"
echo "2. Push to main branch or manually trigger the deployment workflow"
