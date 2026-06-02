StayGrid 
> **Smart Stays, Stay Grid.**

A full-stack room booking and accommodation platform built with **Symfony PHP** on the backend and **React Native (TypeScript)** on mobile. StayGrid allows users to browse available rooms, create bookings, track reservations, and manage their profiles — all from a unified mobile experience powered by a shared REST API.

---

## 📱 App Screenshots

| Launch | Home | Browse Rooms | Booking | Reservations | Profile |
|--------|------|--------------|---------|--------------|---------|
| Smart Stays splash screen | Featured room listings | Available units with real-time status | Availability calendar with date selection | Transaction logs and personal calendar | Profile, GPS location, and spending stats |

---

Tech Stack

### Mobile — React Native (TypeScript)
| Package | Purpose |
|---|---|
| `react-native` 0.76.5 | Core mobile framework |
| `@react-navigation/native` | Screen navigation |
| `@react-navigation/native-stack` | Stack navigator |
| `axios` | HTTP client for API calls |
| `@reduxjs/toolkit` + `redux-saga` | State management |
| `react-redux` | Redux bindings |
| `nativewind` + `tailwindcss` | Utility-first styling |
| `@react-native-async-storage/async-storage` | JWT token persistence |
| `@react-native-google-signin/google-signin` | Google OAuth |
| `react-native-vector-icons` | Icon library |
| `firebase` | Authentication provider |

Backend — Symfony PHP
| Component | Purpose |
|---|---|
| Symfony 7.3 | PHP web framework |
| API Platform | REST API generation |
| Doctrine ORM | Database abstraction |
| JWT Authentication | Stateless API auth |
| Cloudinary | Permanent image storage |
| Railway | Cloud deployment |
| PostgreSQL | Production database |

---

## 🗂️ Project Structure

```
StayGrid/                          # React Native app
├── SRC/
│   ├── api/
│   │   ├── client.ts              # Axios instance with JWT interceptor
│   │   ├── listingsApi.ts         # Rooms API calls
│   │   └── authApi.ts             # Login / register calls
│   ├── screens/
│   │   ├── HomeScreen.tsx         # Featured rooms dashboard
│   │   ├── RoomListingScreen.tsx  # Browse all rooms
│   │   ├── BookingScreen.tsx      # Booking with availability calendar
│   │   ├── ReservationsScreen.tsx # Transaction logs
│   │   └── ProfileScreen.tsx      # User profile + GPS
│   ├── store/
│   │   ├── listings/              # Rooms redux state
│   │   └── auth/                  # Auth redux state
│   └── components/                # Shared UI components
├── android/                       # Android native project
└── package.json

staygrid/ (Symfony backend)        # Web app + API
├── src/
│   ├── Controller/
│   │   ├── Api/
│   │   │   └── AuthApiController.php   # JWT login/register
│   │   ├── Admin/
│   │   │   └── RoomListingController.php
│   │   └── Staff/
│   │       └── RoomListingController.php
│   ├── Entity/
│   │   ├── RoomListing.php        # Room entity
│   │   ├── Booking.php            # Booking entity
│   │   └── LogInUsers.php         # User entity
│   ├── Security/
│   │   └── ApiTokenAuthenticator.php
│   └── Service/
│       └── CloudinaryService.php  # Image upload to Cloudinary
├── config/
│   └── packages/
│       └── security.yaml          # Firewall + JWT config
└── composer.json
```

---

API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | ❌ Public | Login, returns JWT token |
| `POST` | `/api/auth/register` | ❌ Public | Register new user |
| `GET` | `/api/rooms` | ❌ Public | List all available rooms |
| `GET` | `/api/rooms/{id}` | ❌ Public | Single room detail |
| `POST` | `/api/bookings` | ✅ JWT | Create a booking |
| `GET` | `/api/bookings/my` | ✅ JWT | Get current user's bookings |
| `DELETE` | `/api/bookings/{id}` | ✅ JWT | Cancel a booking |
| `GET` | `/api/user/profile` | ✅ JWT | Get user profile |
| `PUT` | `/api/user/profile` | ✅ JWT | Update user profile |
| `POST` | `/api/feedback` | ❌ Public | Submit feedback |

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

Data Flow (Level 1 DFD)

```
User → [P1 Login/Register]   → POST /api/auth/login    → D1 Users
User → [P2 Browse Rooms]     → GET  /api/rooms         → D2 Rooms + D6 Cloudinary
User → [P3 View Room Detail] → GET  /api/rooms/{id}    → D3 Room Images
User → [P4 Create Booking]   → POST /api/bookings      → D4 Bookings
User → [P5 View Bookings]    → GET  /api/bookings/my   → D4 Bookings
User → [P6 Manage Profile]   → GET/PUT /api/profile    → D1 Users
User → [P7 Submit Feedback]  → POST /api/feedback      → D5 Feedback
```

---

Getting Started

### Prerequisites
- Node.js >= 22.11.0
- PHP >= 8.2
- Composer
- Android Studio (for emulator)
- Railway CLI (for deployment)

---

### React Native App Setup

```bash
# Clone the repo
git clone https://github.com/jErv1a0/StayGrid-App.git
cd StayGrid

# Install dependencies
npm install

# Start Metro bundler
npx react-native start

# Run on Android (in a separate terminal)
npx react-native run-android
```

**Environment config** — update the base URL in `SRC/api/client.ts`:
```ts
const BASE_URL = 'https://staygrid.up.railway.app';
```

---

### Symfony Backend Setup

```bash
cd staygrid

# Install PHP dependencies
composer install

# Copy environment file
cp .env .env.local

# Set your database URL and Cloudinary credentials in .env.local
DATABASE_URL="postgresql://user:pass@localhost:5432/staygrid"
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Run database migrations
php bin/console doctrine:migrations:migrate

# Start local server
symfony server:start
```

---

Building a Release APK

```bash
cd android

# Generate signing keystore (first time only)
keytool -genkeypair -v -storetype PKCS12 \
  -keystore app/staygrid.keystore \
  -alias staygrid -keyalg RSA -keysize 2048 -validity 10000

# Build release APK
./gradlew assembleRelease

# APK output location:
# android/app/build/outputs/apk/release/app-release.apk

# Install on connected device
adb install app/build/outputs/apk/release/app-release.apk
```

---

Deployment

### Railway (Backend)
```bash
# Push to main branch — Railway auto-deploys
git push origin main

# Set environment variables on Railway dashboard:
# DATABASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

Live API: **https://staygrid.up.railway.app**

### Image Storage
Room images are stored permanently on **Cloudinary** (not Railway filesystem) to survive redeployments.

---

Features

- 🔐 **JWT Authentication** — stateless API auth for mobile
- 🛏️ **Room Browsing** — real-time availability with Cloudinary images
- 📅 **Booking System** — date selection with availability calendar
- 📋 **Reservation Tracking** — transaction logs with personal calendar
- 👤 **User Profile** — editable profile with GPS location auto-detection
- 💰 **Spending Stats** — total nights and spend tracker
- 🔄 **Edit/Cancel Bookings** — CRUD on reservations before check-in date
- 🌐 **Shared Backend** — one Symfony API serves both web and mobile

---

Author

**Alvarico Jervine A.**
- GitHub: [@jErv1a0](https://github.com/jErv1a0)
- Email: alvrcoquiermv05@gmail.com

---

License

This project is for academic and personal use.
