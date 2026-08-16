import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    Modal, ActivityIndicator, Linking, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { UserSearch, Plus, X, MapPin, Clock, User, Phone, FileText } from 'lucide-react-native';
import { Header } from '../components/common/Header';
import { missingPersonService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useOfflineSubmit } from '../hooks/useOfflineSubmit';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const ACCENT = '#E11D48';

export default function MissingPersonsScreen() {
    const { t } = useTranslation();
    const toast = useToast();
    const [persons, setPersons]           = useState<any[]>([]);
    const [loading, setLoading]           = useState(true);
    const [showModal, setShowModal]       = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', age: '', description: '', lastSeen: '' });
    const { submit: submitOffline } = useOfflineSubmit('MISSING_PERSON_REPORT', '/missing-persons');

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await missingPersonService.getMissing();
            setPersons(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error(t('common.error'), 'Could not load missing persons');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchData(); }, []));

    const resetForm = () => setForm({ name: '', age: '', description: '', lastSeen: '' });

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.description.trim() || !form.lastSeen.trim()) {
            toast.error(t('common.error'), t('common.fill_all') || 'Please fill all required fields');
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                name:        form.name.trim(),
                age:         form.age ? parseInt(form.age) : null,
                description: form.description.trim(),
                lastSeen:    form.lastSeen.trim(),
                photo:       null,
            };
            const result = await submitOffline(payload);
            if (result.queued) {
                toast.warning(t('common.offline_queued') || 'Queued', 'Report saved — will be submitted when you reconnect.');
            } else {
                toast.success(t('common.success'), t('missing_persons.report_success') || 'Report submitted successfully');
                fetchData();
            }
            setShowModal(false);
            resetForm();
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to submit report';
            toast.error(t('common.error'), msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const nearby = persons;

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header
                title={t('missing_persons.title') || 'Missing Persons'}
                subtitle={t('missing_persons.subtitle') || 'Search and report in your area'}
                showBack
                rightContent={
                    <TouchableOpacity
                        onPress={() => setShowModal(true)}
                        style={{ width: 38, height: 38, backgroundColor: ACCENT, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Plus size={20} color="white" strokeWidth={2.5} />
                    </TouchableOpacity>
                }
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

                {loading ? (
                    <View style={{ paddingVertical: 80, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={ACCENT} />
                        <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 12 }}>
                            {t('missing_persons.scanning') || 'Scanning records...'}
                        </Text>
                    </View>
                ) : nearby.length === 0 ? (
                    <View style={{ backgroundColor: 'white', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#E2E8F0', borderRadius: 20, padding: 40, alignItems: 'center', marginTop: 8 }}>
                        <UserSearch size={52} color="#E2E8F0" />
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#475569', marginTop: 14, marginBottom: 6 }}>
                            {t('missing_persons.no_records') || 'No Missing Persons'}
                        </Text>
                        <Text style={{ color: '#94A3B8', textAlign: 'center', fontSize: 13, lineHeight: 20 }}>
                            {t('missing_persons.no_reports') || 'No missing persons reported right now.'}
                        </Text>
                    </View>
                ) : (
                    nearby.map(person => (
                        <PersonCard key={person.id} person={person} t={t} onPress={() => setSelectedPerson(person)} />
                    ))
                )}

                {/* Emergency hotline */}
                <View style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 20, padding: 20, marginTop: 16 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <Phone size={24} color="white" />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#1E3A8A', marginBottom: 6 }}>
                        {t('missing_persons.emergency_hotline') || 'Emergency Hotline'}
                    </Text>
                    <Text style={{ color: '#3B82F6', fontSize: 13, lineHeight: 20, marginBottom: 14 }}>
                        {t('missing_persons.emergency_desc') || 'If you have immediate information, call 119 or our rescue centre.'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => Linking.openURL('tel:119')}
                        style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                    >
                        <Text style={{ color: '#3B82F6', fontWeight: '800', fontSize: 15 }}>
                            {t('missing_persons.call_now') || 'Call 119 Now'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* ── Detail modal ── */}
            <Modal visible={!!selectedPerson} animationType="slide" transparent onRequestClose={() => setSelectedPerson(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>
                                {t('missing_persons.details') || 'Details'}
                            </Text>
                            <TouchableOpacity onPress={() => setSelectedPerson(null)} style={{ padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 }}>
                                <X size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        {selectedPerson && (
                            <View>
                                <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 }}>
                                    <User size={64} color="#CBD5E1" />
                                    {selectedPerson.status === 'FOUND' && (
                                        <View style={{ marginTop: 10, backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20 }}>
                                            <Text style={{ color: 'white', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
                                                {t('missing_persons.found') || 'Found'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={{ fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 4 }}>{selectedPerson.name}</Text>
                                {(selectedPerson.age || selectedPerson.gender) ? (
                                    <Text style={{ color: '#64748B', fontWeight: '600', marginBottom: 14 }}>
                                        {[selectedPerson.age && `${selectedPerson.age} yrs`, selectedPerson.gender].filter(Boolean).join(' • ')}
                                    </Text>
                                ) : <View style={{ marginBottom: 14 }} />}
                                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                    <MapPin size={14} color={ACCENT} />
                                    <Text style={{ color: '#374151', fontWeight: '600', marginLeft: 8, flex: 1 }}>
                                        {t('missing_persons.last_seen') || 'Last seen'}: {selectedPerson.lastSeen}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                                    <FileText size={14} color="#94A3B8" />
                                    <Text style={{ color: '#64748B', marginLeft: 8, flex: 1, lineHeight: 20 }}>{selectedPerson.description}</Text>
                                </View>
                                {selectedPerson.contactPhone ? (
                                    <TouchableOpacity
                                        onPress={() => Linking.openURL(`tel:${selectedPerson.contactPhone}`)}
                                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 14, borderRadius: 14, marginBottom: 14 }}
                                    >
                                        <Phone size={18} color="#3B82F6" />
                                        <Text style={{ color: '#3B82F6', fontWeight: '700', marginLeft: 10, flex: 1 }}>
                                            {selectedPerson.contactName ? `${selectedPerson.contactName}: ` : ''}{selectedPerson.contactPhone}
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Clock size={13} color="#94A3B8" />
                                    <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '600', marginLeft: 6 }}>
                                        {t('missing_persons.reported') || 'Reported'}: {dayjs(selectedPerson.createdAt).fromNow()}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* ── Report modal ── */}
            <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => { setShowModal(false); resetForm(); }}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
                            {/* Modal header */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>
                                    {t('missing_persons.report_new') || 'Report Missing Person'}
                                </Text>
                                <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }} style={{ padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 }}>
                                    <X size={18} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            {/* Name + Age */}
                            <View style={{ flexDirection: 'row', marginBottom: 14 }}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <FieldLabel text={t('missing_persons.full_name') || 'Full Name *'} />
                                    <TextInput
                                        value={form.name}
                                        onChangeText={v => setForm(f => ({ ...f, name: v }))}
                                        placeholder="Legal name"
                                        placeholderTextColor="#CBD5E1"
                                        style={inputStyle}
                                    />
                                </View>
                                <View style={{ width: 78 }}>
                                    <FieldLabel text={t('missing_persons.age') || 'Age'} />
                                    <TextInput
                                        value={form.age}
                                        onChangeText={v => setForm(f => ({ ...f, age: v }))}
                                        placeholder="—"
                                        keyboardType="numeric"
                                        placeholderTextColor="#CBD5E1"
                                        style={inputStyle}
                                    />
                                </View>
                            </View>

                            <View style={{ marginBottom: 14 }}>
                                <FieldLabel text={t('missing_persons.last_seen') || 'Last Seen Location *'} />
                                <TextInput
                                    value={form.lastSeen}
                                    onChangeText={v => setForm(f => ({ ...f, lastSeen: v }))}
                                    placeholder="City, street, or landmark"
                                    placeholderTextColor="#CBD5E1"
                                    style={inputStyle}
                                />
                            </View>

                            <View style={{ marginBottom: 24 }}>
                                <FieldLabel text={t('missing_persons.description') || 'Description *'} />
                                <TextInput
                                    value={form.description}
                                    onChangeText={v => setForm(f => ({ ...f, description: v }))}
                                    placeholder="Appearance, clothing, distinguishing features..."
                                    placeholderTextColor="#CBD5E1"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    style={[inputStyle, { height: 96, paddingTop: 12 }]}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                                style={{ backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 16, alignItems: 'center', opacity: isSubmitting ? 0.7 : 1 }}
                            >
                                {isSubmitting
                                    ? <ActivityIndicator color="white" />
                                    : <Text style={{ color: 'white', fontSize: 16, fontWeight: '900' }}>
                                        {t('missing_persons.submit') || 'Submit Report'}
                                      </Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

function FieldLabel({ text }: { text: string }) {
    return (
        <Text style={{ fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7 }}>
            {text}
        </Text>
    );
}

const inputStyle: any = {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
};

function PersonCard({ person, t, onPress }: { person: any; t: any; onPress: () => void }) {
    const isFound = person.status === 'FOUND';
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
        }}>
            {/* Photo placeholder */}
            <View style={{ height: 130, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
                <User size={52} color="#CBD5E1" />
                {isFound && (
                    <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                        <Text style={{ color: 'white', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {t('missing_persons.found') || 'Found'}
                        </Text>
                    </View>
                )}
            </View>

            <View style={{ padding: 16 }}>
                {/* Name row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: '900', color: '#0F172A' }} numberOfLines={1}>{person.name}</Text>
                        {person.age ? (
                            <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '600', marginTop: 2 }}>
                                {person.age} {t('missing_persons.age_suffix') || 'yrs old'}
                            </Text>
                        ) : null}
                    </View>
                    <View style={{ backgroundColor: isFound ? '#D1FAE5' : '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                        <Text style={{ color: isFound ? '#065F46' : '#991B1B', fontSize: 10, fontWeight: '800' }}>
                            {isFound ? (t('missing_persons.found') || 'Found') : (t('missing_persons.missing') || 'Missing')}
                        </Text>
                    </View>
                </View>

                {/* Last seen */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <MapPin size={12} color={ACCENT} />
                    <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600', marginLeft: 5, flex: 1 }} numberOfLines={1}>
                        {t('missing_persons.last_seen') || 'Last seen'}: {person.lastSeen}
                    </Text>
                </View>

                {/* Description */}
                <Text style={{ color: '#94A3B8', fontSize: 12, lineHeight: 18, marginBottom: 12 }} numberOfLines={2}>
                    {person.description}
                </Text>

                {/* Footer */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Clock size={12} color="#CBD5E1" />
                        <Text style={{ color: '#CBD5E1', fontSize: 10, fontWeight: '700', marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {dayjs(person.createdAt).fromNow()}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onPress}>
                        <Text style={{ color: ACCENT, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {t('missing_persons.view_details') || 'View Details'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
