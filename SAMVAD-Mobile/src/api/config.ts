import { Platform } from 'react-native';

// For a physical Android phone, run `adb reverse tcp:5000 tcp:5000`
// and change the development URL to http://localhost:5000, or use your
// computer's LAN IP. Release builds continue to use the deployed API.
export const BASE_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:5000'
    : 'http://localhost:5000'
  : 'https://samvad-backend-p18q.onrender.com';
