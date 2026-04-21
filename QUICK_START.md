# StayGrid React Native App - Quick Start Guide

## Prerequisites
- Node.js (v14 or later)
- React Native CLI
- Android Studio (for Android) or Xcode (for iOS)
- Running StayGrid Symfony backend

## Backend Setup
1. Start the Symfony backend:
   ```bash
   cd c:\Users\Jerv\Documents\Dev\staygrid\staygridsymfony
   serve --no-tls
   ```

2. Find your PC IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" under your active network adapter (e.g., `192.168.1.10`)

## App Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Update API configuration:
   - Open `SRC/config/api.ts`
   - Replace `10.0.2.2` with your PC IP address
   - Example: `http://192.168.1.10:8000`

3. For Android development:
   ```bash
   npx react-native run-android
   ```

4. For iOS development:
   ```bash
   npx react-native run-ios
   ```

## Testing
1. Use the app on a physical device connected to the same WiFi network
2. Test login with existing user credentials
3. Browse room listings
4. Create and view bookings

## Troubleshooting
- **Connection refused**: Check if backend is running and IP address is correct
- **CORS errors**: Ensure backend allows requests from mobile app
- **Session issues**: Clear app data and login again
- **Network timeouts**: Check firewall settings

## Key Files
- `REACT_NATIVE_PROMPT.md`: Complete development guide
- `API_DOCUMENTATION.md`: API reference
- `SRC/api/client.ts`: API service functions
- `SRC/config/api.ts`: API configuration