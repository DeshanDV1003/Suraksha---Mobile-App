import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
    ChevronLeft, Droplets, TrendingUp, TrendingDown,
    Minus, AlertTriangle, CloudRain, CheckCircle2, Waves,
} from 'lucide-react-native';
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

// ── Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<RiverStatus, {
    label: string; emoji: string; short: string;
    color: string; light: string; bg: string;
    gradient: [string, string];
    headerGrad: [string, string, string];
}> = {
    NORMAL:      {
        label: 'Normal',      emoji: '✅', short: 'Normal',
        color: '#059669', light: '#34D399', bg: '#ECFDF5',
        gradient: ['#059669', '#10B981'],
        headerGrad: ['#0F172A', '#1E3A8A', '#2563EB'],
    },
    ALERT:       {
        label: 'Alert Level', emoji: '⚠️', short: 'Alert',
        color: '#D97706', light: '#FCD34D', bg: '#FFFBEB',
        gradient: ['#B45309', '#D97706'],
        headerGrad: ['#451A03', '#78350F', '#D97706'],
    },
    MINOR_FLOOD: {
        label: 'Minor Flood', emoji: '🌊', short: 'Minor Flood',
        color: '#EA580C', light: '#FB923C', bg: '#FFF7ED',
        gradient: ['#C2410C', '#EA580C'],
        headerGrad: ['#7C2D12', '#9A3412', '#EA580C'],
    },
    MAJOR_FLOOD: {
        label: 'Major Flood', emoji: '🚨', short: 'Major Flood',
        color: '#DC2626', light: '#F87171', bg: '#FEF2F2',
        gradient: ['#7F1D1D', '#991B1B', '#DC2626'],
        headerGrad: ['#450A0A', '#7F1D1D', '#DC2626'],
    },
};

// ── WaterFill gauge ────────────────────────────────────────────────────
function WaterFill({ current, alert, minorFlood, majorFlood, color }: {
    current: number; alert: number; minorFlood: number; majorFlood: number; color: string;
}) {
    const max = majorFlood * 1.25;
    const fillPct = Math.min((current / max) * 100, 100);
    const alertPct = Math.min((alert / max) * 100, 100);
    const minorPct = Math.min((minorFlood / max) * 100, 100);
    const majorPct = Math.min((majorFlood / max) * 100, 100);

    // How far to next threshold
    let nextLabel = '';
    let nextGap = 0;
    if (current < alert) {
        nextLabel = 'Alert';
        nextGap = alert - current;
    } else if (current < minorFlood) {
        nextLabel = 'Minor Flood';
        nextGap = minorFlood - current;
    } else if (current < majorFlood) {
        nextLabel = 'Major Flood';
        nextGap = majorFlood - current;
    }

    return (
        <View style={{ marginTop: 14 }}>
            {/* Bar */}
            <View style={{ height: 18, backgroundColor: '#E2E8F0', borderRadius: 9, position: 'relative', overflow: 'hidden' }}>
                {/* Color zones (background) */}
                <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: 0, flexDirection: 'row' }}>
                    <View style={{ width: `${alertPct}%`, backgroundColor: '#D1FAE5' }} />
                    <View style={{ width: `${minorPct - alertPct}%`, backgroundColor: '#FEF3C7' }} />
                    <View style={{ width: `${majorPct - minorPct}%`, backgroundColor: '#FEE2E2' }} />
                    <View style={{ flex: 1, backgroundColor: '#FCA5A5' }} />
                </View>
                {/* Water fill */}
                <LinearGradient
                    colors={[color + 'CC', color]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fillPct}%` as any, borderRadius: 9 }}
                />
                {/* Threshold ticks */}
                {[alertPct, minorPct, majorPct].map((p, i) => (
                    <View key={i} style={{ position: 'absolute', left: `${p}%` as any, top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(255,255,255,0.7)' }} />
                ))}
            </View>

            {/* Labels row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                <Text style={{ color: '#059669', fontSize: 10, fontWeight: '700' }}>Safe ≤{alert}m</Text>
                <Text style={{ color: '#D97706', fontSize: 10, fontWeight: '700' }}>Alert {alert}m</Text>
                <Text style={{ color: '#EA580C', fontSize: 10, fontWeight: '700' }}>Minor {minorFlood}m</Text>
                <Text style={{ color: '#DC2626', fontSize: 10, fontWeight: '700' }}>Major {majorFlood}m</Text>
            </View>

            {/* Gap to next level */}
            {nextLabel !== '' && (
                <View style={{ backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <AlertTriangle size={11} color="#94A3B8" strokeWidth={2} />
                    <Text style={{ color: '#64748B', fontSize: 11, marginLeft: 5 }}>
                        <Text style={{ fontWeight: '700', color: '#475569' }}>{nextGap.toFixed(2)} m</Text>
                        {' '}below {nextLabel} threshold
                    </Text>
                </View>
            )}
        </View>
    );
}

// ── River card ─────────────────────────────────────────────────────────
function RiverCard({ river }: { river: RiverLevel }) {
    const cfg = STATUS_CONFIG[river.status];

    const trendEl = () => {
        if (river.trend === 'RISING') return (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
                <TrendingUp size={12} color="#DC2626" strokeWidth={2.5} />
                <Text style={{ color: '#DC2626', fontSize: 11, fontWeight: '800', marginLeft: 3 }}>
                    +{river.changeFromLastHour.toFixed(2)} m/hr
                </Text>
            </View>
        );
        if (river.trend === 'FALLING') return (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
                <TrendingDown size={12} color="#059669" strokeWidth={2.5} />
                <Text style={{ color: '#059669', fontSize: 11, fontWeight: '800', marginLeft: 3 }}>
                    {river.changeFromLastHour.toFixed(2)} m/hr
                </Text>
            </View>
        );
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Minus size={12} color="#64748B" strokeWidth={2.5} />
                <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', marginLeft: 3 }}>Stable</Text>
            </View>
        );
    };

    return (
        <View style={{
            backgroundColor: 'white',
            borderRadius: 22,
            marginBottom: 14,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 4,
            overflow: 'hidden',
        }}>
            {/* Colored top bar */}
            <View style={{ height: 5, backgroundColor: cfg.color }} />

            <View style={{ padding: 16 }}>
                {/* Row 1: Name + Status pill */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '900', letterSpacing: -0.3 }} numberOfLines={1}>
                            {river.riverName}
                        </Text>
                        <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                            {river.stationName} · {river.district}
                        </Text>
                    </View>
                    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: cfg.color + '50', flexShrink: 0 }}>
                        <Text style={{ color: cfg.color, fontSize: 12, fontWeight: '900' }}>{cfg.emoji} {cfg.label}</Text>
                    </View>
                </View>

                {/* Row 2: Big reading + trend */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={{ color: cfg.color, fontSize: 42, fontWeight: '900', letterSpacing: -2, lineHeight: 46 }}>
                            {river.waterLevelMetres.toFixed(2)}
                        </Text>
                        <Text style={{ color: '#94A3B8', fontSize: 16, fontWeight: '700', marginLeft: 4 }}>m</Text>
                    </View>
                    {trendEl()}
                </View>

                {/* Water fill gauge */}
                <WaterFill
                    current={river.waterLevelMetres}
                    alert={river.alertLevel}
                    minorFlood={river.minorFloodLevel}
                    majorFlood={river.majorFloodLevel}
                    color={cfg.color}
                />

                {/* Footer */}
                <Text style={{ color: '#CBD5E1', fontSize: 11, marginTop: 10 }}>
                    Last reading {dayjs(river.recordedAt).fromNow()}
                </Text>
            </View>
        </View>
    );
}

// ── Rainfall intensity label ───────────────────────────────────────────
function rainLabel(mmhr: number): { text: string; color: string; bg: string } {
    if (mmhr > 50) return { text: 'Extreme', color: '#DC2626', bg: '#FEE2E2' };
    if (mmhr > 25) return { text: 'Heavy',   color: '#EA580C', bg: '#FFF7ED' };
    if (mmhr > 10) return { text: 'Moderate', color: '#D97706', bg: '#FFFBEB' };
    if (mmhr > 2)  return { text: 'Light',    color: '#2563EB', bg: '#EFF6FF' };
    return                { text: 'Trace',    color: '#94A3B8', bg: '#F8FAFC' };
}

// ── Screen ─────────────────────────────────────────────────────────────
export default function WaterLevelScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [rivers, setRivers] = useState<RiverLevel[]>([]);
    const [rainfall, setRainfall] = useState<RainfallReading[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [tab, setTab] = useState<'rivers' | 'rain'>('rivers');

    const load = useCallback(async () => {
        try {
            const [riverRes, rainRes] = await Promise.all([
                waterService.getRiverLevels(),
                waterService.getRainfallData(),
            ]);

            const latestPerGauge = new Map<string, RiverLevel>();
            for (const r of (Array.isArray(riverRes.data) ? riverRes.data as RiverLevel[] : [])) {
                const existing = latestPerGauge.get(r.gaugeId);
                if (!existing || new Date(r.recordedAt) > new Date(existing.recordedAt)) {
                    latestPerGauge.set(r.gaugeId, r);
                }
            }
            const order: RiverStatus[] = ['MAJOR_FLOOD', 'MINOR_FLOOD', 'ALERT', 'NORMAL'];
            const sorted = [...latestPerGauge.values()].sort((a, b) =>
                order.indexOf(a.status) - order.indexOf(b.status)
            );

            const latestRain = new Map<string, RainfallReading>();
            for (const r of (Array.isArray(rainRes.data) ? rainRes.data as RainfallReading[] : [])) {
                const existing = latestRain.get(r.stationName);
                if (!existing || new Date(r.recordedAt) > new Date(existing.recordedAt)) {
                    latestRain.set(r.stationName, r);
                }
            }

            setRivers(sorted);
            setRainfall([...latestRain.values()].sort((a, b) => b.rainfallMmPerHour - a.rainfallMmPerHour));
            setLastUpdated(new Date());
        } catch {
            // show stale data
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        load();
        const interval = setInterval(load, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [load]);

    const onRefresh = () => { setRefreshing(true); load(); };

    const activeAlerts = rivers.filter(r => r.status !== 'NORMAL');
    const highestStatus: RiverStatus =
        activeAlerts.find(r => r.status === 'MAJOR_FLOOD') ? 'MAJOR_FLOOD' :
        activeAlerts.find(r => r.status === 'MINOR_FLOOD') ? 'MINOR_FLOOD' :
        activeAlerts.find(r => r.status === 'ALERT') ? 'ALERT' : 'NORMAL';

    const hCfg = STATUS_CONFIG[highestStatus];

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#F0F4FF', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={{ color: '#64748B', marginTop: 12, fontSize: 14 }}>Loading water level data…</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F1F5F9' }}>
            <StatusBar barStyle="light-content" />

            {/* ── Header ── */}
            <LinearGradient
                colors={hCfg.headerGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ paddingTop: insets.top + 8, paddingBottom: 24, paddingHorizontal: 20 }}
            >
                {/* Nav row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
                    >
                        <ChevronLeft size={22} color="white" strokeWidth={2.5} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: -0.4 }}>Water Levels</Text>
                        {lastUpdated && (
                            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 1 }}>
                                Updated {dayjs(lastUpdated).fromNow()}
                            </Text>
                        )}
                    </View>
                    <Waves size={26} color="rgba(255,255,255,0.7)" strokeWidth={1.8} />
                </View>

                {/* Situation card */}
                <View style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                        Current Situation
                    </Text>
                    <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginBottom: 12 }}>
                        {hCfg.emoji}{'  '}{activeAlerts.length === 0 ? 'All rivers normal' : `${activeAlerts.length} river${activeAlerts.length > 1 ? 's' : ''} above normal`}
                    </Text>

                    {/* 3-stat strip */}
                    <View style={{ flexDirection: 'row' }}>
                        {[
                            { num: rivers.length, label: 'Gauges', icon: <Droplets size={14} color="rgba(255,255,255,0.7)" /> },
                            { num: activeAlerts.length, label: 'Alerts', icon: <AlertTriangle size={14} color={activeAlerts.length > 0 ? '#FCD34D' : 'rgba(255,255,255,0.7)'} /> },
                            { num: rainfall.length, label: 'Rain Stations', icon: <CloudRain size={14} color="rgba(255,255,255,0.7)" /> },
                        ].map((s, i) => (
                            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    {s.icon}
                                    <Text style={{ color: s.label === 'Alerts' && s.num > 0 ? '#FCD34D' : 'white', fontSize: 22, fontWeight: '900', marginLeft: 4 }}>
                                        {s.num}
                                    </Text>
                                </View>
                                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{s.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </LinearGradient>

            {/* ── Tab switcher ── */}
            <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 12, backgroundColor: 'white', borderRadius: 16, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
                {([
                    { key: 'rivers', label: 'Rivers', icon: <Waves size={15} /> },
                    { key: 'rain',   label: 'Rainfall', icon: <CloudRain size={15} /> },
                ] as const).map(t => (
                    <TouchableOpacity
                        key={t.key}
                        onPress={() => setTab(t.key)}
                        style={{
                            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                            paddingVertical: 10, borderRadius: 12,
                            backgroundColor: tab === t.key ? '#2563EB' : 'transparent',
                        }}
                    >
                        {React.cloneElement(t.icon, { color: tab === t.key ? 'white' : '#94A3B8', strokeWidth: 2.5 })}
                        <Text style={{ color: tab === t.key ? 'white' : '#94A3B8', fontWeight: '800', fontSize: 13, marginLeft: 6 }}>
                            {t.label}
                        </Text>
                        {t.key === 'rivers' && activeAlerts.length > 0 && (
                            <View style={{ marginLeft: 6, backgroundColor: tab === 'rivers' ? 'rgba(255,255,255,0.3)' : '#EF4444', borderRadius: 20, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                                <Text style={{ color: 'white', fontSize: 10, fontWeight: '900' }}>{activeAlerts.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Content ── */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
                showsVerticalScrollIndicator={false}
            >
                {tab === 'rivers' ? (
                    <>
                        {/* Alert banner */}
                        {activeAlerts.length > 0 && (
                            <View style={{ backgroundColor: '#FEF2F2', borderRadius: 16, padding: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1.5, borderColor: '#FECACA' }}>
                                <AlertTriangle size={20} color="#DC2626" strokeWidth={2} style={{ marginTop: 1, flexShrink: 0 }} />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={{ color: '#991B1B', fontWeight: '900', fontSize: 13, marginBottom: 4 }}>
                                        {activeAlerts.length} gauge{activeAlerts.length > 1 ? 's' : ''} above safe level
                                    </Text>
                                    {activeAlerts.map(r => (
                                        <Text key={r.gaugeId} style={{ color: '#DC2626', fontSize: 12, marginBottom: 1 }}>
                                            {STATUS_CONFIG[r.status].emoji}{'  '}{r.riverName} — {STATUS_CONFIG[r.status].label}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* River cards */}
                        {rivers.length === 0 ? (
                            <View style={{ backgroundColor: 'white', borderRadius: 22, padding: 40, alignItems: 'center' }}>
                                <Droplets size={48} color="#CBD5E1" strokeWidth={1.5} />
                                <Text style={{ color: '#94A3B8', fontSize: 15, marginTop: 14, fontWeight: '600' }}>No river data available</Text>
                                <Text style={{ color: '#CBD5E1', fontSize: 12, marginTop: 4 }}>Pull down to refresh</Text>
                            </View>
                        ) : (
                            rivers.map(river => <RiverCard key={river.gaugeId} river={river} />)
                        )}
                    </>
                ) : (
                    /* ── Rainfall tab ── */
                    <>
                        {rainfall.length === 0 ? (
                            <View style={{ backgroundColor: 'white', borderRadius: 22, padding: 40, alignItems: 'center' }}>
                                <CloudRain size={48} color="#CBD5E1" strokeWidth={1.5} />
                                <Text style={{ color: '#94A3B8', fontSize: 15, marginTop: 14, fontWeight: '600' }}>No rainfall data</Text>
                            </View>
                        ) : (
                            rainfall.map(r => {
                                const rl = rainLabel(r.rainfallMmPerHour);
                                const barPct = Math.min((r.rainfallMmPerHour / 75) * 100, 100);
                                return (
                                    <View key={r.id} style={{ backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, overflow: 'hidden' }}>
                                        <View style={{ height: 4, backgroundColor: rl.color, position: 'absolute', left: 0, right: 0, top: 0 }} />

                                        {/* Header */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <View style={{ flex: 1, marginRight: 8 }}>
                                                <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: '800' }} numberOfLines={1}>{r.stationName}</Text>
                                                <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{r.district} · {dayjs(r.recordedAt).fromNow()}</Text>
                                            </View>
                                            <View style={{ backgroundColor: rl.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: rl.color + '40' }}>
                                                <Text style={{ color: rl.color, fontWeight: '800', fontSize: 12 }}>{rl.text}</Text>
                                            </View>
                                        </View>

                                        {/* Numbers */}
                                        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ color: rl.color, fontSize: 30, fontWeight: '900', letterSpacing: -1 }}>
                                                    {r.rainfallMmPerHour.toFixed(1)}
                                                </Text>
                                                <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 1 }}>mm / hour</Text>
                                            </View>
                                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                                <Text style={{ color: '#0F172A', fontSize: 22, fontWeight: '800' }}>
                                                    {r.cumulativeRain24h.toFixed(0)}
                                                </Text>
                                                <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 1 }}>mm last 24 hrs</Text>
                                            </View>
                                        </View>

                                        {/* Intensity bar */}
                                        <View style={{ height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                                            <View style={{ height: '100%', width: `${barPct}%`, backgroundColor: rl.color, borderRadius: 4 }} />
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                            <Text style={{ color: '#CBD5E1', fontSize: 10 }}>0</Text>
                                            <Text style={{ color: '#CBD5E1', fontSize: 10 }}>25 mm/hr</Text>
                                            <Text style={{ color: '#CBD5E1', fontSize: 10 }}>50+</Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
