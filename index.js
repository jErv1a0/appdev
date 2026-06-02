/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Defer Firebase initialization until the JS bundle and native modules are ready.
// This avoids crashes at startup when native env variables or Google services are missing.
// Firebase services will still be created on-demand by `SRC/config/firebase`.
AppRegistry.registerComponent(appName, () => App);
