import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Home, AlertTriangle, User, FileText } from 'lucide-react-native';

// Actual Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { View, Text } from 'react-native';

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View className="flex-1 items-center justify-center bg-white">
    <Text className="text-xl font-bold text-gray-800">{name} Screen</Text>
    <Text className="text-gray-500 mt-2 italic">Coming Soon</Text>
  </View>
);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ReportPlaceholder = () => {
  const { t } = useTranslation();
  return <PlaceholderScreen name={t('report_incident')} />;
};

const AlertsPlaceholder = () => {
  const { t } = useTranslation();
  return <PlaceholderScreen name={t('alerts')} />;
};

function MainTabNavigator() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1e3a8a',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          title: t('home'),
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportPlaceholder}
        options={{
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
          title: t('report_incident'),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsPlaceholder}
        options={{
          tabBarIcon: ({ color, size }) => <AlertTriangle color={color} size={size} />,
          title: t('alerts'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          title: t('profile'),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
