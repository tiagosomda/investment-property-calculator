# Firebase Setup Scripts

Automated scripts for setting up and managing Firebase environments (staging and production) for the Letter Tracing app.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Directory Structure](#directory-structure)
- [Scripts](#scripts)
- [Configuration Files](#configuration-files)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

---

## Overview

This toolkit provides Python scripts to automate Firebase project setup, including:

- **Environment Configuration**: Separate staging and production environments
- **Firebase Project Initialization**: Create and configure Firebase projects
- **Authentication Setup**: Email/password, Google Sign-In, Apple Sign-In
- **Firestore Configuration**: Security rules and composite indexes
- **Flutter Integration**: Automatic FlutterFire CLI configuration

## Prerequisites

Before running the setup scripts, ensure you have the following installed:

### Required Tools

1. **Python 3.8+**
   ```bash
   python --version
   ```

2. **Node.js and npm** (for Firebase CLI)
   ```bash
   node --version
   npm --version
   ```

3. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase --version
   ```

4. **Flutter SDK**
   ```bash
   flutter --version
   ```

5. **FlutterFire CLI**
   ```bash
   dart pub global activate flutterfire_cli
   flutterfire --version
   ```

### Firebase Account

- Google account with access to Firebase Console
- Permissions to create new Firebase projects (if creating new environments)

### Authentication

Before running scripts, authenticate with Firebase:

```bash
firebase login
```

---

## Quick Start

### 1. Initial Setup (First Time)

Run the main setup script to create a new environment:

```bash
cd firebase/scripts
python setup_firebase_env.py
```

This will:
- Check prerequisites
- Prompt you to select staging or production
- Create/load environment configuration
- Guide you through Firebase project creation
- **Automatically create Firestore database** (if it doesn't exist)
- Deploy Firestore rules and indexes
- Configure your Flutter app

### 2. Deploy Rules Only

After making changes to `firestore.rules`:

```bash
cd firebase/scripts
python deploy_rules.py
```

### 3. Deploy Indexes Only

After making changes to `firestore.indexes.json`:

```bash
cd firebase/scripts
python deploy_indexes.py
```

---

## Directory Structure

```
firebase/
├── README.md                    # This file
├── firebase.json                # Firebase project configuration (auto-generated)
├── .firebaserc                  # Project aliases (auto-generated)
│
├── config/
│   ├── firestore.rules          # Security rules for Firestore
│   ├── firestore.indexes.json   # Composite index definitions
│   ├── env.template.json        # Template for environment configs
│   ├── staging.json             # Staging config (git-ignored, created by setup)
│   ├── production.json          # Production config (git-ignored, created by setup)
│   └── .gitignore               # Ignores sensitive config files
│
└── scripts/
    ├── setup_firebase_env.py    # Main setup script
    ├── deploy_rules.py          # Deploy security rules
    ├── deploy_indexes.py        # Deploy indexes
    └── requirements.txt         # Python dependencies (currently none)
```

---

## Scripts

### `setup_firebase_env.py`

**Purpose**: Complete environment setup from scratch

**What it does**:
1. Checks prerequisites (CLI tools installed and authenticated)
2. Prompts for environment selection (staging/production)
3. Interactively configures environment settings
4. Guides Firebase project creation (via Firebase Console)
5. Initializes Firebase configuration files
6. **Checks if Firestore database exists and creates it automatically** (with user confirmation)
7. Deploys Firestore rules and indexes
8. Configures Flutter app with FlutterFire CLI

**Usage**:
```bash
python setup_firebase_env.py
```

**Interactive Prompts**:
- Environment selection (staging/production)
- Firebase Project ID
- Authentication providers (Google, Apple)
- Firestore region
- Confirmation for Firebase project creation
- **Create Firestore database automatically?** (y/n)
- Flutter platform selection (iOS, Android, Web)

**Output**:
- `firebase.json` - Firebase project configuration
- `.firebaserc` - Project aliases for each environment
- `config/{environment}.json` - Environment-specific settings
- `src/lib/firebase_options.dart` or `firebase_options_{env}.dart` - Flutter config

---

### `deploy_rules.py`

**Purpose**: Deploy Firestore security rules to an environment

**What it does**:
1. Lists configured environments from `.firebaserc`
2. Prompts for environment selection
3. Shows deployment confirmation
4. Deploys `config/firestore.rules` to selected project

**Usage**:
```bash
python deploy_rules.py
```

**When to use**:
- After modifying `config/firestore.rules`
- To sync rules between local and remote
- To fix security rule issues

---

### `deploy_indexes.py`

**Purpose**: Deploy Firestore composite indexes to an environment

**What it does**:
1. Lists configured environments from `.firebaserc`
2. Prompts for environment selection
3. Shows index summary
4. Deploys `config/firestore.indexes.json` to selected project

**Usage**:
```bash
python deploy_indexes.py
```

**When to use**:
- After modifying `config/firestore.indexes.json`
- When adding new query patterns
- After Firestore query errors suggest missing indexes

**Note**: Index creation can take several minutes to complete. Monitor progress in Firebase Console.

---

## Configuration Files

### `config/firestore.rules`

Firestore security rules defining access control for collections:

- **users**: Users can only read/write their own profile
- **creations**: Users can only access their own private creations
- **publicCreations**: Public read, author-only write
- **publicCreationIndex**: Public read, author-only write

**Modify when**:
- Adding new collections
- Changing access control logic
- Adding validation rules

**Deploy with**: `python deploy_rules.py`

---

### `config/firestore.indexes.json`

Composite indexes for efficient queries:

1. **publicCreationIndex** - Search by tags + createdAt
2. **publicCreationIndex** - Search by author + createdAt
3. **creations** - User's creations sorted by updatedAt
4. **publicCreations** - Author's public creations sorted by createdAt

**Modify when**:
- Adding new query patterns
- Firestore suggests missing indexes
- Optimizing search performance

**Deploy with**: `python deploy_indexes.py`

---

### `config/env.template.json`

Template for environment-specific configuration. Do not edit directly.

Used by `setup_firebase_env.py` to create `staging.json` and `production.json`.

---

### `config/{environment}.json` (git-ignored)

Environment-specific settings created during setup:

```json
{
  "projectId": "letter-tracing-staging",
  "environment": "staging",
  "authProviders": {
    "email": true,
    "google": {
      "enabled": true,
      "clientId": "",
      "clientSecret": ""
    },
    "apple": {
      "enabled": true,
      "serviceId": "",
      "teamId": "",
      "keyId": "",
      "privateKey": ""
    }
  },
  "firestore": {
    "region": "us-central1"
  }
}
```

**Note**: These files are git-ignored as they may contain sensitive information.

---

## Usage Examples

### Example 1: Setting Up Staging Environment

```bash
# Navigate to scripts directory
cd firebase/scripts

# Run setup
python setup_firebase_env.py

# Select staging (option 1)
# Enter project ID: letter-tracing-staging
# Enable Google Sign-In: y
# Enable Apple Sign-In: y
# Firestore region: us-central1

# Follow prompts to create Firebase project in console
# Script will deploy rules, indexes, and configure Flutter
```

**Result**:
- Staging environment fully configured
- `.firebaserc` contains staging alias
- `config/staging.json` created
- `src/lib/firebase_options_staging.dart` generated

---

### Example 2: Deploying Updated Security Rules

You've modified `config/firestore.rules` to add a new collection. Deploy changes:

```bash
cd firebase/scripts
python deploy_rules.py

# Select environment (1 for staging, 2 for production)
# Confirm deployment: yes
```

**Result**:
- Updated rules deployed to selected environment
- Changes take effect immediately

---

### Example 3: Adding New Composite Index

You've added a new query pattern and need a composite index:

1. Edit `config/firestore.indexes.json`:
   ```json
   {
     "collectionGroup": "publicCreationIndex",
     "queryScope": "COLLECTION",
     "fields": [
       {"fieldPath": "favoriteCount", "order": "DESCENDING"},
       {"fieldPath": "createdAt", "order": "DESCENDING"}
     ]
   }
   ```

2. Deploy indexes:
   ```bash
   python deploy_indexes.py
   # Select environment
   # Confirm deployment: yes
   ```

3. Wait for index creation (check Firebase Console)

---

### Example 4: Setting Up Production After Staging

Already have staging? Add production:

```bash
python setup_firebase_env.py

# Select production (option 2)
# Enter project ID: letter-tracing-prod
# Configure authentication providers
# ...
```

**Result**:
- `.firebaserc` now contains both staging and production
- Both environments can be managed independently

---

## Troubleshooting

### Firebase CLI Not Authenticated

**Error**: `Error: Failed to authenticate`

**Solution**:
```bash
firebase login
firebase projects:list  # Verify authentication
```

---

### FlutterFire CLI Not Found

**Error**: `flutterfire: command not found`

**Solution**:
```bash
dart pub global activate flutterfire_cli

# Add to PATH if needed (Linux/Mac)
export PATH="$PATH:$HOME/.pub-cache/bin"

# Or Windows
# Add %LOCALAPPDATA%\Pub\Cache\bin to PATH
```

---

### Project Already Exists

**Error**: `Project ID already in use`

**Solution**:
- Use a different project ID
- Or configure existing project by entering 'y' when prompted

---

### Firestore Database Does Not Exist

**Error**: `HTTP Error: 404, Project 'xxx' or database '(default)' does not exist`

**Solution**:
The setup script now automatically detects and creates the Firestore database for you! If you encounter this error:

1. **Re-run the setup script**: It will detect the missing database and offer to create it
   ```bash
   python setup_firebase_env.py
   ```

2. **Or create manually** in Firebase Console:
   - Go to: `https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore`
   - Click "Create database"
   - Choose "Production mode" (security rules will be deployed)
   - Select your region (e.g., us-central1)
   - Wait for creation (~30 seconds)
   - Re-run the deployment: `python deploy_indexes.py`

**Note**: The script will ask "Create Firestore database automatically? (y/n)" - answer 'y' to let it handle this for you!

---

### Index Creation Timeout

**Issue**: Index deployment succeeds but indexes show "Building" status

**Solution**:
- This is normal - index creation can take 5-30 minutes
- Monitor in Firebase Console: `Firestore > Indexes`
- Your app will use single-field indexes until composite indexes complete

---

### Permission Denied

**Error**: `403 Forbidden` or `Permission denied`

**Solution**:
- Verify you have Owner/Editor role on the Firebase project
- Check in Firebase Console: `Settings > Users and permissions`
- Re-authenticate: `firebase login --reauth`

---

### Rules Deployment Fails

**Error**: `Compilation error in firestore.rules`

**Solution**:
1. Check rules syntax in `config/firestore.rules`
2. Test rules in Firebase Console: `Firestore > Rules > Playground`
3. Common issues:
   - Missing semicolons
   - Incorrect function syntax
   - Resource data access (use `resource.data.field`)

---

### Different Project for Each Platform

**Issue**: FlutterFire creates separate projects for iOS/Android/Web

**Solution**:
- When running `flutterfire configure`, select the same project for all platforms
- Use arrow keys to navigate and Space to select
- Press Enter only once after selecting all platforms

---

## Next Steps

After completing Firebase setup:

1. **Configure Authentication Providers** (Firebase Console):
   - Email/Password: Already enabled
   - Google Sign-In: Add OAuth client IDs
   - Apple Sign-In: Configure with Apple Developer credentials

2. **Add Firebase Packages** (Flutter):
   ```bash
   cd src
   flutter pub add firebase_core firebase_auth cloud_firestore
   ```

3. **Initialize Firebase in Flutter** (`lib/main.dart`):
   ```dart
   import 'package:firebase_core/firebase_core.dart';
   import 'firebase_options.dart';

   void main() async {
     WidgetsFlutterBinding.ensureInitialized();
     await Firebase.initializeApp(
       options: DefaultFirebaseOptions.currentPlatform,
     );
     runApp(MyApp());
   }
   ```

4. **Implement Authentication** (see `docs/online-account-feature.md`)

5. **Test in Staging** before deploying to production

---

## Additional Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [FlutterFire Documentation](https://firebase.flutter.dev/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)

---

## Support

For issues or questions:
- Check [Troubleshooting](#troubleshooting) section above
- Review Firebase Console for deployment status
- Consult `docs/online-account-feature.md` for feature specifications
