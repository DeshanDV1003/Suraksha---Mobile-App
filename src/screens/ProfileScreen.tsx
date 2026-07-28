import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { incidentService, userService, volunteerService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Globe, Bell, MapPin, Shield, FileText, Phone,
    LogOut, ChevronRight, ClipboardList, CheckSquare,
} from 'lucide-react-native';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const [user, setUser] = React.useState<any>(null);
    const [profileLoading, setProfileLoading] = React.useState(true);
    const [stats, setStats] = React.useState({ reports: 0, tasks: 0 });

    React.useEffect(() => {
        const loadData = async () => {
            // 1. Show cached data immediately — no waiting for network
            const stored = await AsyncStorage.getItem('user');
            if (stored) setUser(JSON.parse(stored));
            setProfileLoading(false);

            // 2. Refresh from network silently in background
            try {
                const [reportsRes, userRes, tasksRes] = await Promise.all([
                    incidentService.getMyReports().catch(() => ({ data: [] })),
                    userService.getMe().catch(() => null),
                    volunteerService.getMyTasks().catch(() => ({ data: [] })),
                ]);

                if (userRes?.data) {
                    setUser(userRes.data);
                    await AsyncStorage.setItem('user', JSON.stringify(userRes.data));
                }

                const completedTasks = (tasksRes?.data || []).filter(
                    (t: any) => t.status === 'COMPLETED' || t.status === 'RESOLVED'
                ).length;
                setStats({ reports: reportsRes?.data?.length || 0, tasks: completedTasks });
            } catch (err) {
                // Network unavailable — cached data is already shown
            }
        };
        loadData();
    }, []);

    const handleLogout = async () => {
        const logoutAction = async () => {
            await AsyncStorage.multiRemove(['token', 'user']);
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Sign out of Suraksha?')) logoutAction();
            return;
        }
        Alert.alert(t('profile.sign_out_title'), t('profile.sign_out_message'), [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('profile.sign_out_btn'), style: 'destructive', onPress: logoutAction },
        ]);
    };

    const notice = (feature: string) =>
        Alert.alert(feature, t('profile.coming_soon'));

    if (profileLoading) return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF', alignItems: 'center', justifyContent: 'center' }}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={{ color: '#64748B', fontSize: 14, fontWeight: '600', marginTop: 12 }}>{t('profile.loading')}</Text>
        </View>
    );

    if (!user) return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>{t('profile.could_not_load')}</Text>
            <Text style={{ color: '#64748B', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>{t('profile.check_connection')}</Text>
            <TouchableOpacity
                onPress={async () => { await AsyncStorage.multiRemove(['token', 'user']); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); }}
                style={{ backgroundColor: '#EF4444', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32 }}
            >
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>{t('profile.sign_out_btn')}</Text>
            </TouchableOpacity>
        </View>
    );

    const initials = (user.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    const langLabel = i18n.language === 'si' ? 'සිංහල' : i18n.language === 'ta' ? 'தமிழ்' : 'English';

    const settingsGroups = [
        {
            title: t('profile.preferences'),
            items: [
                { icon: Globe, label: t('profile.language') || 'Language', value: langLabel, onPress: () => navigation.navigate('Language'), color: '#2563EB' },
                { icon: Bell, label: t('profile.notifications') || 'Notifications', onPress: () => notice('Notifications'), color: '#7C3AED' },
                { icon: MapPin, label: t('profile.location_services') || 'Location Services', onPress: () => notice('Location'), color: '#0D9488' },
            ],
        },
        {
            title: t('profile.account'),
            items: [
                { icon: Phone, label: t('profile.emergency_contacts') || 'Emergency Contacts', onPress: () => notice('Emergency Contacts'), color: '#EF4444' },
                { icon: Shield, label: t('profile.privacy') || 'Privacy & Security', onPress: () => notice('Privacy'), color: '#64748B' },
                { icon: FileText, label: t('profile.terms') || 'Terms of Service', onPress: () => notice('Terms'), color: '#94A3B8' },
            ],
        },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            {/* Gradient hero */}
            <LinearGradient
                colors={['#0F172A', '#1E3A8A', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: insets.top + 16, paddingBottom: 48, paddingHorizontal: 20, alignItems: 'center' }}
            >
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 20 }}>
                    {t('profile.title') || 'Profile'}
                </Text>

                {/* Avatar */}
                <View style={{ width: 80, height: 80, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)' }}>
                    <Text style={{ color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: -1 }}>{initials}</Text>
                </View>

                <Text style={{ color: 'white', fontSize: 20, fontWeight: '800', letterSpacing: -0.3, marginBottom: 4 }}>
                    {user.name || 'User'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '700' }}>
                            {user.role || 'CITIZEN'}
                        </Text>
                    </View>
                    {user.region && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MapPin size={12} color="rgba(255,255,255,0.6)" strokeWidth={2} />
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginLeft: 3 }}>{user.region}</Text>
                        </View>
                    )}
                </View>
            </LinearGradient>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats card overlapping hero */}
                <View style={{ marginHorizontal: 16, marginTop: -28, marginBottom: 20 }}>
                    <View style={{ backgroundColor: 'white', borderRadius: 22, padding: 20, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 }}>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <View style={{ width: 44, height: 44, backgroundColor: '#EFF6FF', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                <ClipboardList size={22} color="#2563EB" strokeWidth={2} />
                            </View>
                            <Text style={{ color: '#0F172A', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }}>{stats.reports}</Text>
                            <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                                {t('profile.reports_submitted') || 'Reports'}
                            </Text>
                        </View>
                        <View style={{ width: 1, backgroundColor: '#F1F5F9', marginVertical: 8 }} />
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <View style={{ width: 44, height: 44, backgroundColor: '#F0FDF4', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                <CheckSquare size={22} color="#10B981" strokeWidth={2} />
                            </View>
                            <Text style={{ color: '#0F172A', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }}>{stats.tasks}</Text>
                            <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                                {t('profile.tasks_completed') || 'Tasks Done'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Settings groups */}
                {settingsGroups.map(group => (
                    <View key={group.title} style={{ marginHorizontal: 16, marginBottom: 16 }}>
                        <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>
                            {group.title}
                        </Text>
                        <View style={{ backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
                            {group.items.map((item, idx) => (
                                <TouchableOpacity
                                    key={item.label}
                                    onPress={item.onPress}
                                    activeOpacity={0.7}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        padding: 16,
                                        borderBottomWidth: idx < group.items.length - 1 ? 1 : 0,
                                        borderBottomColor: '#F8FAFC',
                                    }}
                                >
                                    <View style={{ width: 38, height: 38, backgroundColor: item.color + '15', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                        <item.icon size={18} color={item.color} strokeWidth={2} />
                                    </View>
                                    <Text style={{ flex: 1, color: '#0F172A', fontSize: 14, fontWeight: '600' }}>{item.label}</Text>
                                    {'value' in item && item.value && (
                                        <Text style={{ color: '#94A3B8', fontSize: 13, marginRight: 8 }}>{item.value}</Text>
                                    )}
                                    <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Sign out */}
                <View style={{ marginHorizontal: 16, marginTop: 4 }}>
                    <TouchableOpacity
                        onPress={handleLogout}
                        activeOpacity={0.8}
                        style={{ backgroundColor: '#FFF5F5', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: '#FECACA' }}
                    >
                        <LogOut size={18} color="#EF4444" strokeWidth={2.5} />
                        <Text style={{ color: '#EF4444', fontSize: 15, fontWeight: '700' }}>
                            {t('profile.logout') || 'Sign Out'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
