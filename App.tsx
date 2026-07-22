// Must be imported before any Expo modules that log warnings at init time
import './src/utils/suppressDevWarnings';
import React from 'react';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Platform, View, StyleSheet } from 'react-native';
import './src/i18n';
import './src/global.css';
import AppNavigation from './src/navigation';
import { ToastProvider } from './src/context/ToastContext';
import { StatusBar } from 'expo-status-bar';
import { socketService } from './src/services/socket';
import { registerForPushNotificationsAsync } from './src/services/notificationService';
import { openDatabase } from './src/storage/localDB';
import { startNetworkMonitoring } from './src/services/networkMonitor';
import { registerBackgroundSync } from './src/services/backgroundSync';
import { preloadCriticalData } from './src/services/preloadService';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import geohash from 'ngeohash';

const queryClient = new QueryClient();

import { io } from 'socket.io-client';

function GlobalMobileAlertListener() {
  React.useEffect(() => {
    // Explicitly connect to the main Web Backend port (3001) where alerts are dispatched
    const alertSocket = io('http://192.168.8.121:3001');
    let locationSubscription: any;

    const setupLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permission to access location was denied for alerts');
          return;
        }

        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 1000 },
          (location) => {
            const lat = location.coords.latitude;
            const lon = location.coords.longitude;
            const sectorId = geohash.encode(lat, lon, 5);
            // Emit join_sector whenever location changes (or initially)
            alertSocket.emit('join_sector', sectorId);
          }
        );
      } catch (err) {
        console.warn("Could not start location tracking", err);
      }
    };

    setupLocationTracking();

    // Listen to all real-time alerts (general, water threshold, and ML predictions)
    alertSocket.on('new-alert', (alert: any) => {
      const isML = alert.source === 'ml-water-predictor';
      const isWater = alert.source === 'water-monitor';
      const isEmergency = alert.type === 'EMERGENCY';
      const prefix = isEmergency ? '🚨' : (isML || isWater) ? '🌊' : '⚠️';
      const subtitle = isML ? '\n\n🧠 AI Flood Prediction' : '';
      Alert.alert(
        `${prefix} ${alert.title}`,
        `${alert.message}${subtitle}`,
        [{ text: 'OK', style: 'default' }],
        { cancelable: true }
      );
    });

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      alertSocket.disconnect();
    };
  }, []);

  return null;
}

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1e3a8a',
    secondary: '#10b981',
  },
};

export default function App() {
  const initialized = React.useRef(false);

  React.useEffect(() => {
    // Guard against React StrictMode double-invoke in development
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      await openDatabase();
      await startNetworkMonitoring();
      await registerBackgroundSync();  // no-op in Expo Go
      await preloadCriticalData();
      await registerForPushNotificationsAsync();  // no-op in Expo Go
    }
    init();

    socketService.connect();
    return () => socketService.disconnect();
  }, []);

  const content = (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <GlobalMobileAlertListener />
        <ToastProvider>
          <AppNavigation />
        </ToastProvider>
      </PaperProvider>
    </QueryClientProvider>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webContent}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webContent: {
    width: '100%',
    maxWidth: 430,
    height: '100%',
    maxHeight: 932,
    backgroundColor: '#fff',
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.15,
    shadowRadius: 50,
    elevation: 20,
    marginVertical: 40,
    borderWidth: 10,
    borderColor: '#1E293B', // Dark bezel color
    paddingBottom: Platform.OS === 'web' ? 5 : 0,
  }
});
