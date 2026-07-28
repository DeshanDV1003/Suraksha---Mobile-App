import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FlatList, ScrollView, View, Text, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/common/Header';
import { AlertDetailCard } from '../components/AlertsScreen/AlertDetailCard';
import { alertService, safeZoneService } from '../services/api';
import { getCache, setCache } from '../services/cache';
import { getCachedAlerts } from '../storage/localDB';
import { BellOff } from 'lucide-react-native';
import { useUserLocation } from '../context/LocationContext';
import { isAlertNearby } from '../utils/distance';
import { SafeZoneBanner, SafePlaceItem } from '../components/AlertsScreen/SafeZoneBanner';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

type FilterType = 'ALL' | 'EMERGENCY' | 'WARNING' | 'INFO';

export default function AlertsScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false); // start false — show content immediately
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>('ALL');
    const [safePlaces, setSafePlaces] = useState<SafePlaceItem[]>([]);
    const userLocation = useUserLocation();
    const safePlacesFetched = useRef(false);

    const fetchAlerts = async (showSpinner = false) => {
        if (showSpinner) setLoading(true);

        // 1. AsyncStorage cache (fast, recent)
        const cached = await getCache<any[]>('alerts_list');
        if (cached) { setAlerts(cached); setLoading(false); }

        // 2. SQLite fallback if cache is expired (offline for >24h)
        if (!cached) {
            const sqliteAlerts = await getCachedAlerts().catch(() => []);
            if (sqliteAlerts.length > 0) { setAlerts(sqliteAlerts); setLoading(false); }
        }

        // 3. Refresh from network in background
        try {
            const res = await alertService.getAlerts();
            if (Array.isArray(res.data)) {
                setAlerts(res.data);
                setCache('alerts_list', res.data);
            }
        } catch {}
        finally { setLoading(false); setRefreshing(false); }
    };

    useEffect(() => {
        // Only show spinner on truly first load (nothing cached yet)
        fetchAlerts(true);
    }, []);

    // Fetch safe places once — only after alerts are loaded and there are emergency/warning ones
    useEffect(() => {
        if (!userLocation || safePlacesFetched.current) return;
        const hasUrgent = alerts.some(a => a.type === 'EMERGENCY' || a.type === 'WARNING');
        if (!hasUrgent) return;
        safePlacesFetched.current = true;
        safeZoneService.getNearby(userLocation.lat, userLocation.lng)
            .then(res => setSafePlaces(res.data?.data || []))
            .catch(() => {});
    }, [alerts, userLocation]);

    const onRefresh = useCallback(() => { setRefreshing(true); fetchAlerts(); }, []);

    // Only show alerts relevant to the user's location — show nothing until location is known
    const nearbyAlerts = userLocation
        ? alerts.filter(a => isAlertNearby(a, userLocation.lat, userLocation.lng))
        : [];

    const filtered = filter === 'ALL' ? nearbyAlerts : nearbyAlerts.filter(a => a.type === filter);

    const filters: { key: FilterType; label: string; color: string }[] = [
        { key: 'ALL',       label: `${t('alerts.filter_all')} (${nearbyAlerts.length})`, color: '#0F172A' },
        { key: 'EMERGENCY', label: t('alerts.filter_emergency'),  color: '#EF4444' },
        { key: 'WARNING',   label: t('alerts.filter_warning'),    color: '#F97316' },
        { key: 'INFO',      label: t('alerts.filter_info'),       color: '#3B82F6' },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header
                title={t('alerts.title')}
                subtitle={t('alerts.subtitle')}
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

            {loading ? (
                <View style={{ flex: 1, paddingVertical: 80, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#EF4444" />
                    <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600', marginTop: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {t('alerts.loading')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    windowSize={8}
                    ListEmptyComponent={
                        <View style={{ paddingVertical: 80, alignItems: 'center' }}>
                            <View style={{ width: 72, height: 72, backgroundColor: '#F1F5F9', borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <BellOff size={32} color="#CBD5E1" strokeWidth={1.5} />
                            </View>
                            <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '700', marginBottom: 6 }}>{t('alerts.no_alerts_area')}</Text>
                            <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center' }}>
                                {filter === 'ALL' ? t('alerts.area_clear') : t('alerts.no_type_near', { type: filter.toLowerCase() })}
                            </Text>
                        </View>
                    }
                    ListFooterComponent={<View style={{ height: 16 }} />}
                    renderItem={({ item: alert }) => (
                        <View>
                            <AlertDetailCard
                                title={alert.title}
                                time={dayjs(alert.createdAt).fromNow()}
                                location={(alert.locations || []).join(', ') || alert.location || ''}
                                description={alert.message || ''}
                                officer={alert.type || ''}
                                mapLabel={t('alerts.view_map') || 'View Map'}
                                variant={alert.type === 'EMERGENCY' ? 'danger' : alert.type === 'WARNING' ? 'warning' : 'info'}
                            />
                            {(alert.type === 'EMERGENCY' || alert.type === 'WARNING') && safePlaces.length > 0 && (
                                <SafeZoneBanner
                                    alert={{
                                        latitudes: alert.latitudes,
                                        longitudes: alert.longitudes,
                                        broadcastRadiusKm: alert.broadcastRadiusKm,
                                    }}
                                    safePlaces={safePlaces}
                                    onSeeAll={() => navigation.navigate('SafeZone', {
                                        dangerRadiusKm: alert.broadcastRadiusKm || (alert.type === 'EMERGENCY' ? 10 : 6),
                                    })}
                                />
                            )}
                        </View>
                    )}
                />
            )}
        </View>
    );
}
