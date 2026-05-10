import React from 'react';
import { View, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    Home,
    AlertTriangle,
    Bell,
    ClipboardList,
    User,
    CircleAlert
} from 'lucide-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabBadge({ count }: { count: number }) {
    return (
        <View className="absolute -top-1 -right-2 bg-[#EF4444] rounded-full w-5 h-5 items-center justify-center border-2 border-white">
            <Text className="text-white text-[10px] font-bold">{count}</Text>
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
        </Stack.Navigator>
    );
}


function MainTabNavigator() {
    const { t } = useTranslation();

    return (
        <Tab.Navigator
            id="main-tabs"
            screenOptions={{
                tabBarActiveTintColor: '#2563EB',
                tabBarInactiveTintColor: '#94A3B8',
                headerShown: false,
                tabBarStyle: {
                    height: Platform.OS === 'web' ? 70 : 100,
                    paddingBottom: Platform.OS === 'web' ? 10 : 35,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: '#F1F5F9',
                    backgroundColor: '#FFFFFF',
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '800',
                    marginBottom: Platform.OS === 'web' ? 8 : 0,
                }
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeStackNavigator}
                options={{
                    tabBarIcon: ({ color }) => <Home color={color} size={32} strokeWidth={2.5} />,
                    title: t('common.home') || 'Home',
                }}
            />
            <Tab.Screen
                name="Report"
                component={ReportScreen}
                options={{
                    tabBarIcon: ({ color }) => <CircleAlert color={color} size={32} strokeWidth={2.5} />,
                    title: t('common.report') || 'Report',
                }}
            />
            <Tab.Screen
                name="Alerts"
                component={AlertsScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <View>
                            <Bell color={color} size={32} strokeWidth={2.5} />
                            <TabBadge count={3} />
                        </View>
                    ),
                    title: t('common.alerts') || 'Alerts',
                }}
            />
            <Tab.Screen
                name="Tasks"
                component={TasksScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <View>
                            <ClipboardList color={color} size={32} strokeWidth={2.5} />
                            <TabBadge count={2} />
                        </View>
                    ),
                    title: t('tasks.title') || 'Tasks',
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color }) => <User color={color} size={32} strokeWidth={2.5} />,
                    title: t('profile.title') || 'Profile',
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigation() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [userToken, setUserToken] = React.useState<string | null>(null);

    React.useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('token');
            setUserToken(token);
            setIsLoading(false);
        };
        checkToken();
    }, []);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="text-2xl font-black text-[#2563EB] animate-pulse uppercase tracking-tighter">Suraksha</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator 
                id="root-stack"
                initialRouteName={userToken ? "MainTabs" : "Login"}
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                <Stack.Screen
                    name="Language"
                    component={LanguageScreen}
                    options={{
                        animation: 'slide_from_right'
                    }}
                />
                <Stack.Screen name="ReportStack" component={ReportScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
