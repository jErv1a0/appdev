React Navigation and related packages are required for the new Launch/Login/Signup flow.

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

React Native app-safe values live in `.env.mobile` and are read through `SRC/config/env.ts`, `SRC/config/api.ts`, and `SRC/config/firebaseConfig.ts`.

- Template (safe to commit): `.env.mobile.example`
- Local runtime values (git-ignored): `.env.mobile`

Do not place database passwords or backend secrets in the mobile env file.
