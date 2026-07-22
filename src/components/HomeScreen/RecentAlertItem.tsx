import React from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle, Zap, Info, MapPin, Clock } from 'lucide-react-native';

interface RecentAlertItemProps {
    title: string;
    location: string;
    time: string;
    variant?: 'danger' | 'warning' | 'info';
}

const config = {
    danger:  { icon: AlertTriangle, color: '#EF4444', bg: '#FFF5F5', strip: '#EF4444', label: 'EMERGENCY' },
    warning: { icon: Zap,           color: '#F97316', bg: '#FFF9F2', strip: '#F97316', label: 'WARNING'   },
    info:    { icon: Info,          color: '#3B82F6', bg: '#EFF6FF', strip: '#3B82F6', label: 'INFO'      },
};

export const RecentAlertItem: React.FC<RecentAlertItemProps> = ({ title, location, time, variant = 'warning' }) => {
    const c = config[variant] || config.warning;
    const Icon = c.icon;

    return (
        <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            marginBottom: 10,
            overflow: 'hidden',
            flexDirection: 'row',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
        }}>
            <View style={{ width: 4, backgroundColor: c.strip }} />
            <View style={{ flex: 1, padding: 14, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 38, height: 38, backgroundColor: c.bg, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Icon size={18} color={c.color} strokeWidth={2.5} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '700', marginBottom: 3 }} numberOfLines={1}>{title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {!!location && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MapPin size={11} color="#94A3B8" strokeWidth={2} />
                                <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '500', marginLeft: 3 }} numberOfLines={1}>{location}</Text>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Clock size={11} color="#94A3B8" strokeWidth={2} />
                            <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '500', marginLeft: 3 }}>{time}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ backgroundColor: c.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginLeft: 8 }}>
                    <Text style={{ color: c.color, fontSize: 9, fontWeight: '800', letterSpacing: 0.3 }}>{c.label}</Text>
                </View>
            </View>
        </View>
    );
};
