import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Clock, Navigation, Users, Phone } from 'lucide-react-native';
import { ServiceChip } from './ServiceChip';

interface ReliefCampCardProps {
    name: string;
    distance: string;
    currentOccupancy: number;
    maxOccupancy: number;
    services: ReadonlyArray<'food' | 'water' | 'medical' | 'charging' | 'toilets' | 'child-care'>;
    waitTime: string;
    labels: {
        occupancy: string;
        services: string;
        waitTime: string;
        getDirections: string;
        contact: string;
        allServices: Record<string, string>;
    };
    onGetDirections?: () => void;
    onContact?: () => void;
}

export const ReliefCampCard: React.FC<ReliefCampCardProps> = ({
    name, distance, currentOccupancy, maxOccupancy, services, waitTime,
    labels, onGetDirections, onContact,
}) => {
    const isFull = currentOccupancy >= maxOccupancy;
    const occupancyPercent = maxOccupancy > 0 ? Math.min((currentOccupancy / maxOccupancy) * 100, 100) : 0;
    const barColor = occupancyPercent > 85 ? '#EF4444' : occupancyPercent > 60 ? '#F97316' : '#10B981';

    return (
        <View style={{
            backgroundColor: 'white',
            borderRadius: 22,
            marginBottom: 16,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07,
            shadowRadius: 10,
            elevation: 3,
        }}>
            {/* Header */}
            <View style={{ padding: 18, paddingBottom: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '800', flex: 1, paddingRight: 10 }}>
                        {name}
                    </Text>
                    <View style={{ backgroundColor: isFull ? '#FFF5F5' : '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                        <Text style={{ color: isFull ? '#EF4444' : '#059669', fontSize: 11, fontWeight: '800' }}>
                            {isFull ? 'FULL' : 'OPEN'}
                        </Text>
                    </View>
                </View>

                {distance ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                        <MapPin size={13} color="#94A3B8" strokeWidth={2} />
                        <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '500', marginLeft: 5 }}>{distance}</Text>
                    </View>
                ) : null}

                {/* Occupancy */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Users size={13} color="#64748B" strokeWidth={2} />
                        <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600', marginLeft: 5 }}>{labels.occupancy}</Text>
                    </View>
                    <Text style={{ color: barColor, fontSize: 13, fontWeight: '800' }}>{currentOccupancy}/{maxOccupancy}</Text>
                </View>

                {/* Progress bar */}
                <View style={{ backgroundColor: '#F1F5F9', height: 8, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                    <View style={{ width: `${occupancyPercent}%`, backgroundColor: barColor, height: '100%', borderRadius: 8 }} />
                </View>

                {/* Services */}
                <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                    {labels.services}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {(services || []).map((service, i) => (
                        <ServiceChip key={i} type={service} label={labels.allServices[service] || service} />
                    ))}
                </View>
            </View>

            {/* Footer */}
            <View style={{ borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
                {/* Wait time */}
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Clock size={13} color="#94A3B8" strokeWidth={2} />
                    <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '500', marginLeft: 5 }}>
                        {labels.waitTime}:{' '}
                        <Text style={{ color: '#0F172A', fontWeight: '700' }}>{waitTime}</Text>
                    </Text>
                </View>

                {/* Contact button */}
                <TouchableOpacity
                    onPress={onContact}
                    activeOpacity={0.7}
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 8 }}
                >
                    <Phone size={13} color="#16A34A" strokeWidth={2.5} />
                    <Text style={{ color: '#16A34A', fontSize: 12, fontWeight: '700', marginLeft: 5 }}>{labels.contact}</Text>
                </TouchableOpacity>

                {/* Directions button */}
                <TouchableOpacity
                    onPress={onGetDirections}
                    activeOpacity={0.7}
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}
                >
                    <Navigation size={13} color="#2563EB" strokeWidth={2.5} />
                    <Text style={{ color: '#2563EB', fontSize: 12, fontWeight: '700', marginLeft: 5 }}>{labels.getDirections}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
