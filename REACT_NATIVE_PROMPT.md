# React Native App Development Prompt for StayGrid

## Overview
This document provides a complete implementation guide for the StayGrid React Native mobile app. The app allows users to browse and book accommodations using a session-based API.

## API Configuration
- **Base URL**: `http://YOUR_PC_IP:8000/api` (replace YOUR_PC_IP with your actual PC IP address)
- **Authentication**: Session-based (cookies)
- **Credentials**: Always include `credentials: 'include'` in fetch requests

## Project Structure
```
SRC/
├── api/
│   └── client.ts          # API service functions
├── components/
│   ├── ListingCard.tsx    # Room listing card component
│   └── PhotoCarousel.tsx  # Photo carousel for room details
├── config/
│   └── api.ts            # API configuration
├── screens/
│   ├── LoginScreen.tsx   # User login screen
│   ├── HomeScreen.tsx    # Room listings screen
│   ├── RoomDetailScreen.tsx # Room details screen
│   ├── BookingScreen.tsx # Create booking screen
│   └── ChatScreen.tsx    # User bookings/chat screen
├── theme.ts              # App theme and constants
└── styles.ts             # Global styles
```

## API Service Layer

### client.ts Implementation
```typescript
import api from '../config/api';

async function request(path: string, options: RequestInit = {}) {
  const url = `${api.baseUrl}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, { ...options, headers, credentials: 'include' });

  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) throw { status: res.status, body: json };
    return json;
  } catch (e) {
    if (e && e.status) throw e;
    if (!res.ok) throw { status: res.status, body: text };
    return text;
  }
}

export async function login(email: string, password: string) {
  return request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getRoomListings() {
  return request('/api/room_listings');
}

export async function getRoomDetails(id: number) {
  return request(`/api/rooms/${id}`);
}

export async function createBooking(roomId: number, checkIn: string, checkOut: string) {
  return request('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({ room_id: roomId, check_in: checkIn, check_out: checkOut }),
  });
}

export async function getMyBookings() {
  return request('/api/bookings');
}

export async function cancelBooking(id: number) {
  return request(`/api/bookings/${id}`, {
    method: 'DELETE',
  });
}
```

## Screen Components

### LoginScreen.tsx
- Email/password input fields
- Login button with loading state
- Social login buttons (Google, Facebook)
- Error handling and success navigation
- Admin login bypass for 'SuperUser@Staygird'

### HomeScreen.tsx (Room Listings)
- Fetch and display room listings
- Use ListingCard component for each room
- Navigation to room details
- Pull-to-refresh functionality

### RoomDetailScreen.tsx
- Display room photos using PhotoCarousel
- Show room details (price, amenities, etc.)
- Book now button navigating to BookingScreen

### BookingScreen.tsx
- Date picker for check-in/check-out
- Create booking API call
- Success/error handling

### ChatScreen.tsx (My Bookings)
- Display user's bookings
- Cancel booking functionality
- Chat interface (if implemented)

## Navigation Setup
Use React Navigation with stack navigator:
- LoginScreen (initial if not logged in)
- HomeScreen
- RoomDetailScreen
- BookingScreen
- ChatScreen

## Error Handling
- Network errors: Show user-friendly messages
- 401 Unauthorized: Redirect to login
- Loading states: Show spinners during API calls
- Retry mechanisms for failed requests

## Testing Instructions
1. Start backend: `cd c:\Users\Jerv\Documents\Dev\staygrid\staygridsymfony && serve --no-tls`
2. Update API_BASE_URL in config/api.ts with your PC IP
3. Test login with existing users
4. Test room listings and booking flow
5. Test on physical device (same WiFi network)

## Dependencies
Required packages:
- @react-navigation/native
- @react-navigation/stack
- @react-native-google-signin/google-signin
- react-native-fbsdk-next
- react-native-vector-icons (if needed)

## Build Instructions
1. Install dependencies: `npm install`
2. For Android: `npx react-native run-android`
3. For iOS: `npx react-native run-ios`
4. Test on device using your PC IP for API calls

## Common Issues
- CORS errors: Ensure backend allows mobile origins
- Network timeouts: Check firewall settings
- Session expiration: Handle 401 responses by redirecting to login
- IP address changes: Update API_BASE_URL when network changes