# Deployment to GitHub Pages

This project is configured to automatically deploy to GitHub Pages when you push to the `main` branch.

## Prerequisites

Before you can deploy, you need to configure GitHub Secrets for your Firebase credentials.

## Step 1: Add GitHub Secrets

### Option A: Automated (Recommended)

Use the provided script to automatically upload all secrets from your `.env.local` file:

**Prerequisites:**
- Install GitHub CLI: https://cli.github.com/
- Authenticate: `gh auth login`
- Python 3.6 or higher

**Run the script:**
```bash
python setup-secrets.py
```

The script will:
- Read your `.env.local` file
- Upload all environment variables as GitHub Secrets
- Show success/failure for each secret
- Display value length for verification
- Skip empty values with warning

### Option B: Manual Setup

If you prefer to add secrets manually:

1. Go to your GitHub repository
2. Click on **Settings** (top menu)
3. In the left sidebar, click on **Secrets and variables** → **Actions**
4. Click **New repository secret** for each of the following:

### Required Secrets

Add the following secrets with their corresponding values from your `.env.local` file:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyBx0tQuuw7RCmjv50LseRhhWRa8GUQwGys` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `investment-property-calc-45fc5.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `investment-property-calc-45fc5` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `investment-property-calc-45fc5.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `550982726604` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:550982726604:web:c4155e3c0c2f104a3de369` |
| `VITE_ENABLE_GOOGLE_LOGIN` | Enable Google Login (optional) | `false` |

**Important**: Copy the values from your `.env.local` file. Do not use the example values above.

## Step 2: Enable GitHub Pages

1. In your GitHub repository, go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Click **Save**

That's it! GitHub Pages is now configured to use the GitHub Actions workflow.

## Step 3: Deploy

The deployment will automatically trigger when you:
- Push commits to the `main` branch
- Manually trigger the workflow from the **Actions** tab

### Manual Deployment

1. Go to the **Actions** tab in your GitHub repository
2. Click on **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

## Accessing Your Deployed Site

After a successful deployment, your site will be available at:

```
https://<your-github-username>.github.io/investment-property-calculator/
```

You can find the exact URL in:
- The **Actions** tab → Click on the latest workflow run → Click on the **deploy** job
- Or in **Settings** → **Pages** (under "Your site is live at...")

## Troubleshooting

### Build Fails with "Firebase Configuration Error"

Make sure all Firebase secrets are added correctly in GitHub Secrets. Check that:
- Secret names match exactly (case-sensitive)
- Values are copied correctly from `.env.local`
- No extra quotes or spaces in the values

### 404 Error After Deployment

This usually means the `base` path in `vite.config.ts` doesn't match your repository name:
- Check that `base` is set to `/investment-property-calculator/`
- If you renamed your repository, update the `base` path accordingly

### Changes Not Appearing

- Check the **Actions** tab to see if the workflow completed successfully
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- It may take a few minutes for changes to appear after deployment
