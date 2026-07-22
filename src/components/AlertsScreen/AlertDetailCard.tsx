import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle, MapPin, Clock, Zap, Info } from 'lucide-react-native';

interface AlertDetailCardProps {
    title: string;
    time: string;
    location: string;
    description: string;
    officer: string;
    mapLabel: string;
    variant?: 'danger' | 'warning' | 'info';
    onMapPress?: () => void;
}

const config = {
    danger: {
        strip: '#EF4444',
        bg: '#FFF5F5',
        badge: '#EF4444',
        badgeText: '#FFF',
        badgeLabel: 'EMERGENCY',
        icon: AlertTriangle,
        titleColor: '#991B1B',
        iconColor: '#EF4444',
    },
    warning: {
        strip: '#F97316',
        bg: '#FFF9F2',
        badge: '#F97316',
        badgeText: '#FFF',
        badgeLabel: 'WARNING',
        icon: Zap,
        titleColor: '#9A3412',
        iconColor: '#F97316',
    },
    info: {
        strip: '#3B82F6',
        bg: '#EFF6FF',
        badge: '#3B82F6',
        badgeText: '#FFF',
        badgeLabel: 'INFO',
        icon: Info,
        titleColor: '#1E40AF',
        iconColor: '#3B82F6',
    },
};

export const AlertDetailCard: React.FC<AlertDetailCardProps> = ({
    title,
    time,
    location,
    description,
    officer,
    mapLabel,
    variant = 'danger',
    onMapPress,
}) => {
    const c = config[variant];
    const IconComp = c.icon;

    return (
        <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            marginBottom: 14,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07,
            shadowRadius: 8,
            elevation: 3,
            flexDirection: 'row',
        }}>
            {/* Left accent strip */}
            <View style={{ width: 5, backgroundColor: c.strip }} />

            <View style={{ flex: 1, padding: 16 }}>
                {/* Header row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={{ width: 36, height: 36, backgroundColor: c.bg, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                            <IconComp size={18} color={c.iconColor} strokeWidth={2.5} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: c.titleColor, fontSize: 15, fontWeight: '800', lineHeight: 19, flexShrink: 1 }} numberOfLines={2}>
                                {title}
                            </Text>
                        </View>
                    </View>
                    <View style={{ backgroundColor: c.badge, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginLeft: 8 }}>
                        <Text style={{ color: c.badgeText, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>{c.badgeLabel}</Text>
                    </View>
                </View>

                {/* Location */}
                {location ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <MapPin size={13} color="#94A3B8" strokeWidth={2} />
                        <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600', marginLeft: 5, flex: 1 }} numberOfLines={1}>
                            {location}
                        </Text>
                    </View>
                ) : null}

                {/* Description */}
                {description ? (
                    <Text style={{ color: '#475569', fontSize: 13, lineHeight: 19, marginBottom: 12 }} numberOfLines={3}>
                        {description}
                    </Text>
                ) : null}

                {/* Footer */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Clock size={12} color="#94A3B8" strokeWidth={2} />
                        <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '600', marginLeft: 4 }}>{time}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={onMapPress}
                        style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}
                    >
                        <Text style={{ color: '#2563EB', fontSize: 12, fontWeight: '700' }}>{mapLabel}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
