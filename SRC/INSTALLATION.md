zReact Navigation and related packages are required for the new Launch/Login/Signup flow.

Install these packages in your project root:

```bash
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler
```

After installing, for iOS run:

```bash
cd ios && pod install && cd ..
```

For Android ensure `react-native-gesture-handler` is configured (usually automatic with newer RN).

These screens are placed under `SRC/screens` and `App.tsx` was updated to use the native stack.

## Environment and Database Configuration

Backend and infrastructure environment values are stored in `.env`.

- Template (safe to commit): `.env.example`
- Local runtime values (git-ignored): `.env`

React Native app-safe values live in `.env.mobile` and are read through `SRC/config/env.ts`, `SRC/config/api.ts`, and optionally `SRC/config/firebaseConfig.ts` if you choose to enable Firebase services.

- Template (safe to commit): `.env.mobile.example`
- Local runtime values (git-ignored): `.env.mobile`

If you already have a Google OAuth Web client in your Symfony project, reuse its client ID as `GOOGLE_CLIENT_ID` in `.env.mobile`.

Add your Google OAuth web client ID to `.env.mobile` as `GOOGLE_CLIENT_ID`. Do not put the Google client secret in the mobile app; keep that on the Symfony backend only.

Also create a separate Android OAuth client in the same Google Cloud project for package `com.staygrid` and the app SHA-1 fingerprint.

For Android emulator testing, keep `DEFAULT_URI` and `APP_URL` pointed at `http://10.0.2.2:8000` so the app can reach the host machine.

For a physical Android phone, point those values at a LAN IP, HTTPS tunnel, or public host that the device can reach.

Do not place database passwords or backend secrets in the mobile env file.
