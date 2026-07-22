import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { EmergencyCard } from '../components/HomeScreen/EmergencyCard';
import { RecentAlertItem } from '../components/HomeScreen/RecentAlertItem';
import { ReportSummaryItem } from '../components/HomeScreen/ReportSummaryItem';
import {
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
} from 'lucide-react-native';
import { ActionGridCard } from '../components/common/ActionGridCard';
import { dashboardService, incidentService, alertService } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const SectionHeader = ({ title, onViewAll }: { title: string; onViewAll?: () => void }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 24 }}>
        <Text style={{ color: '#0F172A', fontSize: 17, fontWeight: '800', letterSpacing: -0.3 }}>{title}</Text>
        {onViewAll && (
            <TouchableOpacity onPress={onViewAll} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#2563EB', fontSize: 13, fontWeight: '700' }}>View all</Text>
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

    const fetchStats = async () => {
        try {
            const stored = await AsyncStorage.getItem('user');
            if (stored) setUserName(JSON.parse(stored)?.name?.split(' ')[0] || '');

            const [statsRes, reportsRes, alertsRes] = await Promise.all([
                dashboardService.getStats(),
                incidentService.getMyReports(),
                alertService.getAlerts().catch(() => ({ data: [] })),
            ]);
            setStats(statsRes.data);
            setReports(reportsRes.data);
            setRecentAlerts((alertsRes.data || []).slice(0, 3));
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const activeCount = stats?.recentIncidents?.filter((i: any) => i.status !== 'RESOLVED').length || 0;
    const resolvedCount = stats?.recentIncidents?.filter((i: any) => i.status === 'RESOLVED').length || 0;

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
                        <AlertCircle size={18} color="rgba(255,255,255,0.8)" strokeWidth={2} />
                        <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginTop: 6 }}>{activeCount}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600' }}>Active</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 14, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
                        <Users size={18} color="rgba(255,255,255,0.8)" strokeWidth={2} />
                        <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginTop: 6 }}>{stats?.volunteersActive || 0}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600' }}>Volunteers</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
                        <CheckCircle2 size={18} color="rgba(255,255,255,0.8)" strokeWidth={2} />
                        <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginTop: 6 }}>{resolvedCount}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600' }}>Resolved</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                <EmergencyCard onReportPress={() => navigation.navigate('Report')} />

                {/* Recent Alerts */}
                <SectionHeader title={t('home.recent_alerts') || 'Recent Alerts'} onViewAll={() => navigation.navigate('Alerts')} />

                {recentAlerts.length === 0 ? (
                    <View style={{ backgroundColor: 'white', borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '600' }}>No active alerts</Text>
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
                <SectionHeader title={t('home.your_reports') || 'Your Reports'} />

                {reports.length === 0 ? (
                    <View style={{ backgroundColor: 'white', borderRadius: 18, padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '600' }}>No reports yet</Text>
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
                            reportId={`#${report.id.substring(0, 8)}`}
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
                    <ActionGridCard label={t('home.relief_camps') || 'Relief Camps'} icon={Building2} onPress={() => navigation.navigate('ReliefCamps')} bgColor="#7C3AED" />
                    <ActionGridCard label={t('home.my_token') || 'My Token'} icon={QrCode} onPress={() => navigation.navigate('ReliefToken')} bgColor="#0D9488" />
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
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <ActionGridCard label={t('home.donate') || 'Donate'} icon={Banknote} onPress={() => navigation.navigate('Donate')} bgColor="#059669" />
                    <ActionGridCard label="Water Levels" icon={Waves} onPress={() => navigation.navigate('WaterLevel')} bgColor="#0369A1" />
                    <View style={{ flex: 1, margin: 6 }} />
                </View>

                <View style={{ height: 16 }} />
            </ScrollView>
        </View>
    );
}
