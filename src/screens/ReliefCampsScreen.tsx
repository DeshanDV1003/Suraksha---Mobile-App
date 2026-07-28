import React, { useState } from 'react';
import {
    View, ScrollView, Text, ActivityIndicator, RefreshControl,
    Modal, TouchableOpacity, Linking, Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { ReliefCampCard } from '../components/ReliefCampsScreen/ReliefCampCard';
import { campService } from '../services/api';
import { getCache, setCache } from '../services/cache';
import { getCachedReliefCamps } from '../storage/localDB';
import { useUserLocation } from '../context/LocationContext';
import { haversineKm } from '../utils/distance';
import {
    X, MapPin, Users, Clock, Phone, Navigation,
    ShieldCheck, Utensils, Droplets, Zap, Baby, Toilet,
} from 'lucide-react-native';

// Sri Lanka DMC coordination number
const DMC_PHONE = '1989';

const SERVICE_ICONS: Record<string, { Icon: any; color: string; bg: string }> = {
    food:       { Icon: Utensils,    color: '#EA580C', bg: '#FFF7ED' },
    water:      { Icon: Droplets,    color: '#0EA5E9', bg: '#E0F2FE' },
    medical:    { Icon: ShieldCheck, color: '#DC2626', bg: '#FEE2E2' },
    charging:   { Icon: Zap,         color: '#7C3AED', bg: '#EDE9FE' },
    toilets:    { Icon: Toilet,      color: '#64748B', bg: '#F1F5F9' },
    'child-care': { Icon: Baby,      color: '#D97706', bg: '#FEF3C7' },
};

function openMaps(lat: number | null, lng: number | null, name: string) {
    if (lat && lng) {
        const url = Platform.OS === 'ios'
            ? `maps://?q=${encodeURIComponent(name)}&ll=${lat},${lng}`
            : `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                // fallback to Google Maps web
                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
            }
        });
    } else {
        // No coordinates — search by name
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' relief camp Sri Lanka')}`);
    }
}

export default function ReliefCampsScreen() {
    const { t } = useTranslation();
    const [camps, setCamps] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [selectedCamp, setSelectedCamp] = useState<any>(null);
    const [showAll, setShowAll] = useState(false);
    const userLocation = useUserLocation();

    const NEAR_RADIUS_KM = 30;
    const DEFAULT_SHOW = 3;

    const fetchCamps = async () => {
        const cached = await getCache<any[]>('camps_list');
        if (cached) { setCamps(cached); setLoading(false); }

        if (!cached) {
            const sqliteCamps = await getCachedReliefCamps().catch(() => []);
            if (sqliteCamps.length > 0) { setCamps(sqliteCamps); setLoading(false); }
        }

        try {
            const res = await campService.getCamps();
            if (Array.isArray(res.data)) {
                setCamps(res.data);
                setCache('camps_list', res.data);
            }
        } catch (error) {
            console.error('Failed to fetch camps:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => { fetchCamps(); }, []);

    const onRefresh = () => { setRefreshing(true); fetchCamps(); };

    const campLabels = {
        occupancy:   t('camps.occupancy'),
        services:    t('camps.services'),
        waitTime:    t('camps.wait_time'),
        getDirections: t('camps.get_directions'),
        contact:     t('camps.contact') || 'Contact',
        allServices: {
            food:       t('camps.food'),
            water:      t('camps.water'),
            medical:    t('camps.medical'),
            charging:   t('camps.charging'),
            toilets:    t('camps.toilets'),
            'child-care': t('camps.child_care'),
        },
    };

    const allWithDistance = camps
        .map(camp => {
            const distKm = userLocation && camp.latitude && camp.longitude
                ? haversineKm(userLocation.lat, userLocation.lng, camp.latitude, camp.longitude)
                : null;
            return { ...camp, _distKm: distKm };
        })
        .sort((a, b) => (a._distKm ?? 999) - (b._distKm ?? 999));

    // Camps within the near radius (or all if location unknown)
    const nearby = userLocation
        ? allWithDistance.filter(c => c._distKm !== null && c._distKm <= NEAR_RADIUS_KM)
        : allWithDistance;

    const hasMore = nearby.length > DEFAULT_SHOW;
    const sorted = showAll ? nearby : nearby.slice(0, DEFAULT_SHOW);

    const formatDistance = (camp: any) => {
        if (camp._distKm === null) return camp.distance || 'Location Unknown';
        return camp._distKm < 1
            ? `${Math.round(camp._distKm * 1000)} m away`
            : `${camp._distKm.toFixed(1)} km away`;
    };

    // Contact modal for a selected camp
    const ContactModal = () => {
        if (!selectedCamp) return null;
        const isFull = selectedCamp.currentOccupancy >= selectedCamp.totalCapacity;
        const occupancyPercent = selectedCamp.totalCapacity > 0
            ? Math.min((selectedCamp.currentOccupancy / selectedCamp.totalCapacity) * 100, 100)
            : 0;
        const barColor = occupancyPercent > 85 ? '#EF4444' : occupancyPercent > 60 ? '#F97316' : '#10B981';

        return (
            <Modal visible={!!selectedCamp} animationType="slide" transparent onRequestClose={() => setSelectedCamp(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40 }}>

                        {/* Handle + close */}
                        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                            <View style={{ width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2 }} />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12 }}>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A', flex: 1, paddingRight: 12 }} numberOfLines={2}>
                                {selectedCamp.name}
                            </Text>
                            <TouchableOpacity onPress={() => setSelectedCamp(null)} style={{ padding: 6, backgroundColor: '#F1F5F9', borderRadius: 20 }}>
                                <X size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }} showsVerticalScrollIndicator={false}>

                            {/* Status + distance */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <View style={{ backgroundColor: isFull ? '#FEE2E2' : '#D1FAE5', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginRight: 10 }}>
                                    <Text style={{ color: isFull ? '#991B1B' : '#065F46', fontSize: 12, fontWeight: '800' }}>
                                        {isFull ? 'FULL' : 'OPEN'}
                                    </Text>
                                </View>
                                {selectedCamp._distKm !== null && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <MapPin size={13} color="#94A3B8" strokeWidth={2} />
                                        <Text style={{ color: '#64748B', fontSize: 13, marginLeft: 4 }}>{formatDistance(selectedCamp)}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Location text */}
                            {selectedCamp.location ? (
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <MapPin size={15} color="#2563EB" strokeWidth={2} style={{ marginTop: 2 }} />
                                    <Text style={{ color: '#475569', fontSize: 14, marginLeft: 8, flex: 1, lineHeight: 20 }}>{selectedCamp.location}</Text>
                                </View>
                            ) : null}

                            {/* Occupancy */}
                            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, marginBottom: 16 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Users size={14} color="#64748B" strokeWidth={2} />
                                        <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '600', marginLeft: 6 }}>
                                            {t('camps.occupancy')}
                                        </Text>
                                    </View>
                                    <Text style={{ color: barColor, fontSize: 14, fontWeight: '900' }}>
                                        {selectedCamp.currentOccupancy} / {selectedCamp.totalCapacity}
                                    </Text>
                                </View>
                                <View style={{ backgroundColor: '#E2E8F0', height: 8, borderRadius: 8, overflow: 'hidden' }}>
                                    <View style={{ width: `${occupancyPercent}%`, backgroundColor: barColor, height: '100%', borderRadius: 8 }} />
                                </View>
                                <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 6 }}>
                                    {Math.round(100 - occupancyPercent)}% capacity remaining
                                </Text>
                            </View>

                            {/* Wait time */}
                            {selectedCamp.waitTime && selectedCamp.waitTime !== 'N/A' ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                    <Clock size={14} color="#94A3B8" strokeWidth={2} />
                                    <Text style={{ color: '#64748B', fontSize: 13, marginLeft: 8 }}>
                                        {t('camps.wait_time')}: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{selectedCamp.waitTime}</Text>
                                    </Text>
                                </View>
                            ) : null}

                            {/* Services */}
                            {selectedCamp.services?.length > 0 ? (
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                                        {t('camps.services')}
                                    </Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                        {selectedCamp.services.map((svc: string) => {
                                            const cfg = SERVICE_ICONS[svc] || { Icon: ShieldCheck, color: '#64748B', bg: '#F1F5F9' };
                                            return (
                                                <View key={svc} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: cfg.bg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
                                                    <cfg.Icon size={14} color={cfg.color} strokeWidth={2} />
                                                    <Text style={{ color: cfg.color, fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
                                                        {campLabels.allServices[svc] || svc}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            ) : null}

                            {/* DMC info note */}
                            <View style={{ backgroundColor: '#EFF6FF', borderRadius: 14, padding: 14, marginBottom: 20 }}>
                                <Text style={{ color: '#1E40AF', fontSize: 13, fontWeight: '700', marginBottom: 4 }}>
                                    Before You Visit
                                </Text>
                                <Text style={{ color: '#3B82F6', fontSize: 12, lineHeight: 18 }}>
                                    Call the DMC coordination line to confirm current availability, services, and any specific requirements before travelling to this camp.
                                </Text>
                            </View>

                            {/* Action buttons */}
                            <TouchableOpacity
                                onPress={() => Linking.openURL(`tel:${DMC_PHONE}`)}
                                style={{ backgroundColor: '#16A34A', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}
                            >
                                <Phone size={18} color="white" strokeWidth={2.5} />
                                <Text style={{ color: 'white', fontSize: 15, fontWeight: '900', marginLeft: 8 }}>
                                    Call DMC — {DMC_PHONE}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => { setSelectedCamp(null); openMaps(selectedCamp.latitude, selectedCamp.longitude, selectedCamp.name); }}
                                style={{ backgroundColor: '#2563EB', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Navigation size={18} color="white" strokeWidth={2.5} />
                                <Text style={{ color: 'white', fontSize: 15, fontWeight: '900', marginLeft: 8 }}>
                                    {t('camps.get_directions')}
                                </Text>
                            </TouchableOpacity>

                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header
                title={t('camps.title')}
                subtitle={t('camps.subtitle')}
                showBack
            />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading && !refreshing ? (
                    <View style={{ paddingVertical: 80, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#A855F7" />
                    </View>
                ) : nearby.length === 0 ? (
                    <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 32, alignItems: 'center', marginTop: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#475569', marginBottom: 8 }}>
                            No Camps Within {NEAR_RADIUS_KM} km
                        </Text>
                        <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 20 }}>
                            {userLocation
                                ? `No relief camps found within ${NEAR_RADIUS_KM} km of your location.`
                                : 'Enable location to see camps nearest to you.'}
                        </Text>
                        {allWithDistance.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setShowAll(true)}
                                style={{ backgroundColor: '#A855F7', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }}
                            >
                                <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>
                                    Show All {allWithDistance.length} Camps
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <>
                        {/* Summary header */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}>
                                    {nearby.length} camp{nearby.length !== 1 ? 's' : ''} within {NEAR_RADIUS_KM} km
                                </Text>
                                <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                                    Sorted by distance · tap Contact before visiting
                                </Text>
                            </View>
                            <View style={{ backgroundColor: '#F3E8FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                                <Text style={{ color: '#7C3AED', fontSize: 11, fontWeight: '800' }}>NEAREST FIRST</Text>
                            </View>
                        </View>

                        {sorted.map(camp => (
                            <ReliefCampCard
                                key={camp.id}
                                name={camp.name}
                                distance={formatDistance(camp)}
                                currentOccupancy={camp.currentOccupancy}
                                maxOccupancy={camp.totalCapacity}
                                services={camp.services || []}
                                waitTime={camp.waitTime || 'N/A'}
                                labels={campLabels}
                                onGetDirections={() => openMaps(camp.latitude, camp.longitude, camp.name)}
                                onContact={() => setSelectedCamp(camp)}
                            />
                        ))}

                        {/* Show more / less toggle */}
                        {hasMore && (
                            <TouchableOpacity
                                onPress={() => setShowAll(v => !v)}
                                style={{ alignItems: 'center', paddingVertical: 14, backgroundColor: 'white', borderRadius: 16, marginTop: 4 }}
                            >
                                <Text style={{ color: '#7C3AED', fontSize: 13, fontWeight: '800' }}>
                                    {showAll
                                        ? 'Show fewer camps'
                                        : `Show ${nearby.length - DEFAULT_SHOW} more camp${nearby.length - DEFAULT_SHOW !== 1 ? 's' : ''}`}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </ScrollView>

            <ContactModal />
        </View>
    );
}
