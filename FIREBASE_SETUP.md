# Firebase Setup Guide

This guide will help you set up Firebase for the Investment Property Calculator to enable cloud sync and authentication features.

## Prerequisites

- Node.js installed
- Firebase CLI: `npm install -g firebase-tools`
- A Google account for Firebase Console access

## Step 1: Create Firebase Project

1. Run the setup script:
   ```bash
   cd firebase/scripts
   python setup_firebase_env.py
   ```

2. Follow the prompts to:
   - Enter your Firebase Project ID
   - Enable authentication providers (Email/Password, Google)
   - Deploy Firestore security rules and indexes

## Step 2: Configure Web App

1. Get your Firebase web app configuration:
   ```bash
   firebase apps:sdkconfig web --project YOUR_PROJECT_ID
   ```

2. Create `.env.local` in the project root:
   ```bash
   cp .env.example .env.local
   ```

3. Fill in your Firebase credentials in `.env.local`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

## Step 3: Enable Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Enable:
   - **Email/Password**
   - **Google** (optional but recommended)

For Google Sign-in:
- Add your domain to authorized domains
- No additional configuration needed for localhost

## Step 4: Verify Firestore Rules

The security rules should already be deployed by the setup script. Verify them in:
**Firebase Console** > **Firestore Database** > **Rules**

The rules ensure:
- Users can only access their own data
- Public shared projects are readable by anyone
- Proper authentication is enforced

## Features Enabled

### 🔐 Authentication
- Email/Password sign-up and login
- Google Sign-In
- User profiles

### ☁️ Cloud Sync
- Automatic sync with 3-second debounce
- Last-write-wins merge strategy
- Works offline with local storage fallback

### 📤 Project Sharing
- Share projects publicly via unique URLs
- Read-only access for shared projects
- Easy link copying

## Local Development

Run the app:
```bash
npm run dev
```

The app will work without Firebase configuration, but with limited features (local-only mode).

## Deployment Scripts

- **Deploy Rules**: `python firebase/scripts/deploy_rules.py`
- **Deploy Indexes**: `python firebase/scripts/deploy_indexes.py`
- **Full Setup**: `python firebase/scripts/setup_firebase_env.py`

## Troubleshooting

### Firebase not initialized
- Make sure `.env.local` exists and has correct values
- Restart the dev server after adding environment variables

### Authentication errors
- Check Firebase Console > Authentication > Sign-in method
- Verify domains are authorized
- Clear browser cache and try again

### Sync not working
- Check Firebase Console > Firestore Database
- Verify rules are deployed
- Check browser console for errors

## Security Notes

- Never commit `.env.local` to version control
- Keep your Firebase API keys secure
- Review Firestore security rules regularly
- Monitor usage in Firebase Console

## Support

For issues with Firebase setup, check:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- Project issues on GitHub
