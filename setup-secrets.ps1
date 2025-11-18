# PowerShell script to upload environment variables from .env.local to GitHub Secrets
# Requires: GitHub CLI (gh) - https://cli.github.com/

$ErrorActionPreference = "Stop"

# Check if gh CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "Error: GitHub CLI (gh) is not installed." -ForegroundColor Red
    Write-Host "Please install it from: https://cli.github.com/"
    exit 1
}

# Check if authenticated
try {
    gh auth status 2>&1 | Out-Null
} catch {
    Write-Host "Error: Not authenticated with GitHub CLI." -ForegroundColor Red
    Write-Host "Please run: gh auth login"
    exit 1
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "Error: .env.local file not found in current directory." -ForegroundColor Red
    exit 1
}

Write-Host "Reading secrets from .env.local..." -ForegroundColor Cyan
Write-Host ""

# Read .env.local and set each secret
Get-Content ".env.local" | ForEach-Object {
    $line = $_.Trim()

    # Skip empty lines and comments
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
        return
    }

    # Split on first = sign
    $parts = $line -split '=', 2
    if ($parts.Length -ne 2) {
        return
    }

    $key = $parts[0].Trim()
    $value = $parts[1].Trim()

    # Remove quotes from value
    $value = $value -replace '^["'']|["'']$', ''

    # Skip if value is empty
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "Skipping secret: $key (empty value)" -ForegroundColor Yellow
        return
    }

    Write-Host "Setting secret: $key" -ForegroundColor Green
    Write-Host "  Value length: $($value.Length) chars" -ForegroundColor Gray
    Write-Host "  First 10 chars: $($value.Substring(0, [Math]::Min(10, $value.Length)))..." -ForegroundColor Gray

    # Set the secret
    $value | gh secret set $key --body -

    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: Failed to set secret!" -ForegroundColor Red
    } else {
        Write-Host "  ✓ Success" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✓ All secrets have been uploaded to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Go to Settings → Pages and set Source to 'GitHub Actions'"
Write-Host "2. Push to main branch or manually trigger the deployment workflow"
