// Hide the LogBox on-screen warning/error bar in development.
// The bar (amber strip at top) appears whenever any console.warn fires.
// All messages are still visible in the Metro terminal — this only removes
// the in-app overlay so it doesn't distract during Expo Go testing.
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs();
