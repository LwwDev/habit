# Habit - Habit Tracking Web App

A full-stack web application for tracking daily habits with streak tracking, progress analytics, and reminders.

## Features

-  Firebase Authentication (Login/Signup)
-  Habit tracking with daily completion
-  Streak tracking
-  Progress analytics dashboard with interactive charts
-  Reminders functionality
-  Responsive design with CSS Modules

## Tech Stack

- **Frontend**: React 18
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore
- **Charts**: Chart.js with react-chartjs-2
- **Styling**: CSS Modules
- **Build Tool**: Vite

![Screenshot 1](habify/Skärmbild 2025-11-08 142157.png)
![Screenshot 2](habify/Skärmbild 2025-11-08 142202.png)
![Screenshot 3](habify/Skärmbild 2025-11-08 142206.png)




## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy `.env.example` to `.env` and fill in your Firebase credentials

3. Run the development server:
```bash
npm run dev
```

## Firebase Configuration

Create a `.env` file in the root directory with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**Note**: The `.env` file is already in `.gitignore` and will not be committed to the repository. The app will work with fallback values if the `.env` file is not present, but it's recommended to use environment variables for security.

