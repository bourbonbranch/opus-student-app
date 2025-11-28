# Opus Student App

A mobile application for students/singers to manage their rehearsals, music, and profile in the Opus platform. Built with Expo (React Native) and TypeScript.

## Features

- **Authentication**: Login with email and password.
- **Home**: View upcoming rehearsals and announcements.
- **Rehearsals**: List of upcoming rehearsals.
- **Music**: Access assigned music.
- **Profile**: View user profile and settings.

## Getting Started

### Prerequisites

- Node.js and npm
- Expo Go app on your mobile device (or Android Studio/Xcode for simulation)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env` and update the `API_BASE_URL` if needed.
   ```bash
   cp .env.example .env
   ```

### Running the App

Start the development server:

```bash
npx expo start
```

- Scan the QR code with Expo Go (Android) or Camera app (iOS).
- Press `a` for Android emulator or `i` for iOS simulator.

## Project Structure

- `app/`: Expo Router screens and navigation.
- `src/api/`: API client and configuration.
- `src/components/`: Shared UI components.
- `src/context/`: React Contexts (e.g., AuthContext).
- `src/constants/`: App constants and theme colors.

## Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Context
- **HTTP Client**: Axios
- **Storage**: Expo Secure Store
