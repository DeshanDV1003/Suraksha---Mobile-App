import React from 'react';
import { View, Text } from 'react-native';
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

import { useTranslation } from 'react-i18next';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ReportScreen from '../screens/ReportScreen';
import AlertsScreen from '../screens/AlertsScreen';
import TasksScreen from '../screens/TasksScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LanguageScreen from '../screens/LanguageScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabBadge({ count }: { count: number }) {
    return (
        <View className="absolute -top-1 -right-2 bg-[#EF4444] rounded-full w-5 h-5 items-center justify-center border-2 border-white">
            <Text className="text-white text-[10px] font-bold">{count}</Text>
        </View>
    );
}

function MainTabNavigator() {
    const { t } = useTranslation();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#2563EB', // Suraksha Blue
                tabBarInactiveTintColor: '#9CA3AF',
                headerShown: false,
                tabBarStyle: {
                    height: 90,
                    paddingBottom: 25,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: '#F3F4F6',
                    backgroundColor: '#FFFFFF',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '700',
                }
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => <Home color={color} size={28} />,
                    title: t('common.home') || 'Home',
                }}
            />
            <Tab.Screen
                name="Report"
                component={ReportScreen}
                options={{
                    tabBarIcon: ({ color }) => <AlertTriangle color={color} size={28} />,
                    title: t('report.title') || 'Report',
                }}
            />
            <Tab.Screen
                name="Alerts"
                component={AlertsScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <View>
                            <Bell color={color} size={28} />
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
                            <ClipboardList color={color} size={28} />
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
                    tabBarIcon: ({ color }) => <User color={color} size={28} />,
                    title: t('profile.title') || 'Profile',
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
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
