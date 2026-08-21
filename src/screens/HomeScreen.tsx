import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StatusBar, Alert, ActivityIndicator, Vibration } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { EmergencyCard } from '../components/HomeScreen/EmergencyCard';
import { RecentAlertItem } from '../components/HomeScreen/RecentAlertItem';
import { ReportSummaryItem } from '../components/HomeScreen/ReportSummaryItem';
import {
    Bell,
    AlertCircle,
    Users,
    CheckCircle2,
    ChevronRight,
    Heart,
    Package,
    Building2,
    QrCode,
    CheckSquare,
    BookOpen,
    ClipboardList,
    Banknote,
    UserSearch,
    HandHelping,
    HeartPulse,
    Globe,
    Waves,
    ShieldCheck,
    Route,
    Siren,
} from 'lucide-react-native';
import { ActionGridCard } from '../components/common/ActionGridCard';
import { dashboardService, incidentService, alertService, sosService } from '../services/api';
import { getCache, setCache } from '../services/cache';
import { useUserLocation } from '../context/LocationContext';
import { useIsVolunteer } from '../context/UserContext';
import { isAlertNearby } from '../utils/distance';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const SectionHeader = ({ title, onViewAll, viewAllLabel }: { title: string; onViewAll?: () => void; viewAllLabel?: string }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 24 }}>
        <Text style={{ color: '#0F172A', fontSize: 17, fontWeight: '800', letterSpacing: -0.3 }}>{title}</Text>
        {onViewAll && (
            <TouchableOpacity onPress={onViewAll} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#2563EB', fontSize: 13, fontWeight: '700' }}>{viewAllLabel || 'View all'}</Text>
                <ChevronRight size={16} color="#2563EB" strokeWidth={2.5} />
            </TouchableOpacity>
        )}
    </View>
);

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [stats, setStats] = useState<any>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
    const [userName, setUserName] = useState('');
    const [sosSending, setSosSending] = useState(false);
    const userLocation = useUserLocation();
    const isVolunteer = useIsVolunteer();

    const handleSOS = () => {
        Vibration.vibrate([0, 100, 100, 100]);
        Alert.alert(
            '🆘 SEND SOS EMERGENCY?',
            'This will immediately alert all nearby responders and emergency services with your GPS location. Only use in a real emergency.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'SEND SOS NOW',
                    style: 'destructive',
                    onPress: async () => {
                        setSosSending(true);
                        Vibration.vibrate(500);
                        try {
                            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }).catch(() => null);
                            await sosService.trigger({
                                latitude: pos?.coords.latitude ?? null,
                                longitude: pos?.coords.longitude ?? null,
                            });
                            Alert.alert('✅ SOS Sent', 'Emergency responders have been alerted with your location. Stay where you are if it is safe.');
                        } catch {
                            Alert.alert('⚠ Failed', 'Could not send SOS. Please call 119 or 1990 immediately.');
                        } finally {
                            setSosSending(false);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const fetchStats = useCallback(async () => {
        // 1. Show cached data immediately — no waiting
        const stored = await AsyncStorage.getItem('user');
        if (stored) setUserName(JSON.parse(stored)?.name?.split(' ')[0] || '');

        const [cachedStats, cachedReports, cachedAlerts] = await Promise.all([
            getCache<any>('home_stats'),
            getCache<any[]>('home_reports'),
            getCache<any[]>('home_alerts'),
        ]);
        if (cachedStats)   setStats(cachedStats);
        if (cachedReports) setReports(cachedReports);
        if (cachedAlerts)  setRecentAlerts(cachedAlerts);

        // 2. Refresh from network silently
        try {
            const [statsRes, reportsRes, alertsRes] = await Promise.all([
                dashboardService.getStats().catch(() => null),
                incidentService.getMyReports().catch(() => null),
                alertService.getAlerts().catch(() => null),
            ]);
            if (statsRes?.data)   { setStats(statsRes.data);   setCache('home_stats', statsRes.data); }
            if (reportsRes?.data) { setReports(reportsRes.data); setCache('home_reports', reportsRes.data); }
            if (alertsRes?.data)  {
                const all = alertsRes.data || [];
                const nearby = userLocation
                    ? all.filter((a: any) => isAlertNearby(a, userLocation.lat, userLocation.lng))
                    : all;
                const top3 = nearby.slice(0, 3);
                setRecentAlerts(top3);
                setCache('home_alerts', top3);
            }
        } catch {}
    }, [userLocation]);

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [fetchStats])
    );

    // Citizen-relevant stats: their own reports + nearby alerts
    const myReportCount = reports.length;
    const myPendingCount = reports.filter((r: any) => r.status !== 'RESOLVED').length;
    const nearbyAlertCount = recentAlerts.length;

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            {/* Gradient header */}
            <LinearGradient
                colors={['#0F172A', '#1E3A8A', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: insets.top + 10, paddingBottom: 28, paddingHorizontal: 20 }}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500', marginBottom: 2 }}>
                            {t('home.welcome') || 'Welcome back'}
                        </Text>
                        <Text style={{ color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }}>
                            {userName ? `Hi, ${userName} 👋` : 'Suraksha'}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 3 }}>
                            {t('home.subtitle') || 'Stay safe, stay informed'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Language')}
                        style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Globe size={20} color="white" strokeWidth={2} />
                    </TouchableOpacity>
                </View>

                {/* Stats row inside header */}
                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 14, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
                        <Bell size={18} color="rgba(255,255,255,0.8)" strokeWidth={2} />
                        <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginTop: 6 }}>{nearbyAlertCount}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600' }}>{t('home.nearby_alerts')}</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 14, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
                        <ClipboardList size={18} color="rgba(255,255,255,0.8)" strokeWidth={2} />
                        <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginTop: 6 }}>{myReportCount}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600' }}>{t('home.my_reports')}</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
                        <CheckCircle2 size={18} color="rgba(255,255,255,0.8)" strokeWidth={2} />
                        <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginTop: 6 }}>{myPendingCount}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600' }}>{t('home.pending')}</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* SOS Panic Button */}
                <TouchableOpacity
                    onPress={handleSOS}
                    disabled={sosSending}
                    activeOpacity={0.85}
                    style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 16 }}
                >
                    <LinearGradient
                        colors={['#DC2626', '#7F1D1D']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{
                            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                            paddingVertical: 18, paddingHorizontal: 24, gap: 12,
                        }}
                    >
                        {sosSending ? (
                            <>
                                <ActivityIndicator color="white" size="small" />
                                <Text style={{ color: 'white', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>SENDING SOS…</Text>
                            </>
                        ) : (
                            <>
                                <Siren size={26} color="white" />
                                <View>
                                    <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', letterSpacing: 3 }}>SOS</Text>
                                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>TAP FOR EMERGENCY HELP</Text>
                                </View>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <EmergencyCard onReportPress={() => navigation.navigate('Report')} />

                {/* Recent Alerts */}
                <SectionHeader title={t('home.recent_alerts')} onViewAll={() => navigation.navigate('Alerts')} viewAllLabel={t('common.view_all')} />

                {recentAlerts.length === 0 ? (
                    <View style={{ backgroundColor: 'white', borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '600' }}>{t('home.no_active_alerts')}</Text>
                    </View>
                ) : (
                    recentAlerts.map((alert) => (
                        <RecentAlertItem
                            key={alert.id}
                            title={alert.title || alert.type}
                            location={alert.location || alert.area || ''}
                            time={dayjs(alert.createdAt).fromNow()}
                            variant={alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? 'danger' : 'warning'}
                        />
                    ))
                )}

                {/* Your Reports */}
                <SectionHeader title={t('home.your_reports')} />

                {reports.length === 0 ? (
                    <View style={{ backgroundColor: 'white', borderRadius: 18, padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '600' }}>{t('home.no_reports_yet')}</Text>
                    </View>
                ) : (
                    reports.slice(0, 3).map((report) => (
                        <ReportSummaryItem
                            key={report.id}
                            title={report.category || report.title}
                            location={report.location}
                            statusLabel={report.status}
                            statusVariant={
                                report.status === 'PENDING' ? 'pending' :
                                report.status === 'ASSIGNED' ? 'assigned' :
                                report.status === 'RESOLVED' ? 'resolved' : 'pending'
                            }
                            reportId={`#${report.id?.substring(0, 8) ?? 'unknown'}`}
                        />
                    ))
                )}

                {/* Safety & Resources */}
                <SectionHeader title={t('home.safety_resources') || 'Safety & Resources'} />
                <View style={{ flexDirection: 'row' }}>
                    <ActionGridCard label={t('home.family_safety') || 'Family Safety'} icon={Heart} onPress={() => navigation.navigate('FamilySafety')} bgColor="#E11D48" />
                    <ActionGridCard label={t('home.missing_persons') || 'Missing Persons'} icon={UserSearch} onPress={() => navigation.navigate('MissingPersons')} bgColor="#BE185D" />
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <ActionGridCard label={t('home.help_requests') || 'Help Requests'} icon={HandHelping} onPress={() => navigation.navigate('HelpRequests')} bgColor="#1D4ED8" />
                    <ActionGridCard label={t('home.resources') || 'Resources'} icon={Package} onPress={() => navigation.navigate('Resources')} bgColor="#0284C7" />
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <ActionGridCard label="Health Assistant" icon={Building2} onPress={() => navigation.navigate('Chatbot')} bgColor="#0891b2" />
                    <ActionGridCard label={t('home.relief_camps') || 'Relief Camps'} icon={Building2} onPress={() => navigation.navigate('ReliefCamps')} bgColor="#7C3AED" />
                    {isVolunteer && (
                        <ActionGridCard label={t('home.my_token') || 'My Token'} icon={QrCode} onPress={() => navigation.navigate('ReliefToken')} bgColor="#0D9488" />
                    )}
                </View>

                {/* Information & Support */}
                <SectionHeader title={t('home.info_support') || 'Information & Support'} />
                <View style={{ flexDirection: 'row' }}>
                    <ActionGridCard label={t('home.preparedness') || 'Preparedness'} icon={CheckSquare} onPress={() => navigation.navigate('Preparedness')} bgColor="#0F766E" />
                    <ActionGridCard label={t('home.education') || 'Education'} icon={BookOpen} onPress={() => navigation.navigate('Education')} bgColor="#4F46E5" />
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <ActionGridCard label={t('home.damage_report') || 'Damage Report'} icon={ClipboardList} onPress={() => navigation.navigate('DamageReport')} bgColor="#EA580C" />
                    <ActionGridCard label={t('home.mental_support') || 'Counseling'} icon={HeartPulse} onPress={() => navigation.navigate('Support')} bgColor="#6D28D9" />
                    <ActionGridCard label={t('home.donate') || 'Donate'} icon={Banknote} onPress={() => navigation.navigate('Donate')} bgColor="#059669" />
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <ActionGridCard label={t('home.water_levels')} icon={Waves} onPress={() => navigation.navigate('WaterLevel')} bgColor="#0369A1" />
                    <ActionGridCard label={t('home.safe_zones')} icon={ShieldCheck} onPress={() => navigation.navigate('SafeZone')} bgColor="#16A34A" />
                    <ActionGridCard label={t('home.safe_route')} icon={Route} onPress={() => navigation.navigate('SafeRoute')} bgColor="#7C3AED" />
                </View>

                <View style={{ height: 16 }} />
            </ScrollView>
        </View>
    );
}
