import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import api from './api';

// Remote push notifications are not supported in Expo Go SDK 53+.
// Local notifications (alerts shown while app is open) still work fine.
const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    (Constants as any).appOwnership === 'expo';

// Fire a local notification — works in Expo Go and APK builds alike
export const showLocalNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: null, // fire immediately
    });
};

// Configure how local notifications are displayed (works in both Expo Go and builds)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const registerForPushNotificationsAsync = async (): Promise<string | undefined> => {
    // Remote push tokens only work in a development build or production binary
    if (isExpoGo) {
        return undefined;
    }

    if (!Device.isDevice) {
        return undefined;
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Suraksha Alerts',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2563EB',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return undefined;
    }

    try {
        const { data: token } = await Notifications.getExpoPushTokenAsync();

        // Register token with backend
        await api.patch('/auth/push-token', { pushToken: token }).catch(() => {
            // Non-fatal if backend is unreachable
        });

        return token;
    } catch {
        // Token fetch can fail in some environments — not critical
        return undefined;
    }
};
