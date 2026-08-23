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
import { isAlertNearby } from './src/utils/distance';
import { LocationProvider, UserLocation } from './src/context/LocationContext';

const queryClient = new QueryClient();

import { io } from 'socket.io-client';
import { API_BASE_URL } from './src/config';

function GlobalMobileAlertListener() {
  const userCoords = React.useRef<{ lat: number; lng: number } | null>(null);

  React.useEffect(() => {
    // Use the ngrok API URL base (strip /api) for the web backend socket connection
    const webBackendSocket = API_BASE_URL.replace(/\/api$/, '');
    const alertSocket = io(webBackendSocket);
    let locationSubscription: any;

    const setupLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 1000 },
          (location) => {
            const lat = location.coords.latitude;
            const lng = location.coords.longitude;
            userCoords.current = { lat, lng };
            const sectorId = geohash.encode(lat, lng, 5);
            alertSocket.emit('join_sector', sectorId);
          }
        );
      } catch (err) {
        console.warn('Could not start location tracking', err);
      }
    };

    setupLocationTracking();

    // Only show popup if the alert is relevant to the user's current location
    alertSocket.on('new-alert', (alert: any) => {
      const coords = userCoords.current;

      if (coords) {
        const relevant = isAlertNearby(
          {
            latitudes: alert.latitudes,
            longitudes: alert.longitudes,
            locations: alert.locations,
            broadcastRadiusKm: alert.broadcastRadiusKm,
          },
          coords.lat,
          coords.lng,
        );
        if (!relevant) return; // not in the user's area — skip
      }
      // If we don't have coords yet, only show explicitly All-Island alerts
      else if (!(alert.locations ?? []).includes('All Island')) {
        return;
      }

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
      locationSubscription?.remove();
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
  const [userLocation, setUserLocation] = React.useState<UserLocation | null>(null);
  const [userDistrict, setUserDistrict] = React.useState<string | null>(null);

  // Acquire real GPS on startup and keep it updated
  React.useEffect(() => {
    let watchSub: { remove: () => void } | null = null;

    const updateFromCoords = async (lat: number, lng: number) => {
      setUserLocation({ lat, lng });
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (place) setUserDistrict(place.subregion || place.city || place.region || null);
      } catch { /* reverse geocode failures are non-fatal */ }
    };

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        // Use HIGH accuracy (GPS satellite) — Balanced uses cell/WiFi which can be 20–100 km off
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        await updateFromCoords(pos.coords.latitude, pos.coords.longitude);

        // Watch continuously; fires every 200 m of movement with GPS accuracy
        watchSub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 200 },
          (loc) => { updateFromCoords(loc.coords.latitude, loc.coords.longitude); }
        );
      } catch { /* location unavailable — screens handle null gracefully */ }
    })();

    return () => { watchSub?.remove(); };
  }, []);

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
    <LocationProvider value={{ userLocation, userDistrict }}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <GlobalMobileAlertListener />
          <ToastProvider>
            <AppNavigation />
          </ToastProvider>
        </PaperProvider>
      </QueryClientProvider>
    </LocationProvider>
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
