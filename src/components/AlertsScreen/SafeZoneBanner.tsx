import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { ShieldCheck, ShieldAlert, MapPin, Navigation, Phone, AlertTriangle, ChevronRight } from 'lucide-react-native';
import { haversineKm } from '../../utils/distance';

export interface SafePlaceItem {
    id: string;
    name: string;
    type: string;
    distanceKm: number;
    latitude: number;
    longitude: number;
    address: string | null;
    phone: string | null;
}

interface Props {
    alert: {
        latitudes?: number[];
        longitudes?: number[];
        broadcastRadiusKm?: number | null;
    };
    safePlaces: SafePlaceItem[];
    onSeeAll: () => void;
}

function typeIcon(type: string): string {
    const t = type.toLowerCase();
    if (t.includes('school'))   return '🏫';
    if (t.includes('temple') || t.includes('church') || t.includes('mosque') || t.includes('kovil')) return '⛪';
    if (t.includes('hospital') || t.includes('clinic')) return '🏥';
    if (t.includes('police'))   return '🚔';
    if (t.includes('hall') || t.includes('center') || t.includes('centre')) return '🏛️';
    return '📍';
}

function openMaps(lat: number, lng: number, name: string) {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`);
}

export const SafeZoneBanner: React.FC<Props> = ({ alert, safePlaces, onSeeAll }) => {
    if (!safePlaces.length) return null;

    // Use the alert's first coordinate as danger zone center
    const alertLat = alert.latitudes?.[0];
    const alertLng = alert.longitudes?.[0];
    const hasCenter = alertLat != null && alertLng != null;
    const dangerRadius = alert.broadcastRadiusKm ?? 5;

    // Compute whether each place falls inside this alert's danger radius
    const ranked = safePlaces
        .map(p => ({
            ...p,
            inDanger: hasCenter
                ? haversineKm(alertLat!, alertLng!, p.latitude, p.longitude) <= dangerRadius
                : false,
        }))
        .sort((a, b) => {
            // Safe places first, then by distance
            if (a.inDanger !== b.inDanger) return a.inDanger ? 1 : -1;
            return a.distanceKm - b.distanceKm;
        });

    const primary   = ranked[0];
    const alternate = primary?.inDanger ? ranked.find(p => !p.inDanger) : null;

    if (!primary) return null;

    const dist = (km: number) =>
        km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

    return (
        <View style={{
            marginTop: -6,
            marginBottom: 12,
            borderRadius: 16,
            overflow: 'hidden',
            borderWidth: 1.5,
            borderColor: primary.inDanger ? '#FED7AA' : '#BBF7D0',
            backgroundColor: primary.inDanger ? '#FFF7ED' : '#F0FDF4',
        }}>
            {/* Section label */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingTop: 10,
                paddingBottom: 6,
                gap: 6,
            }}>
                <ShieldCheck size={14} color={primary.inDanger ? '#EA580C' : '#16A34A'} strokeWidth={2.5} />
                <Text style={{
                    fontSize: 10,
                    fontWeight: '800',
                    letterSpacing: 0.8,
                    color: primary.inDanger ? '#EA580C' : '#16A34A',
                    textTransform: 'uppercase',
                }}>
                    Nearest Safe Place
                </Text>
            </View>

            {/* Primary place */}
            {primary.inDanger ? (
                // Nearest place is inside the danger zone — show warning
                <View style={{
                    marginHorizontal: 10,
                    marginBottom: 8,
                    backgroundColor: '#FEF3C7',
                    borderRadius: 12,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 10,
                    borderWidth: 1,
                    borderColor: '#FDE68A',
                }}>
                    <AlertTriangle size={16} color="#B45309" strokeWidth={2.5} style={{ marginTop: 1 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#92400E', fontSize: 12, fontWeight: '800' }}>
                            {typeIcon(primary.type)} {primary.name}
                        </Text>
                        <Text style={{ color: '#B45309', fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                            {dist(primary.distanceKm)} away — currently inside danger zone
                        </Text>
                    </View>
                </View>
            ) : (
                // Primary place is safe — show it as the recommendation
                <PlaceRow place={primary} dist={dist} />
            )}

            {/* If primary is in danger, show next safe alternative */}
            {primary.inDanger && (
                alternate ? (
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 6, marginBottom: 6 }}>
                            <ChevronRight size={12} color="#16A34A" strokeWidth={2.5} />
                            <Text style={{ fontSize: 10, fontWeight: '800', color: '#16A34A', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                                Next Safe Alternative
                            </Text>
                        </View>
                        <PlaceRow place={alternate} dist={dist} />
                    </View>
                ) : (
                    <View style={{ padding: 14, paddingTop: 0 }}>
                        <View style={{
                            backgroundColor: '#FEE2E2',
                            borderRadius: 12,
                            padding: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                            <ShieldAlert size={16} color="#DC2626" strokeWidth={2.5} />
                            <Text style={{ color: '#991B1B', fontSize: 12, fontWeight: '700', flex: 1 }}>
                                All nearby public places may be in the danger zone. Evacuate to a farther area.
                            </Text>
                        </View>
                    </View>
                )
            )}

            {/* Footer */}
            <TouchableOpacity
                onPress={onSeeAll}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 10,
                    borderTopWidth: 1,
                    borderTopColor: primary.inDanger ? '#FED7AA' : '#BBF7D0',
                    gap: 6,
                }}
                activeOpacity={0.7}
            >
                <MapPin size={13} color={primary.inDanger ? '#EA580C' : '#16A34A'} strokeWidth={2.5} />
                <Text style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: primary.inDanger ? '#EA580C' : '#16A34A',
                }}>
                    See all safe places on map
                </Text>
            </TouchableOpacity>
        </View>
    );
};

function PlaceRow({ place, dist }: { place: SafePlaceItem & { inDanger: boolean }; dist: (km: number) => string }) {
    return (
        <View style={{
            marginHorizontal: 10,
            marginBottom: 10,
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            borderWidth: 1,
            borderColor: '#D1FAE5',
        }}>
            <View style={{
                width: 38,
                height: 38,
                backgroundColor: '#DCFCE7',
                borderRadius: 11,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Text style={{ fontSize: 18 }}>{typeIcon(place.type)}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ color: '#065F46', fontSize: 13, fontWeight: '800' }} numberOfLines={1}>
                    {place.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Navigation size={11} color="#16A34A" strokeWidth={2.5} />
                    <Text style={{ color: '#16A34A', fontSize: 11, fontWeight: '700' }}>
                        {dist(place.distanceKm)} away
                    </Text>
                    {place.address ? (
                        <Text style={{ color: '#6B7280', fontSize: 11 }} numberOfLines={1}>
                            · {place.address}
                        </Text>
                    ) : null}
                </View>
            </View>
            <View style={{ gap: 6 }}>
                <TouchableOpacity
                    onPress={() => openMaps(place.latitude, place.longitude, place.name)}
                    style={{
                        backgroundColor: '#16A34A',
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                    }}
                    activeOpacity={0.8}
                >
                    <Navigation size={12} color="white" strokeWidth={2.5} />
                    <Text style={{ color: 'white', fontSize: 11, fontWeight: '800' }}>Go</Text>
                </TouchableOpacity>
                {place.phone ? (
                    <TouchableOpacity
                        onPress={() => Linking.openURL(`tel:${place.phone}`)}
                        style={{
                            backgroundColor: '#EFF6FF',
                            paddingHorizontal: 12,
                            paddingVertical: 7,
                            borderRadius: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                        }}
                        activeOpacity={0.8}
                    >
                        <Phone size={12} color="#2563EB" strokeWidth={2.5} />
                        <Text style={{ color: '#2563EB', fontSize: 11, fontWeight: '800' }}>Call</Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );
}
