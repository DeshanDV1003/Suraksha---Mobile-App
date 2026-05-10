import React from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header } from '../components/common/Header';
import { UserProfileCard } from '../components/ProfileScreen/UserProfileCard';
import { StatsCard } from '../components/common/StatsCard';
import { SettingsList } from '../components/ProfileScreen/SettingsList';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();
    const [user, setUser] = React.useState<any>(null);
    const [stats, setStats] = React.useState({ reports: 0, tasks: 0 });

    React.useEffect(() => {
        const loadData = async () => {
            try {
                // Try to load from storage first for immediate display
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) setUser(JSON.parse(storedUser));

                // Fetch real-time stats
                const [reportsRes, userRes] = await Promise.all([
                    incidentService.getMyReports().catch(() => ({ data: [] })),
                    userService.getMe().catch(() => null)
                ]);

                if (userRes) {
                    setUser(userRes.data);
                    await AsyncStorage.setItem('user', JSON.stringify(userRes.data));
                }

                setStats({
                    reports: reportsRes.data.length || 0,
                    tasks: userRes?.data?.role === 'VOLUNTEER' ? 12 : 0 // Mock tasks for now
                });
            } catch (err) {
                console.log('Error loading profile data:', err);
            }
        };
        loadData();
    }, []);

    const handleLogout = async () => {
        Alert.alert(
            t('profile.logout'),
            'Are you sure you want to logout?',
            [
                { text: t('common.cancel'), style: 'cancel' },
                { 
                    text: t('profile.logout'), 
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.multiRemove(['token', 'user']);
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    }
                }
            ]
        );
    };

    const showFeatureNotice = (feature: string) => {
        Alert.alert(feature, 'This feature will be available in the next update.');
    };

    if (!user) return null;

    return (
        <View className="flex-1 bg-white">
            <Header title={t('profile.title')} />

            <ScrollView className="flex-1 px-6 pt-4">
                <UserProfileCard
                    name={user.name || 'User'}
                    role={user.role || 'Citizen'}
                    location={user.region || 'Colombo'}
                    verifiedLabel={t('profile.verified')}
                />

                <View className="flex-row justify-between mb-8">
                    <StatsCard
                        label={t('profile.reports_submitted')}
                        count={stats.reports}
                        variant="white"
                        className="mr-2"
                        customCountColor="text-[#2563EB]"
                    />
                    <StatsCard
                        label={t('profile.tasks_completed')}
                        count={stats.tasks}
                        variant="white"
                        className="ml-2"
                        customCountColor="text-[#10B981]"
                    />
                </View>

                <SettingsList
                    onLanguagePress={() => navigation.navigate('Language')}
                    onLogoutPress={handleLogout}
                    onNotificationsPress={() => showFeatureNotice(t('profile.notifications'))}
                    onLocationPress={() => showFeatureNotice(t('profile.location_services'))}
                    onPrivacyPress={() => showFeatureNotice(t('profile.privacy'))}
                    onTermsPress={() => showFeatureNotice(t('profile.terms'))}
                    onEmergencyPress={() => showFeatureNotice(t('profile.emergency_contacts'))}
                    labels={{
                        settings: t('profile.settings'),
                        language: t('profile.language'),
                        notifications: t('profile.notifications'),
                        location: t('profile.location_services'),
                        privacy: t('profile.privacy'),
                        terms: t('profile.terms'),
                        emergency: t('profile.emergency_contacts'),
                        logout: t('profile.logout'),
                        currentLanguage: i18n.language === 'en' ? 'English' : i18n.language === 'si' ? 'සිංහල' : 'தமிழ்'
                    }}
                />
            </ScrollView>
        </View>
    );
}
