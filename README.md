# Hotel Management Mobile App

A React Native (Expo) mobile application for hotel management, connecting to the existing Node.js + MySQL REST API.

## Features

- **Admin Dashboard**: View statistics, manage customers, staff, and settings
- **HR Dashboard**: Manage employees, departments, and leave requests
- **Reception Dashboard**: Handle room bookings, check-ins/check-outs

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on device/emulator:
   - For iOS: `npm run ios`
   - For Android: `npm run android`
   - For web: `npm run web`

## API Configuration

The app connects to `https://hotel.primelogic.com.np/api`. Update the `API_BASE` in `src/context/AuthContext.js` if needed.

## Authentication

- Login with admin credentials
- Supports role-based access: Admin, HR Manager, Receptionist
- JWT token stored securely using AsyncStorage

## Project Structure

```
mobile-app/
├── src/
│   ├── context/
│   │   └── AuthContext.js
│   └── screens/
│       ├── LoginScreen.js
│       ├── RoleSelectionScreen.js
│       ├── AdminDashboard.js
│       ├── HRDashboard.js
│       └── ReceptionDashboard.js
├── App.js
├── app.json
└── package.json
```