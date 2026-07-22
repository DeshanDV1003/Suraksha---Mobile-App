import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { AlertDetailCard } from '../components/AlertsScreen/AlertDetailCard';
import { alertService } from '../services/api';
import { BellOff, Wifi } from 'lucide-react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

type FilterType = 'ALL' | 'EMERGENCY' | 'WARNING' | 'INFO';

export default function AlertsScreen() {
    const { t } = useTranslation();
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>('ALL');

    const fetchAlerts = async () => {
        try {
            const res = await alertService.getAlerts();
            setAlerts(res.data);
        } catch (err) {
            console.error('Failed to fetch alerts', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchAlerts(); }, []);

    const onRefresh = () => { setRefreshing(true); fetchAlerts(); };

    const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.type === filter);

    const filters: { key: FilterType; label: string; color: string }[] = [
        { key: 'ALL',       label: `All (${alerts.length})`,   color: '#0F172A' },
        { key: 'EMERGENCY', label: 'Emergency',                color: '#EF4444' },
        { key: 'WARNING',   label: 'Warning',                  color: '#F97316' },
        { key: 'INFO',      label: 'Info',                     color: '#3B82F6' },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header
                title={t('alerts.title') || 'Alerts'}
                subtitle="Live emergency broadcasts"
            />

            {/* Filter chips */}
            <View style={{ backgroundColor: 'white', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {filters.map(f => (
                        <TouchableOpacity
                            key={f.key}
                            onPress={() => setFilter(f.key)}
                            activeOpacity={0.7}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 20,
                                backgroundColor: filter === f.key ? f.color : '#F8FAFC',
                                borderWidth: 1.5,
                                borderColor: filter === f.key ? f.color : '#E2E8F0',
                            }}
                        >
                            <Text style={{
                                color: filter === f.key ? 'white' : '#64748B',
                                fontSize: 12,
                                fontWeight: '700',
                            }}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
                showsVerticalScrollIndicator={false}
            >
                {loading && !refreshing ? (
                    <View style={{ paddingVertical: 80, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#EF4444" />
                        <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600', marginTop: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Fetching live alerts...
                        </Text>
                    </View>
                ) : filtered.length === 0 ? (
                    <View style={{ paddingVertical: 80, alignItems: 'center' }}>
                        <View style={{ width: 72, height: 72, backgroundColor: '#F1F5F9', borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <BellOff size={32} color="#CBD5E1" strokeWidth={1.5} />
                        </View>
                        <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '700', marginBottom: 6 }}>No alerts found</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center' }}>
                            {filter === 'ALL' ? 'Your area is clear. Stay prepared.' : `No ${filter.toLowerCase()} alerts right now.`}
                        </Text>
                    </View>
                ) : (
                    filtered.map((alert) => (
                        <AlertDetailCard
                            key={alert.id}
                            title={alert.title}
                            time={dayjs(alert.createdAt).fromNow()}
                            location={alert.location || ''}
                            description={alert.message || ''}
                            officer={alert.type || ''}
                            mapLabel={t('alerts.view_map') || 'View Map'}
                            variant={alert.type === 'EMERGENCY' ? 'danger' : alert.type === 'WARNING' ? 'warning' : 'info'}
                        />
                    ))
                )}
                <View style={{ height: 16 }} />
            </ScrollView>
        </View>
    );
}
