import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    Modal, ActivityIndicator, Linking, KeyboardAvoidingView, Platform,
} from 'react-native';
import {
    Package, Phone, Plus, X, Search, MapPin,
    Truck, Zap, Anchor, Home, Users, Info,
} from 'lucide-react-native';
import { resourceService } from '../services/api';
import { useUserDistrict, matchesDistrict } from '../context/LocationContext';
import { useOfflineSubmit } from '../hooks/useOfflineSubmit';
import { useToast } from '../context/ToastContext';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '../components/common/Header';
import { useTranslation } from 'react-i18next';

const RESOURCE_ICON = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('boat') || t.includes('vessel'))   return { Icon: Anchor, color: '#0EA5E9', bg: '#E0F2FE' };
    if (t.includes('truck') || t.includes('vehicle')) return { Icon: Truck,  color: '#16A34A', bg: '#DCFCE7' };
    if (t.includes('generator') || t.includes('power')) return { Icon: Zap, color: '#7C3AED', bg: '#EDE9FE' };
    if (t.includes('shelter') || t.includes('room'))  return { Icon: Home,   color: '#EA580C', bg: '#FFEDD5' };
    if (t.includes('medical') || t.includes('aid'))   return { Icon: Users,  color: '#DC2626', bg: '#FEE2E2' };
    return { Icon: Package, color: '#2563EB', bg: '#EFF6FF' };
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
    AVAILABLE:   { bg: '#D1FAE5', text: '#065F46', label: 'Available' },
    IN_USE:      { bg: '#FEF3C7', text: '#92400E', label: 'In Use' },
    UNAVAILABLE: { bg: '#FEE2E2', text: '#991B1B', label: 'Unavailable' },
};

const STAT_KEYS = [
    { label: 'Boats',      match: (t: string) => t.includes('boat') || t.includes('vessel'), color: '#0EA5E9' },
    { label: 'Vehicles',   match: (t: string) => t.includes('vehicle') || t.includes('truck'), color: '#16A34A' },
    { label: 'Generators', match: (t: string) => t.includes('generator') || t.includes('power'), color: '#7C3AED' },
    { label: 'Shelter',    match: (t: string) => t.includes('shelter') || t.includes('room'), color: '#EA580C' },
];

export default function ResourcesScreen() {
    const { t } = useTranslation();
    const toast = useToast();
    const userDistrict = useUserDistrict();

    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetail, setShowDetail] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: '', owner: '', location: '', capacity: '', contact: '',
    });

    const { submit } = useOfflineSubmit('RESOURCE_SUBMISSION', '/resources');

    const fetchResources = async () => {
        try {
            setLoading(true);
            const res = await resourceService.getResources();
            setResources(res.data || []);
        } catch {
            toast.error('Error', t('resources.load_fail') || 'Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchResources(); }, []));

    const nearby = userDistrict
        ? resources.filter(r => matchesDistrict(r.location, userDistrict))
        : resources;

    const filtered = nearby.filter(r =>
        r.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.owner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async () => {
        if (!formData.type.trim() || !formData.owner.trim() || !formData.location.trim() || !formData.contact.trim()) {
            toast.error('Error', t('common.fill_all') || 'Please fill all required fields');
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await submit(formData);
            if (result.queued) {
                toast.warning('Queued', 'You are offline. Resource will be submitted when you reconnect.');
            } else {
                toast.success('Success', t('resources.add_success') || 'Resource added successfully');
            }
            setShowModal(false);
            setFormData({ type: '', owner: '', location: '', capacity: '', contact: '' });
            fetchResources();
        } catch {
            toast.error('Error', t('resources.add_fail') || 'Failed to add resource');
        } finally {
            setIsSubmitting(false);
        }
    };

    const Field = ({ label, value, placeholder, onChangeText, keyboardType }: any) => (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                {label}
            </Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                keyboardType={keyboardType || 'default'}
                style={{ backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 14, color: '#0F172A' }}
            />
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header
                title={t('resources.title') || 'Resources'}
                subtitle={t('resources.subtitle') || 'Available resources in your area'}
                showBack
                rightContent={
                    <TouchableOpacity
                        onPress={() => setShowModal(true)}
                        style={{ width: 40, height: 40, backgroundColor: '#2563EB', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Plus size={22} color="white" strokeWidth={2.5} />
                    </TouchableOpacity>
                }
            />

            {/* Search bar */}
            <View style={{ backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 }}>
                    <Search size={18} color="#94A3B8" strokeWidth={2} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder={t('resources.search_placeholder') || 'Search by type, owner or location…'}
                        placeholderTextColor="#94A3B8"
                        style={{ flex: 1, marginLeft: 10, fontSize: 14, color: '#0F172A' }}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={16} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                {/* Stats row */}
                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    {STAT_KEYS.map((sk, i) => {
                        const count = nearby.filter(r => sk.match(r.type?.toLowerCase() || '') && r.status === 'AVAILABLE').length;
                        return (
                            <View key={sk.label} style={{
                                flex: 1,
                                marginRight: i < STAT_KEYS.length - 1 ? 8 : 0,
                                backgroundColor: 'white',
                                borderRadius: 14,
                                padding: 12,
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 4,
                                elevation: 2,
                            }}>
                                <Text style={{ fontSize: 20, fontWeight: '900', color: sk.color }}>{count}</Text>
                                <Text style={{ fontSize: 9, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2, textAlign: 'center' }}>
                                    {sk.label}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* List */}
                {loading ? (
                    <View style={{ paddingVertical: 80, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#2563EB" />
                        <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 12 }}>{t('common.loading') || 'Loading…'}</Text>
                    </View>
                ) : filtered.length === 0 ? (
                    <View style={{ backgroundColor: 'white', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#E2E8F0', borderRadius: 20, padding: 40, alignItems: 'center' }}>
                        <Package size={52} color="#E2E8F0" />
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#475569', marginTop: 14, marginBottom: 6 }}>No Resources Found</Text>
                        <Text style={{ color: '#94A3B8', textAlign: 'center', fontSize: 13, lineHeight: 20 }}>
                            {searchQuery
                                ? `No results for "${searchQuery}"`
                                : `No resources listed in ${userDistrict || 'your area'} yet.`}
                        </Text>
                    </View>
                ) : (
                    filtered.map((resource) => {
                        const { Icon, color, bg } = RESOURCE_ICON(resource.type || '');
                        const sc = STATUS_CONFIG[resource.status] || STATUS_CONFIG.AVAILABLE;
                        return (
                            <View key={resource.id} style={{
                                backgroundColor: 'white',
                                borderRadius: 20,
                                marginBottom: 12,
                                overflow: 'hidden',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.06,
                                shadowRadius: 8,
                                elevation: 3,
                            }}>
                                <View style={{ padding: 16 }}>
                                    {/* Top row */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                            <Icon size={24} color={color} strokeWidth={2} />
                                        </View>
                                        <View style={{ flex: 1, minWidth: 0 }}>
                                            <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }} numberOfLines={1}>{resource.type}</Text>
                                            <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 1 }} numberOfLines={1}>{resource.owner}</Text>
                                        </View>
                                        <View style={{ backgroundColor: sc.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, flexShrink: 0, marginLeft: 8 }}>
                                            <Text style={{ color: sc.text, fontSize: 10, fontWeight: '800' }}>{sc.label}</Text>
                                        </View>
                                    </View>

                                    {/* Details */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                        <MapPin size={13} color="#94A3B8" strokeWidth={2} />
                                        <Text style={{ color: '#64748B', fontSize: 12, marginLeft: 6, flex: 1 }} numberOfLines={1}>{resource.location}</Text>
                                    </View>
                                    {resource.capacity ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                            <Users size={13} color="#94A3B8" strokeWidth={2} />
                                            <Text style={{ color: '#64748B', fontSize: 12, marginLeft: 6 }}>{t('resources.capacity') || 'Capacity'}: {resource.capacity}</Text>
                                        </View>
                                    ) : null}

                                    {/* Footer */}
                                    <View style={{ borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600', flex: 1 }} numberOfLines={1}>{resource.contact}</Text>
                                        <View style={{ flexDirection: 'row' }}>
                                            <TouchableOpacity
                                                onPress={() => setShowDetail(resource)}
                                                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}
                                            >
                                                <Info size={17} color="#2563EB" strokeWidth={2} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => Linking.openURL(`tel:${resource.contact}`)}
                                                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}
                                            >
                                                <Phone size={17} color="#16A34A" strokeWidth={2} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Detail modal */}
            <Modal visible={!!showDetail} animationType="fade" transparent onRequestClose={() => setShowDetail(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 24 }}>
                    {showDetail && (() => {
                        const { Icon, color, bg } = RESOURCE_ICON(showDetail.type || '');
                        const sc = STATUS_CONFIG[showDetail.status] || STATUS_CONFIG.AVAILABLE;
                        return (
                            <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 24 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                                    <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                        <Icon size={26} color={color} strokeWidth={2} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>{showDetail.type}</Text>
                                        <View style={{ backgroundColor: sc.bg, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 4 }}>
                                            <Text style={{ color: sc.text, fontSize: 11, fontWeight: '800' }}>{sc.label}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => setShowDetail(null)} style={{ padding: 6, backgroundColor: '#F1F5F9', borderRadius: 20 }}>
                                        <X size={18} color="#64748B" />
                                    </TouchableOpacity>
                                </View>

                                {[
                                    { label: 'Owner', value: showDetail.owner },
                                    { label: 'Location', value: showDetail.location },
                                    { label: 'Capacity', value: showDetail.capacity },
                                    { label: 'Contact', value: showDetail.contact },
                                ].map(row => row.value ? (
                                    <View key={row.label} style={{ marginBottom: 12 }}>
                                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{row.label}</Text>
                                        <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '600' }}>{row.value}</Text>
                                    </View>
                                ) : null)}

                                <TouchableOpacity
                                    onPress={() => { setShowDetail(null); Linking.openURL(`tel:${showDetail.contact}`); }}
                                    style={{ backgroundColor: '#16A34A', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}
                                >
                                    <Phone size={18} color="white" strokeWidth={2} />
                                    <Text style={{ color: 'white', fontSize: 15, fontWeight: '800', marginLeft: 8 }}>Call {showDetail.owner}</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })()}
                </View>
            </Modal>

            {/* Add resource modal */}
            <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 16 }}>
                                <Text style={{ fontSize: 20, fontWeight: '900', color: '#0F172A' }}>
                                    {t('resources.form_title') || 'Add Resource'}
                                </Text>
                                <TouchableOpacity onPress={() => setShowModal(false)} style={{ padding: 6, backgroundColor: '#F1F5F9', borderRadius: 20 }}>
                                    <X size={20} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                                <Field
                                    label={t('resources.type') || 'Resource Type *'}
                                    value={formData.type}
                                    placeholder={t('resources.type_placeholder') || 'e.g. Boat, Pickup Truck, Generator'}
                                    onChangeText={(v: string) => setFormData(f => ({ ...f, type: v }))}
                                />
                                <Field
                                    label={t('resources.owner') || 'Owner Name *'}
                                    value={formData.owner}
                                    placeholder={t('resources.owner_placeholder') || 'Full name'}
                                    onChangeText={(v: string) => setFormData(f => ({ ...f, owner: v }))}
                                />
                                <Field
                                    label={t('resources.location') || 'Location *'}
                                    value={formData.location}
                                    placeholder={t('resources.location_placeholder') || 'City / area'}
                                    onChangeText={(v: string) => setFormData(f => ({ ...f, location: v }))}
                                />
                                <Field
                                    label={t('resources.capacity') || 'Capacity'}
                                    value={formData.capacity}
                                    placeholder={t('resources.capacity_placeholder') || 'e.g. 6 people, 5 kW'}
                                    onChangeText={(v: string) => setFormData(f => ({ ...f, capacity: v }))}
                                />
                                <Field
                                    label={t('resources.contact') || 'Contact Number *'}
                                    value={formData.contact}
                                    placeholder={t('resources.contact_placeholder') || 'Phone number'}
                                    keyboardType="phone-pad"
                                    onChangeText={(v: string) => setFormData(f => ({ ...f, contact: v }))}
                                />

                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    disabled={isSubmitting}
                                    style={{ backgroundColor: '#2563EB', borderRadius: 16, padding: 16, alignItems: 'center' }}
                                >
                                    {isSubmitting
                                        ? <ActivityIndicator size="small" color="white" />
                                        : <Text style={{ color: 'white', fontSize: 16, fontWeight: '900' }}>{t('resources.submit') || 'Add Resource'}</Text>
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
