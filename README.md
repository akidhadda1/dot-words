# Dot Words

A daily word puzzle game. Guess the word from its dot outline. Each hint reveals one letter but costs you points.

## Quick Start (Local Development)

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Setup Firebase (for shared leaderboard)

The game uses Firebase Firestore for the shared leaderboard so all players see each other's scores. Without this, the game still works but leaderboard data stays local to each browser.

### Step 1: Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" (or "Add project")
3. Name it something like `dot-words`
4. You can disable Google Analytics (not needed)
5. Click "Create project"

### Step 2: Add a web app

1. In your Firebase project dashboard, click the web icon (`</>`) to add a web app
2. Name it `dot-words`
3. You do NOT need Firebase Hosting (we'll use Vercel)
4. Click "Register app"
5. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "dot-words-xxxxx.firebaseapp.com",
  projectId: "dot-words-xxxxx",
  storageBucket: "dot-words-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. Copy these values into `src/firebase.js`, replacing the placeholder values.

### Step 3: Create a Firestore database

1. In the Firebase Console sidebar, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll tighten rules later)
4. Pick a region close to your users (e.g., `us-central1`)
5. Click "Done"

### Step 4: Set security rules

In Firestore > Rules, replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /dotwords/{document=**} {
      allow read: if true;
      allow write: if request.resource.data.keys().hasOnly(['value', 'updatedAt'])
                   && request.resource.data.value is string
                   && request.resource.data.value.size() < 50000;
    }
  }
}
```

Click "Publish". This allows anyone to read/write leaderboard data but restricts the shape of documents.

## Deploy to Vercel (free)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
```

Create a new repository on [GitHub](https://github.com/new), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/dot-words.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click "Add New" > "Project"
3. Import your `dot-words` repository
4. Vercel auto-detects Vite. Leave all settings as default.
5. Click "Deploy"
6. In ~60 seconds you'll have a live URL like `dot-words-abc123.vercel.app`

### Custom domain (optional)

In Vercel project settings > Domains, you can add a custom domain. Vercel handles SSL automatically.

## Project Structure

```
dot-words/
  index.html          # Entry HTML
  vite.config.js      # Vite config
  src/
    main.jsx          # React entry point
    App.jsx           # The game (all UI and game logic)
    firebase.js       # Firebase config (edit this with your keys)
    storage.js        # Storage abstraction (Firestore + localStorage)
```

## How It Works

- **Daily words**: A date-based seed shuffles each theme's word list so everyone gets the same 10 words per day
- **Dot rendering**: Letters are drawn on a hidden canvas, edge pixels are detected, then rendered as glowing dots
- **Per-letter hints**: Each hint fully reveals one random letter's dots
- **Leaderboard**: Shared via Firestore; play-once-per-day enforced via localStorage
- **Sounds**: Synthesized with Tone.js (no audio files needed)
