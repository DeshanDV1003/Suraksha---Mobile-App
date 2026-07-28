import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    Modal, ActivityIndicator, Switch, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '../components/common/Header';
import {
    HeartPulse, Shield, Heart, Sparkles, X, CheckCircle2,
    Clock, Users, ChevronDown, Phone,
} from 'lucide-react-native';
import { supportService } from '../services/api';
import { useOfflineSubmit } from '../hooks/useOfflineSubmit';
import { useToast } from '../context/ToastContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const SUPPORT_TYPES = [
    { value: 'TRAUMA_CARE',    label: 'Trauma Care' },
    { value: 'GRIEF_SUPPORT',  label: 'Grief Support' },
    { value: 'COUNSELING',     label: 'Counseling' },
    { value: 'CHILD_SUPPORT',  label: 'Child Support' },
];

const URGENCY_LEVELS = [
    { value: 'LOW',      label: 'Routine',   color: '#10B981', bg: '#D1FAE5' },
    { value: 'MEDIUM',   label: 'Immediate', color: '#F59E0B', bg: '#FEF3C7' },
    { value: 'HIGH',     label: 'Urgent',    color: '#F97316', bg: '#FFEDD5' },
    { value: 'CRITICAL', label: 'Crisis',    color: '#EF4444', bg: '#FEE2E2' },
];

const INITIAL_FORM = {
    type: 'TRAUMA_CARE',
    description: '',
    urgency: 'MEDIUM',
    anonymous: false,
    location: '',
    affectedCount: '1',
};

interface Submitted {
    type: string;
    urgency: string;
    description: string;
    anonymous: boolean;
    submittedAt: Date;
    queued: boolean;
}

export default function SupportScreen() {
    const { t } = useTranslation();
    const toast = useToast();

    const [requests, setRequests]     = useState<any[]>([]);
    const [isOfficer, setIsOfficer]   = useState(false);
    const [showModal, setShowModal]   = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted]   = useState<Submitted | null>(null);
    const [formData, setFormData]     = useState({ ...INITIAL_FORM });

    const { submit } = useOfflineSubmit('PSYCHOLOGICAL_SUPPORT', '/support');

    const fetchData = useCallback(async () => {
        try {
            const res = await supportService.getRequests();
            setRequests(res.data || []);
            setIsOfficer(true);
        } catch (error: any) {
            if (error?.response?.status !== 403) {
                console.error('Failed to fetch support requests:', error);
            }
            setIsOfficer(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

    const selectedUrgency = URGENCY_LEVELS.find(u => u.value === formData.urgency) ?? URGENCY_LEVELS[1];
    const selectedType    = SUPPORT_TYPES.find(s => s.value === formData.type) ?? SUPPORT_TYPES[0];

    const handleSubmit = async () => {
        if (!formData.description.trim()) {
            toast.error(t('common.error') || 'Error', 'Please share how we can help you.');
            return;
        }
        setIsSubmitting(true);
        try {
            const data = { ...formData, affectedCount: parseInt(formData.affectedCount) || 1 };
            const result = await submit(data);

            setSubmitted({
                type: selectedType.label,
                urgency: selectedUrgency.label,
                description: formData.description,
                anonymous: formData.anonymous,
                submittedAt: new Date(),
                queued: !!result.queued,
            });

            if (result.queued) {
                toast.warning(t('common.offline_queued') || 'Queued', 'Your request will be sent when you reconnect.');
            } else {
                toast.success(t('common.success') || 'Submitted', 'A counselor will reach out to you soon.');
            }
            setShowModal(false);
            setFormData({ ...INITIAL_FORM });
            fetchData();
        } catch (err) {
            console.error('Failed to submit support request:', err);
            toast.error(t('common.error') || 'Error', 'Failed to submit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header title={t('support.title') || 'Counseling & Support'} subtitle={t('support.subtitle') || 'Professional mental well-being'} showBack />

            <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

                {/* Hero banner */}
                <LinearGradient
                    colors={['#4F46E5', '#7C3AED', '#EC4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ marginHorizontal: 16, marginTop: 16, borderRadius: 28, padding: 24 }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' }}>
                            <Sparkles size={13} color="#FDE047" />
                            <Text style={{ color: 'white', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 6 }}>
                                Mental Well-being
                            </Text>
                        </View>
                    </View>

                    <Text style={{ color: 'white', fontSize: 24, fontWeight: '900', lineHeight: 30, marginBottom: 10 }}>
                        {t('support.header_title') || 'You are not alone in this.'}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500', lineHeight: 22, marginBottom: 20 }}>
                        {t('support.header_desc') || 'Disasters are overwhelming. Our certified trauma counselors are available 24/7 to help you.'}
                    </Text>

                    <TouchableOpacity
                        onPress={() => setShowModal(true)}
                        activeOpacity={0.85}
                        style={{ backgroundColor: 'white', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
                    >
                        <Text style={{ color: '#4F46E5', fontSize: 15, fontWeight: '900' }}>
                            {t('support.talk_now') || 'Talk to a Counselor'}
                        </Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Post-submit confirmation */}
                {submitted && (
                    <View style={{ marginHorizontal: 16, marginTop: 20, backgroundColor: submitted.queued ? '#FFFBEB' : '#F0FDF4', borderWidth: 1.5, borderColor: submitted.queued ? '#FCD34D' : '#86EFAC', borderRadius: 24, padding: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <CheckCircle2 size={22} color={submitted.queued ? '#F59E0B' : '#16A34A'} strokeWidth={2.5} />
                            <Text style={{ color: submitted.queued ? '#92400E' : '#15803D', fontSize: 15, fontWeight: '900', marginLeft: 10 }}>
                                {submitted.queued ? 'Saved — Will Sync Later' : 'Request Submitted'}
                            </Text>
                        </View>
                        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16 }}>
                            <Row label="Support Type" value={submitted.type} />
                            <Row label="Urgency" value={submitted.urgency} />
                            <Row label="Identity" value={submitted.anonymous ? 'Anonymous' : 'Named'} />
                            <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', marginTop: 10, marginBottom: 4 }}>Your Message</Text>
                            <Text style={{ color: '#334155', fontSize: 13, lineHeight: 20 }} numberOfLines={3}>{submitted.description}</Text>
                            <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 10 }}>{submitted.submittedAt.toLocaleString()}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setSubmitted(null)} style={{ marginTop: 12, alignItems: 'center' }}>
                            <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600' }}>Dismiss</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Officer: active sessions list */}
                {isOfficer && (
                    <View style={{ marginHorizontal: 16, marginTop: 24 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <Text style={{ color: '#0F172A', fontSize: 18, fontWeight: '900' }}>
                                {t('support.active_sessions') || 'Active Sessions'}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 8, height: 8, backgroundColor: '#10B981', borderRadius: 4, marginRight: 6 }} />
                                <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                    {t('support.online') || 'Counselors Online'}
                                </Text>
                            </View>
                        </View>

                        {requests.length === 0 ? (
                            <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
                                <HeartPulse size={40} color="#818CF8" strokeWidth={1.5} />
                                <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '900', marginTop: 16, marginBottom: 6 }}>
                                    {t('support.no_requests') || 'No Active Requests'}
                                </Text>
                                <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                                    No pending support sessions right now.
                                </Text>
                            </View>
                        ) : (
                            requests.map(req => {
                                const urg = URGENCY_LEVELS.find(u => u.value === req.urgency) ?? URGENCY_LEVELS[1];
                                return (
                                    <View key={req.id} style={{ backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                            <View style={{ backgroundColor: urg.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginRight: 8 }}>
                                                <Text style={{ color: urg.color, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>{urg.label}</Text>
                                            </View>
                                            <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{req.type?.replace('_', ' ')}</Text>
                                        </View>
                                        <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: '800', marginBottom: 6 }}>
                                            {req.anonymous ? 'Anonymous Support Request' : `Session for ${req.user?.name || 'User'}`}
                                        </Text>
                                        <Text style={{ color: '#475569', fontSize: 13, lineHeight: 20, marginBottom: 14 }} numberOfLines={3}>
                                            {req.description}
                                        </Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F8FAFC' }}>
                                            <Clock size={13} color="#94A3B8" strokeWidth={2} />
                                            <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '600', marginLeft: 5, marginRight: 16 }}>{dayjs(req.createdAt).fromNow()}</Text>
                                            <Users size={13} color="#94A3B8" strokeWidth={2} />
                                            <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '600', marginLeft: 5 }}>{req.affectedCount ?? 1} affected</Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>
                )}

                {/* Why Speak Up */}
                <View style={{ marginHorizontal: 16, marginTop: 24, backgroundColor: 'white', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#F1F5F9' }}>
                    <Text style={{ color: '#0F172A', fontSize: 18, fontWeight: '900', marginBottom: 20 }}>
                        {t('support.why_speak') || 'Why Speak Up?'}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
                        <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 16, flexShrink: 0 }}>
                            <Shield size={26} color="#6366F1" strokeWidth={2} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: '900', marginBottom: 4 }}>
                                {t('support.confidential') || '100% Confidential'}
                            </Text>
                            <Text style={{ color: '#64748B', fontSize: 13, lineHeight: 20 }}>
                                {t('support.confidential_desc') || 'Your identity can remain anonymous throughout the process.'}
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
                        <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#FDF2F8', alignItems: 'center', justifyContent: 'center', marginRight: 16, flexShrink: 0 }}>
                            <Heart size={26} color="#EC4899" strokeWidth={2} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: '900', marginBottom: 4 }}>
                                {t('support.expert_care') || 'Expert Care'}
                            </Text>
                            <Text style={{ color: '#64748B', fontSize: 13, lineHeight: 20 }}>
                                {t('support.expert_desc') || 'Certified trauma specialists with emergency experience.'}
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginRight: 16, flexShrink: 0 }}>
                            <Phone size={26} color="#10B981" strokeWidth={2} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: '900', marginBottom: 4 }}>Available 24/7</Text>
                            <Text style={{ color: '#64748B', fontSize: 13, lineHeight: 20 }}>
                                Support is available any time of day or night during and after a disaster.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Request modal */}
            <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(79,70,229,0.3)', justifyContent: 'flex-end' }}>
                        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '90%' }}>
                            {/* Modal header */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                                <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>
                                    {t('support.form_title') || 'Request Counseling'}
                                </Text>
                                <TouchableOpacity onPress={() => setShowModal(false)} style={{ padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 }}>
                                    <X size={18} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                                {/* Support type */}
                                <Text style={fieldLabel}>{t('support.topic') || 'Support Topic'}</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
                                    {SUPPORT_TYPES.map(type => (
                                        <TouchableOpacity
                                            key={type.value}
                                            onPress={() => setFormData(f => ({ ...f, type: type.value }))}
                                            style={{
                                                paddingHorizontal: 14,
                                                paddingVertical: 8,
                                                borderRadius: 50,
                                                borderWidth: 2,
                                                borderColor: formData.type === type.value ? '#4F46E5' : '#E2E8F0',
                                                backgroundColor: formData.type === type.value ? '#4F46E5' : 'white',
                                                marginRight: 8,
                                                marginBottom: 8,
                                            }}
                                        >
                                            <Text style={{ color: formData.type === type.value ? 'white' : '#475569', fontWeight: '700', fontSize: 13 }}>
                                                {type.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Urgency */}
                                <Text style={fieldLabel}>{t('support.urgency') || 'Urgency Level'}</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
                                    {URGENCY_LEVELS.map(level => (
                                        <TouchableOpacity
                                            key={level.value}
                                            onPress={() => setFormData(f => ({ ...f, urgency: level.value }))}
                                            style={{
                                                paddingHorizontal: 14,
                                                paddingVertical: 8,
                                                borderRadius: 50,
                                                borderWidth: 2,
                                                borderColor: formData.urgency === level.value ? level.color : '#E2E8F0',
                                                backgroundColor: formData.urgency === level.value ? level.bg : 'white',
                                                marginRight: 8,
                                                marginBottom: 8,
                                            }}
                                        >
                                            <Text style={{ color: formData.urgency === level.value ? level.color : '#475569', fontWeight: '800', fontSize: 13 }}>
                                                {level.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Description */}
                                <Text style={fieldLabel}>{t('support.how_help') || 'How can we help?'}</Text>
                                <TextInput
                                    multiline
                                    numberOfLines={5}
                                    placeholder={t('support.desc_placeholder') || "Feel free to share what's on your mind..."}
                                    placeholderTextColor="#94A3B8"
                                    value={formData.description}
                                    onChangeText={text => setFormData(f => ({ ...f, description: text }))}
                                    style={{
                                        backgroundColor: '#F8FAFC',
                                        borderWidth: 1,
                                        borderColor: '#E2E8F0',
                                        borderRadius: 20,
                                        padding: 16,
                                        fontSize: 14,
                                        color: '#0F172A',
                                        textAlignVertical: 'top',
                                        minHeight: 120,
                                        marginBottom: 20,
                                    }}
                                />

                                {/* Anonymous toggle */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, padding: 16, marginBottom: 24 }}>
                                    <View style={{ flex: 1, marginRight: 16 }}>
                                        <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: '800', marginBottom: 2 }}>
                                            {t('support.anonymous') || 'Stay Anonymous'}
                                        </Text>
                                        <Text style={{ color: '#94A3B8', fontSize: 12 }}>
                                            {t('support.anonymous_desc') || 'Your name will not be shared with counselors'}
                                        </Text>
                                    </View>
                                    <Switch
                                        value={formData.anonymous}
                                        onValueChange={val => setFormData(f => ({ ...f, anonymous: val }))}
                                        trackColor={{ false: '#CBD5E1', true: '#6366F1' }}
                                        thumbColor="white"
                                    />
                                </View>

                                {/* Submit */}
                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    disabled={isSubmitting}
                                    activeOpacity={0.85}
                                    style={{ backgroundColor: '#4F46E5', borderRadius: 20, paddingVertical: 18, alignItems: 'center' }}
                                >
                                    {isSubmitting
                                        ? <ActivityIndicator color="white" />
                                        : <Text style={{ color: 'white', fontSize: 16, fontWeight: '900' }}>
                                            {t('support.submit') || 'Request Professional Help'}
                                          </Text>
                                    }
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const fieldLabel = {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 10,
};

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' }}>
            <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600' }}>{label}</Text>
            <Text style={{ color: '#1E293B', fontSize: 12, fontWeight: '700' }}>{value}</Text>
        </View>
    );
}
