import React, { useEffect, useState } from 'react';
import { View, Text, Platform, TouchableOpacity, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, AlertTriangle, Bell, ClipboardList, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import OfflineBanner from '../components/OfflineBanner';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { notificationService, volunteerService } from '../services/api';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
        </Stack.Navigator>
    );
}

function MainTabNavigator() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [unreadAlerts, setUnreadAlerts] = useState(0);
    const [pendingTasks, setPendingTasks] = useState(0);

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
    const [userToken, setUserToken] = React.useState<string | null>(null);

    React.useEffect(() => {
        AsyncStorage.getItem('token').then(token => {
            setUserToken(token);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A' }}>
                <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
                <Text style={{ color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: -1 }}>SURAKSHA</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 6 }}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <OfflineBanner />
            <NavigationContainer>
                <Stack.Navigator
                    id="root-stack"
                    initialRouteName={userToken ? 'MainTabs' : 'Login'}
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
    );
}
