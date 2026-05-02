# Focus Warden

Focus Warden is a React + Vite productivity control app with a surveillance-style UI. It tracks sessions, logs focus loss events, restricts disarming to admins, and supports join-by-code collaboration.

The app now uses Firebase Realtime Database for shared users and sessions, which makes it suitable for cross-device use once Firebase credentials are configured.

## Features

- Admin and user roles with role-based disarm control
- Session creation and session joining by code
- Shareable join links for quick access on another device
- Firebase-backed users and sessions for shared state
- Real-time session updates across connected clients
- Focus tracking, slacking alerts, logs, dashboard metrics, and leaderboard views

## Best Fit

This project works best when integrated into a broader system rather than used as a standalone local demo.

Recommended integrations:

- A shared backend or Firebase project for persistent sessions
- A team dashboard or portal where users can join active sessions
- An authentication layer if you want trusted admin assignment
- Notification or messaging services if you want session invites to be distributed automatically

## Tech Stack

- React 19
- Vite
- Firebase Realtime Database
- Tailwind CSS

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Open `src/firebase.js` and replace the placeholder values with your Firebase project config:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`
- `databaseURL`

### 3. Run locally

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## How It Works

1. An admin logs in or registers.
2. The admin creates a session and shares the generated code or join link.
3. Another user opens the link or enters the code on the Join Session screen.
4. Firebase stores the shared session data so both devices can see the same session.

## Notes

- The app will compile without Firebase credentials, but shared sessions will not work until `src/firebase.js` is configured.
- If you want the app to function reliably across devices, keep Firebase enabled and avoid relying on browser-only storage.
- The current UI is intentionally opinionated and best used as part of a larger workflow or internal tool.

## Scripts

- `npm run dev` - Start the Vite development server
- `npm run build` - Build the production bundle
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint
