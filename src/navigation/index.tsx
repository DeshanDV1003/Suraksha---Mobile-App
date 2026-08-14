import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Platform, TouchableOpacity, StatusBar, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, AlertTriangle, Bell, ClipboardList, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import OfflineBanner from '../components/OfflineBanner';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import LocationGateScreen from '../screens/LocationGateScreen';
import { LocationProvider, UserLocation } from '../context/LocationContext';
import { UserProvider, UserRole, useIsVolunteer } from '../context/UserContext';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ReportScreen from '../screens/ReportScreen';
import AlertsScreen from '../screens/AlertsScreen';
import TasksScreen from '../screens/TasksScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LanguageScreen from '../screens/LanguageScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FamilySafetyScreen from '../screens/FamilySafetyScreen';
import ReliefCampsScreen from '../screens/ReliefCampsScreen';
import ReliefTokenScreen from '../screens/ReliefTokenScreen';
import PreparednessScreen from '../screens/PreparednessScreen';
import EducationScreen from '../screens/EducationScreen';
import DamageReportScreen from '../screens/DamageReportScreen';
import DonateScreen from '../screens/DonateScreen';
import MissingPersonsScreen from '../screens/MissingPersonsScreen';
import HelpRequestsScreen from '../screens/HelpRequestsScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import SupportScreen from '../screens/SupportScreen';
import WaterLevelScreen from '../screens/WaterLevelScreen';
import SafeZoneScreen from '../screens/SafeZoneScreen';
import SafeRouteScreen from '../screens/SafeRouteScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import { notificationService, volunteerService, locationService, API_BASE_URL } from '../services/api';
import { showLocalNotification } from '../services/notificationService';
import { socketService } from '../services/socket';
import i18n from '../i18n';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

async function reverseGeocodeDistrict(lat: number, lng: number): Promise<string | null> {
    try {
        const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        // In Sri Lanka, subregion maps to the district (e.g. "Galle", "Colombo")
        return place?.subregion || place?.city || place?.region || null;
    } catch {
        return null;
    }
}

function Badge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <View style={{
            position: 'absolute',
            top: -4,
            right: -8,
            backgroundColor: '#EF4444',
            borderRadius: 10,
            minWidth: 18,
            height: 18,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
            borderWidth: 2,
            borderColor: 'white',
        }}>
            <Text style={{ color: 'white', fontSize: 9, fontWeight: '900' }}>
                {count > 99 ? '99+' : count}
            </Text>
        </View>
    );
}

function HomeStackNavigator() {
    return (
        <Stack.Navigator id="home-stack" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="FamilySafety" component={FamilySafetyScreen} />
            <Stack.Screen name="ReliefCamps" component={ReliefCampsScreen} />
            <Stack.Screen name="ReliefToken" component={ReliefTokenScreen} />
            <Stack.Screen name="Preparedness" component={PreparednessScreen} />
            <Stack.Screen name="Education" component={EducationScreen} />
            <Stack.Screen name="DamageReport" component={DamageReportScreen} />
            <Stack.Screen name="Donate" component={DonateScreen} />
            <Stack.Screen name="MissingPersons" component={MissingPersonsScreen} />
            <Stack.Screen name="HelpRequests" component={HelpRequestsScreen} />
            <Stack.Screen name="Resources" component={ResourcesScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="WaterLevel" component={WaterLevelScreen} />
            <Stack.Screen name="SafeZone" component={SafeZoneScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="SafeRoute" component={SafeRouteScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ animation: 'slide_from_bottom' }} />
        </Stack.Navigator>
    );
}

function MainTabNavigator() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [unreadAlerts, setUnreadAlerts] = useState(0);
    const [pendingTasks, setPendingTasks] = useState(0);
    const isVolunteer = useIsVolunteer();

    useEffect(() => {
        const fetchBadgeCounts = async () => {
            try {
                const [notifRes, tasksRes] = await Promise.all([
                    notificationService.getNotifications().catch(() => ({ data: [] })),
                    volunteerService.getMyTasks().catch(() => ({ data: [] })),
                ]);
                const unread = (notifRes.data || []).filter((n: any) => !n.read).length;
                setUnreadAlerts(unread);
                const pending = (tasksRes.data || []).filter((t: any) => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
                setPendingTasks(pending);
            } catch {}
        };
        fetchBadgeCounts();
        const interval = setInterval(fetchBadgeCounts, 60000);

        // Listen for real-time alerts via socket and show a local notification
        // Local notifications work in both Expo Go and APK builds
        socketService.on('new-alert', (alert: any) => {
            const title = `🚨 ${alert.title || 'Emergency Alert'}`;
            const body = alert.message || '';
            showLocalNotification(title, body);
            setUnreadAlerts(prev => prev + 1);
        });

        return () => clearInterval(interval);
    }, []);

    return (
        <Tab.Navigator
            id="main-tabs"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#2563EB',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarStyle: {
                    height: Platform.OS === 'web' ? 70 : 64 + insets.bottom,
                    paddingBottom: Platform.OS === 'web' ? 10 : insets.bottom,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: '#F1F5F9',
                    backgroundColor: '#FFFFFF',
                    elevation: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 16,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '700',
                    marginTop: 2,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeStackNavigator}
                options={{
                    title: t('common.home') || 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ alignItems: 'center' }}>
                            <Home color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Report"
                component={ReportScreen}
                options={{
                    title: t('common.report') || 'Report',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ alignItems: 'center' }}>
                            <AlertTriangle color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Alerts"
                component={AlertsScreen}
                options={{
                    title: t('common.alerts') || 'Alerts',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ alignItems: 'center' }}>
                            <Bell color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
                            <Badge count={unreadAlerts} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Tasks"
                component={TasksScreen}
                options={{
                    title: t('tasks.title') || 'Tasks',
                    tabBarItemStyle: isVolunteer ? undefined : { display: 'none' },
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ alignItems: 'center' }}>
                            <ClipboardList color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
                            <Badge count={pendingTasks} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: t('profile.title') || 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ alignItems: 'center' }}>
                            <User color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigation() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [userRole, setUserRole] = React.useState<UserRole>('CITIZEN');
    const navigationRef = useRef<any>(null);
    const appState = useRef(AppState.currentState);
    const [locationGranted, setLocationGranted] = React.useState(false);
    const [userLocation, setUserLocation] = React.useState<UserLocation | null>(null);
    const [userDistrict, setUserDistrict] = React.useState<string | null>(null);

    React.useEffect(() => {
        const init = async () => {
            try {
                // Restore saved language before anything else renders
                const savedLang = await AsyncStorage.getItem('app_language');
                if (savedLang) i18n.changeLanguage(savedLang);

                // Check location permission first
                const { status } = await Location.getForegroundPermissionsAsync();
                if (status === 'granted') {
                    setLocationGranted(true);
                    try {
                        const last = await Location.getLastKnownPositionAsync();
                        if (last) {
                            setUserLocation({ lat: last.coords.latitude, lng: last.coords.longitude });
                            reverseGeocodeDistrict(last.coords.latitude, last.coords.longitude)
                                .then(d => { if (d) setUserDistrict(d); });
                        }
                        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
                            .then(async pos => {
                                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                                const d = await reverseGeocodeDistrict(pos.coords.latitude, pos.coords.longitude);
                                if (d) setUserDistrict(d);
                            })
                            .catch(() => {});
                    } catch {}
                }

                // Restore role from storage so UserProvider is ready after login
                const stored = await AsyncStorage.getItem('user');
                if (stored) setUserRole((JSON.parse(stored).role as UserRole) || 'CITIZEN');
            } catch {}
            finally {
                setIsLoading(false);
            }
        };
        init();

        // Volunteer GPS tracking — send location every 30s when role is set and field-eligible
        let gpsInterval: ReturnType<typeof setInterval> | null = null;
        if (['VOLUNTEER', 'FIELD_RESPONDER'].includes(userRole) && userRole !== 'CITIZEN') {
            gpsInterval = setInterval(async () => {
                try {
                    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    locationService.logLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }).catch(() => {});
                    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                } catch {}
            }, 30_000);
        }

        // When the app returns from background (screen lock / home button / app switch),
        // force the user back to the Login screen for a fresh session.
        const subscription = AppState.addEventListener('change', nextState => {
            if (appState.current === 'background' && nextState === 'active') {
                // Clear in-memory role so previous user's UI doesn't flash
                setUserRole('CITIZEN');
                navigationRef.current?.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }
            appState.current = nextState;
        });

        return () => { subscription.remove(); if (gpsInterval) clearInterval(gpsInterval); };
    }, [userRole]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A' }}>
                <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
                <Text style={{ color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: -1 }}>SURAKSHA</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 6 }}>Loading...</Text>
            </View>
        );
    }

    const linking = {
        prefixes: ['suraksha://'],
        config: {
            screens: {
                MainTabs: {
                    screens: {
                        Home: {
                            screens: {
                                SafeZone: 'safezone',
                            },
                        },
                    },
                },
            },
        },
    };

    // Block everything until location is granted
    if (!locationGranted) {
        return (
            <LocationGateScreen onGranted={async () => {
                setLocationGranted(true);
                try {
                    const last = await Location.getLastKnownPositionAsync();
                    if (last) {
                        setUserLocation({ lat: last.coords.latitude, lng: last.coords.longitude });
                        reverseGeocodeDistrict(last.coords.latitude, last.coords.longitude)
                            .then(d => { if (d) setUserDistrict(d); });
                    }
                    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
                        .then(async pos => {
                            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                            const d = await reverseGeocodeDistrict(pos.coords.latitude, pos.coords.longitude);
                            if (d) setUserDistrict(d);
                        })
                        .catch(() => {});
                } catch {}
            }} />
        );
    }

    return (
        <UserProvider value={{ role: userRole }}>
        <LocationProvider value={{ userLocation, userDistrict }}>
        <View style={{ flex: 1 }}>
            <OfflineBanner />
            <NavigationContainer
                ref={navigationRef}
                linking={linking}
                onStateChange={async () => {
                    // Re-sync role from AsyncStorage on every navigation change.
                    // This ensures that after login (which saves role then navigates),
                    // the UserProvider immediately gets the correct role.
                    const stored = await AsyncStorage.getItem('user');
                    if (stored) {
                        const role = (JSON.parse(stored).role as UserRole) || 'CITIZEN';
                        setUserRole(role);
                    }
                }}
            >
                <Stack.Navigator
                    id="root-stack"
                    initialRouteName="Login"
                    screenOptions={{ headerShown: false }}
                >
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                    <Stack.Screen
                        name="Language"
                        component={LanguageScreen}
                        options={{ animation: 'slide_from_right' }}
                    />
                    <Stack.Screen name="ReportStack" component={ReportScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </View>
        </LocationProvider>
        </UserProvider>
    );
}
