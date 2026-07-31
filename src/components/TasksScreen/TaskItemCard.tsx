import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TaskItemCardProps {
    title: string;
    location: string;
    description: string;
    time: string;
    status: string;
    onAccept?: () => void;
    onDecline?: () => void;
    onComplete?: () => void;
    labels: {
        decline: string;
        accept: string;
        pending: string;
        inProgress: string;
        completed: string;
        assigned?: string;
    };
}

const statusConfig: Record<string, { color: string; bg: string; label: (l: any) => string }> = {
    pending:      { color: '#D97706', bg: '#FEF3C7', label: l => l.pending },
    assigned:     { color: '#7C3AED', bg: '#EDE9FE', label: l => l.assigned || 'Assigned' },
    'in-progress':{ color: '#2563EB', bg: '#DBEAFE', label: l => l.inProgress },
    resolved:     { color: '#059669', bg: '#D1FAE5', label: l => l.completed },
    'en-route':   { color: '#0891B2', bg: '#CFFAFE', label: () => 'En Route' },
    'on-site':    { color: '#0F766E', bg: '#CCFBF1', label: () => 'On Site' },
};

const stripColors: Record<string, string> = {
    pending:      '#F59E0B',
    assigned:     '#7C3AED',
    'in-progress':'#2563EB',
    resolved:     '#10B981',
    'en-route':   '#0891B2',
    'on-site':    '#0F766E',
};

export const TaskItemCard: React.FC<TaskItemCardProps> = ({
    title, location, description, time, status = 'pending',
    onAccept, onDecline, onComplete, labels,
}) => {
    const s = statusConfig[status] || statusConfig.pending;
    const strip = stripColors[status] || '#F59E0B';

    return (
        <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            marginBottom: 14,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
            flexDirection: 'row',
        }}>
            {/* Left accent strip */}
            <View style={{ width: 5, backgroundColor: strip }} />

            <View style={{ flex: 1, padding: 16 }}>
                {/* Title + status badge */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: '800', flex: 1, paddingRight: 10, lineHeight: 20 }}>
                        {title}
                    </Text>
                    <View style={{ backgroundColor: s.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                        <Text style={{ color: s.color, fontSize: 10, fontWeight: '800', letterSpacing: 0.3 }}>
                            {s.label(labels)}
                        </Text>
                    </View>
                </View>

                {/* Location */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <MapPin size={13} color="#94A3B8" strokeWidth={2} />
                    <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600', marginLeft: 5 }}>{location}</Text>
                </View>

                {/* Description */}
                <Text style={{ color: '#475569', fontSize: 13, lineHeight: 19, marginBottom: 12 }} numberOfLines={2}>
                    {description}
                </Text>

                {/* Footer */}
                <View style={{ flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 }}>
                    <Clock size={12} color="#94A3B8" strokeWidth={2} />
                    <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '600', marginLeft: 4, flex: 1 }}>{time}</Text>
                </View>

                {/* Accept / Decline for pending or assigned tasks */}
                {(status === 'pending' || status === 'assigned') && (
                    <View style={{ flexDirection: 'row', marginTop: 14, gap: 10 }}>
                        <TouchableOpacity
                            onPress={onDecline}
                            activeOpacity={0.7}
                            style={{
                                flex: 1,
                                borderWidth: 1.5,
                                borderColor: '#FCA5A5',
                                borderRadius: 14,
                                paddingVertical: 12,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                gap: 6,
                            }}
                        >
                            <XCircle size={15} color="#EF4444" strokeWidth={2.5} />
                            <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '700' }}>{labels.decline}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onAccept}
                            activeOpacity={0.85}
                            style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}
                        >
                            <LinearGradient
                                colors={['#1E3A8A', '#2563EB']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
                            >
                                <CheckCircle2 size={15} color="white" strokeWidth={2.5} />
                                <Text style={{ color: 'white', fontSize: 13, fontWeight: '700' }}>{labels.accept}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Mark Complete for in-progress tasks */}
                {(status === 'in-progress' || status === 'en-route' || status === 'on-site') && (
                    <TouchableOpacity
                        onPress={onComplete}
                        activeOpacity={0.85}
                        style={{ marginTop: 14, borderRadius: 14, overflow: 'hidden' }}
                    >
                        <LinearGradient
                            colors={['#065F46', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
                        >
                            <CheckCircle2 size={15} color="white" strokeWidth={2.5} />
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: '700' }}>Mark as Completed</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};
