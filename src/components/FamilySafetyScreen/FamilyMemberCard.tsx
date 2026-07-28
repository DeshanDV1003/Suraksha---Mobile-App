import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle2, AlertTriangle, HelpCircle, Building2, User } from 'lucide-react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

interface FamilyMemberCardProps {
    name: string;
    relation?: string;
    status?: string | null;
    updatedAt?: string | null;
}

const STATUS_CONFIG: Record<string, { bg: string; dot: string; text: string; label: string; Icon: any; iconColor: string }> = {
    SAFE:       { bg: '#D1FAE5', dot: '#10B981', text: '#065F46', label: 'Safe',        Icon: CheckCircle2, iconColor: '#10B981' },
    NEEDS_HELP: { bg: '#FEE2E2', dot: '#EF4444', text: '#991B1B', label: 'Needs Help',  Icon: AlertTriangle, iconColor: '#EF4444' },
    SHELTERED:  { bg: '#DBEAFE', dot: '#2563EB', text: '#1E40AF', label: 'Sheltered',   Icon: Building2,    iconColor: '#2563EB' },
    UNKNOWN:    { bg: '#FEF3C7', dot: '#F59E0B', text: '#92400E', label: 'Unknown',     Icon: HelpCircle,   iconColor: '#F59E0B' },
};

const DEFAULT_CONFIG = { bg: '#F1F5F9', dot: '#CBD5E1', text: '#64748B', label: 'No Update', Icon: User, iconColor: '#94A3B8' };

export const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({ name, relation, status, updatedAt }) => {
    const cfg = (status && STATUS_CONFIG[status]) || DEFAULT_CONFIG;
    const Icon = cfg.Icon;

    return (
        <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            marginBottom: 10,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderLeftWidth: 4,
            borderLeftColor: cfg.dot,
            overflow: 'hidden',
        }}>
            {/* Avatar */}
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: cfg.bg, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                <Icon size={24} color={cfg.iconColor} strokeWidth={2} />
            </View>

            {/* Name + relation + time */}
            <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: '800' }} numberOfLines={1}>{name}</Text>
                {relation ? (
                    <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '500', marginTop: 1 }} numberOfLines={1}>{relation}</Text>
                ) : null}
                {updatedAt ? (
                    <Text style={{ color: '#CBD5E1', fontSize: 11, marginTop: 2 }}>{dayjs(updatedAt).fromNow()}</Text>
                ) : null}
            </View>

            {/* Status badge */}
            <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexShrink: 0, marginLeft: 8 }}>
                <Text style={{ color: cfg.text, fontSize: 11, fontWeight: '800' }}>{cfg.label}</Text>
            </View>
        </View>
    );
};
