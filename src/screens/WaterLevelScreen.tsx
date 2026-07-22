import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Droplets, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react-native';
import { waterService } from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

// ── Types ────────────────────────────────────────────────────────────
type RiverStatus = 'NORMAL' | 'ALERT' | 'MINOR_FLOOD' | 'MAJOR_FLOOD';
type Trend = 'RISING' | 'FALLING' | 'STABLE';

interface RiverLevel {
    id: string;
    gaugeId: string;
    riverName: string;
    stationName: string;
    district: string;
    waterLevelMetres: number;
    alertLevel: number;
    minorFloodLevel: number;
    majorFloodLevel: number;
    status: RiverStatus;
    trend: Trend;
    changeFromLastHour: number;
    recordedAt: string;
}

interface RainfallReading {
    id: string;
    stationName: string;
    district: string;
    rainfallMmPerHour: number;
    cumulativeRain24h: number;
    recordedAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<RiverStatus, { label: string; color: string; bg: string; gradient: [string, string] }> = {
    NORMAL:      { label: 'Normal',      color: '#059669', bg: '#ECFDF5', gradient: ['#059669', '#10B981'] },
    ALERT:       { label: 'Alert',       color: '#D97706', bg: '#FFFBEB', gradient: ['#B45309', '#D97706'] },
    MINOR_FLOOD: { label: 'Minor Flood', color: '#EA580C', bg: '#FFF7ED', gradient: ['#C2410C', '#EA580C'] },
    MAJOR_FLOOD: { label: 'Major Flood', color: '#DC2626', bg: '#FEF2F2', gradient: ['#991B1B', '#DC2626'] },
};

function LevelBar({ current, alert, minorFlood, majorFlood }: {
    current: number; alert: number; minorFlood: number; majorFlood: number;
}) {
    const max = majorFlood * 1.2;
    const pct = (v: number) => Math.min((v / max) * 100, 100);
    const currentPct = pct(current);
    const alertPct = pct(alert);
    const minorPct = pct(minorFlood);
    const majorPct = pct(majorFlood);

    const barColor = current >= majorFlood ? '#DC2626'
        : current >= minorFlood ? '#EA580C'
        : current >= alert ? '#D97706'
        : '#059669';

    return (
        <View style={{ marginTop: 10, marginBottom: 4 }}>
            <View style={{ height: 10, backgroundColor: '#E2E8F0', borderRadius: 6, overflow: 'visible', position: 'relative' }}>
                {/* Filled bar */}
                <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${currentPct}%`, backgroundColor: barColor, borderRadius: 6 }} />
                {/* Threshold markers */}
                {[
                    { pct: alertPct, color: '#D97706' },
                    { pct: minorPct, color: '#EA580C' },
                    { pct: majorPct, color: '#DC2626' },
                ].map((m, i) => (
                    <View key={i} style={{ position: 'absolute', left: `${m.pct}%` as any, top: -3, bottom: -3, width: 2, backgroundColor: m.color, borderRadius: 1 }} />
                ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10 }}>0 m</Text>
                <Text style={{ color: '#D97706', fontSize: 10 }}>Alert {alert}m</Text>
                <Text style={{ color: '#EA580C', fontSize: 10 }}>Minor {minorFlood}m</Text>
                <Text style={{ color: '#DC2626', fontSize: 10 }}>Major {majorFlood}m</Text>
            </View>
        </View>
    );
}

function TrendIcon({ trend, change }: { trend: Trend; change: number }) {
    if (trend === 'RISING') return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <TrendingUp size={13} color="#DC2626" strokeWidth={2.5} />
            <Text style={{ color: '#DC2626', fontSize: 11, fontWeight: '700' }}>+{change.toFixed(2)} m/hr</Text>
        </View>
    );
    if (trend === 'FALLING') return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <TrendingDown size={13} color="#059669" strokeWidth={2.5} />
            <Text style={{ color: '#059669', fontSize: 11, fontWeight: '700' }}>{change.toFixed(2)} m/hr</Text>
        </View>
    );
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Minus size={13} color="#64748B" strokeWidth={2.5} />
            <Text style={{ color: '#64748B', fontSize: 11 }}>Stable</Text>
        </View>
    );
}

// ── Screen ───────────────────────────────────────────────────────────
export default function WaterLevelScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [rivers, setRivers] = useState<RiverLevel[]>([]);
    const [rainfall, setRainfall] = useState<RainfallReading[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const load = useCallback(async () => {
        try {
            const [riverRes, rainRes] = await Promise.all([
                waterService.getRiverLevels(),
                waterService.getRainfallData(),
            ]);

            // Deduplicate — latest reading per gauge
            const latestPerGauge = new Map<string, RiverLevel>();
            for (const r of (riverRes.data as RiverLevel[])) {
                const existing = latestPerGauge.get(r.gaugeId);
                if (!existing || new Date(r.recordedAt) > new Date(existing.recordedAt)) {
                    latestPerGauge.set(r.gaugeId, r);
                }
            }
            const sorted = [...latestPerGauge.values()].sort((a, b) => {
                const order: RiverStatus[] = ['MAJOR_FLOOD', 'MINOR_FLOOD', 'ALERT', 'NORMAL'];
                return order.indexOf(a.status) - order.indexOf(b.status);
            });

            // Latest reading per rainfall station
            const latestRain = new Map<string, RainfallReading>();
            for (const r of (rainRes.data as RainfallReading[])) {
                const existing = latestRain.get(r.stationName);
                if (!existing || new Date(r.recordedAt) > new Date(existing.recordedAt)) {
                    latestRain.set(r.stationName, r);
                }
            }

            setRivers(sorted);
            setRainfall([...latestRain.values()].sort((a, b) => b.rainfallMmPerHour - a.rainfallMmPerHour));
            setLastUpdated(new Date());
        } catch (err) {
            // Non-fatal — show stale data if available
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        load();
        const interval = setInterval(load, 5 * 60 * 1000); // refresh every 5 min
        return () => clearInterval(interval);
    }, [load]);

    const onRefresh = () => {
        setRefreshing(true);
        load();
    };

    const activeAlerts = rivers.filter(r => r.status !== 'NORMAL');
    const highestStatus: RiverStatus = activeAlerts.find(r => r.status === 'MAJOR_FLOOD')
        ? 'MAJOR_FLOOD'
        : activeAlerts.find(r => r.status === 'MINOR_FLOOD')
        ? 'MINOR_FLOOD'
        : activeAlerts.find(r => r.status === 'ALERT')
        ? 'ALERT'
        : 'NORMAL';

    const headerGradient: [string, string, string] = highestStatus === 'MAJOR_FLOOD'
        ? ['#7F1D1D', '#991B1B', '#DC2626']
        : highestStatus === 'MINOR_FLOOD'
        ? ['#7C2D12', '#9A3412', '#EA580C']
        : highestStatus === 'ALERT'
        ? ['#451A03', '#78350F', '#D97706']
        : ['#0F172A', '#1E3A8A', '#2563EB'];

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#F0F4FF', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={{ color: '#64748B', marginTop: 12, fontSize: 14 }}>Loading water level data…</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient
                colors={headerGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ paddingTop: insets.top + 8, paddingBottom: 20, paddingHorizontal: 20 }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
                    >
                        <ChevronLeft size={20} color="white" strokeWidth={2.5} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>Water Levels</Text>
                        {lastUpdated && (
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 1 }}>
                                Updated {dayjs(lastUpdated).fromNow()}
                            </Text>
                        )}
                    </View>
                    <Droplets size={24} color="rgba(255,255,255,0.8)" strokeWidth={2} />
                </View>

                {/* Summary row */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {[
                        { label: 'Gauges', value: rivers.length, color: 'rgba(255,255,255,0.9)' },
                        { label: 'Alerts', value: activeAlerts.length, color: activeAlerts.length > 0 ? '#FCD34D' : 'rgba(255,255,255,0.9)' },
                        { label: 'Stations', value: rainfall.length, color: 'rgba(255,255,255,0.9)' },
                    ].map(item => (
                        <View key={item.label} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12, alignItems: 'center' }}>
                            <Text style={{ color: item.color, fontSize: 22, fontWeight: '900' }}>{item.value}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>{item.label}</Text>
                        </View>
                    ))}
                </View>
            </LinearGradient>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
                showsVerticalScrollIndicator={false}
            >
                {/* Active alerts banner */}
                {activeAlerts.length > 0 && (
                    <View style={{ backgroundColor: '#FEF2F2', borderRadius: 16, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: '#FECACA' }}>
                        <AlertTriangle size={20} color="#DC2626" strokeWidth={2} style={{ marginTop: 1 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#991B1B', fontWeight: '800', fontSize: 13, marginBottom: 3 }}>
                                {activeAlerts.length} river gauge{activeAlerts.length > 1 ? 's' : ''} above normal
                            </Text>
                            <Text style={{ color: '#DC2626', fontSize: 12 }}>
                                {activeAlerts.map(r => `${r.riverName} (${STATUS_CONFIG[r.status].label})`).join(' • ')}
                            </Text>
                        </View>
                    </View>
                )}

                {/* River levels */}
                <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: '800', marginBottom: 10 }}>
                    River Water Levels
                </Text>
                {rivers.length === 0 ? (
                    <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 20 }}>
                        <Droplets size={40} color="#CBD5E1" strokeWidth={1.5} />
                        <Text style={{ color: '#94A3B8', fontSize: 14, marginTop: 12 }}>No river data available</Text>
                    </View>
                ) : (
                    rivers.map(river => {
                        const cfg = STATUS_CONFIG[river.status];
                        return (
                            <View key={river.gaugeId} style={{ backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
                                {/* Status strip */}
                                <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, backgroundColor: cfg.color, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }} />

                                <View style={{ marginLeft: 10 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: '800' }}>{river.riverName}</Text>
                                            <Text style={{ color: '#64748B', fontSize: 12, marginTop: 1 }}>{river.stationName} · {river.district}</Text>
                                        </View>
                                        <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: cfg.color + '40' }}>
                                            <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '800' }}>{cfg.label}</Text>
                                        </View>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                                        <Text style={{ color: cfg.color, fontSize: 28, fontWeight: '900', letterSpacing: -1 }}>
                                            {river.waterLevelMetres.toFixed(2)}
                                        </Text>
                                        <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600' }}>m</Text>
                                        <View style={{ marginLeft: 8 }}>
                                            <TrendIcon trend={river.trend} change={river.changeFromLastHour} />
                                        </View>
                                    </View>

                                    <LevelBar
                                        current={river.waterLevelMetres}
                                        alert={river.alertLevel}
                                        minorFlood={river.minorFloodLevel}
                                        majorFlood={river.majorFloodLevel}
                                    />

                                    <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 6 }}>
                                        Updated {dayjs(river.recordedAt).fromNow()}
                                    </Text>
                                </View>
                            </View>
                        );
                    })
                )}

                {/* Rainfall */}
                {rainfall.length > 0 && (
                    <>
                        <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 8 }}>
                            Rainfall Readings
                        </Text>
                        {rainfall.map(r => {
                            const isHeavy = r.rainfallMmPerHour > 25;
                            const isCritical = r.rainfallMmPerHour > 50;
                            const color = isCritical ? '#DC2626' : isHeavy ? '#EA580C' : '#2563EB';
                            return (
                                <View key={r.id} style={{ backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}>
                                    <View style={{ width: 42, height: 42, backgroundColor: color + '15', borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                        <Droplets size={20} color={color} strokeWidth={2} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '700' }}>{r.stationName}</Text>
                                        <Text style={{ color: '#64748B', fontSize: 11, marginTop: 1 }}>{r.district} · {dayjs(r.recordedAt).fromNow()}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ color, fontSize: 18, fontWeight: '900' }}>{r.rainfallMmPerHour.toFixed(1)}</Text>
                                        <Text style={{ color: '#94A3B8', fontSize: 10 }}>mm/hr</Text>
                                        <Text style={{ color: '#64748B', fontSize: 10, marginTop: 1 }}>24h: {r.cumulativeRain24h.toFixed(0)} mm</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
