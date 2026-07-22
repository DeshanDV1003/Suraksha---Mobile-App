import React from 'react';
import { View, Text } from 'react-native';
import { MapPin, Clock, CheckCircle2, Hash } from 'lucide-react-native';

interface ReportSummaryItemProps {
    title: string;
    location: string;
    statusLabel: string;
    statusVariant?: 'pending' | 'assigned' | 'resolved';
    reportId: string;
}

const statusConfig = {
    pending:  { color: '#D97706', bg: '#FEF3C7', dot: '#F59E0B' },
    assigned: { color: '#2563EB', bg: '#DBEAFE', dot: '#2563EB' },
    resolved: { color: '#059669', bg: '#D1FAE5', dot: '#10B981' },
};

export const ReportSummaryItem: React.FC<ReportSummaryItemProps> = ({
    title, location, statusLabel, statusVariant = 'pending', reportId,
}) => {
    const s = statusConfig[statusVariant] || statusConfig.pending;

    return (
        <View style={{
            backgroundColor: 'white',
            borderRadius: 18,
            marginBottom: 10,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
            borderLeftWidth: 4,
            borderLeftColor: s.dot,
        }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: '700', flex: 1, paddingRight: 10 }} numberOfLines={1}>
                    {title}
                </Text>
                <View style={{ backgroundColor: s.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                    <Text style={{ color: s.color, fontSize: 10, fontWeight: '800' }}>{statusLabel}</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MapPin size={12} color="#94A3B8" strokeWidth={2} />
                    <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '500', marginLeft: 4 }} numberOfLines={1}>{location}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Hash size={11} color="#CBD5E1" strokeWidth={2} />
                    <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', marginLeft: 2 }}>{reportId.replace('#', '')}</Text>
                </View>
            </View>
        </View>
    );
};
