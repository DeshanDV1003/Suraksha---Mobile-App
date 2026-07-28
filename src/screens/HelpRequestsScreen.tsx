import React, { useState, useCallback, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    Modal, ActivityIndicator, Platform, KeyboardAvoidingView,
} from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HandHelping, Plus, X, MapPin, Users, Clock, ShieldCheck, Navigation } from 'lucide-react-native';
import { helpRequestService } from '../services/api';
import { useUserLocation, useUserDistrict, matchesDistrict } from '../context/LocationContext';
import { isWithinRadius } from '../utils/distance';
import { useOfflineSubmit } from '../hooks/useOfflineSubmit';
import { useToast } from '../context/ToastContext';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '../components/common/Header';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
    CRITICAL: { bg: '#EF4444', text: 'white' },
    HIGH:     { bg: '#F97316', text: 'white' },
    MEDIUM:   { bg: '#2563EB', text: 'white' },
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
    PENDING:     { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
    ASSIGNED:    { bg: '#DBEAFE', text: '#1E40AF', label: 'Assigned' },
    IN_PROGRESS: { bg: '#EDE9FE', text: '#5B21B6', label: 'In Progress' },
    EN_ROUTE:    { bg: '#E0F2FE', text: '#075985', label: 'En Route' },
    ON_SITE:     { bg: '#D1FAE5', text: '#065F46', label: 'On Site' },
    RESOLVED:    { bg: '#F0FDF4', text: '#166534', label: 'Resolved' },
};

const FILTER_TABS = ['My Requests', 'Nearby'];

const TYPE_OPTIONS = ['Rescue', 'Medical', 'Food/Water', 'Shelter', 'Supplies'];
const PRIORITY_OPTIONS = ['MEDIUM', 'HIGH', 'CRITICAL'];

// Default centre: Sri Lanka
const SL_DEFAULT = { latitude: 7.8731, longitude: 80.7718, latitudeDelta: 3.5, longitudeDelta: 3.5 };

async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
        const res = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (res && res.length > 0) {
            const p = res[0];
            const parts = [p.name, p.street, p.district, p.city, p.region].filter(Boolean);
            return parts.slice(0, 3).join(', ');
        }
    } catch { /* ignore */ }
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export default function HelpRequestsScreen() {
    const { t } = useTranslation();
    const toast = useToast();
    const userLocation = useUserLocation();
    const userDistrict = useUserDistrict();
    const mapRef = useRef<MapView>(null);

    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('My Requests');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [locating, setLocating] = useState(false);

    const [formData, setFormData] = useState({
        type: 'Rescue',
        description: '',
        location: '',
        peopleCount: '1',
        priority: 'MEDIUM',
    });
    const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(null);
    const [region, setRegion] = useState(SL_DEFAULT);

    const { submit } = useOfflineSubmit('HELP_REQUEST', '/help-requests');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [res, stored] = await Promise.all([
                helpRequestService.getRequests(),
                AsyncStorage.getItem('user'),
            ]);
            setRequests(res.data || []);
            if (stored) setCurrentUserId(JSON.parse(stored)?.id || null);
        } catch { /* silently fail */ }
        finally { setLoading(false); }
    };

    useFocusEffect(useCallback(() => { fetchData(); }, []));

    const displayed = requests.filter(r => {
        if (activeTab === 'My Requests') {
            return currentUserId ? r.userId === currentUserId : false;
        }
        // Nearby tab — within 50 km or district match, exclude resolved
        const locationMatch = (() => {
            if (userLocation && r.latitude && r.longitude) {
                return isWithinRadius(r.latitude, r.longitude, userLocation.lat, userLocation.lng, 50);
            }
            return matchesDistrict(r.location, userDistrict);
        })();
        return locationMatch && r.status !== 'RESOLVED';
    });

    // Fetch current GPS location and reverse-geocode it
    const goToCurrentLocation = async () => {
        setLocating(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                toast.error('Permission denied', 'Location permission is required.');
                return;
            }
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const { latitude, longitude } = pos.coords;
            const address = await reverseGeocode(latitude, longitude);
            const newRegion = { latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 };
            setPin({ latitude, longitude });
            setRegion(newRegion);
            setFormData(f => ({ ...f, location: address }));
            mapRef.current?.animateToRegion(newRegion, 600);
        } catch {
            toast.error('Error', 'Could not get your location.');
        } finally {
            setLocating(false);
        }
    };

    // Called when modal opens: auto-load current location
    const openModal = async () => {
        setShowModal(true);
        // If user location already known from context, use it immediately
        if (userLocation) {
            const { lat: latitude, lng: longitude } = userLocation;
            const address = await reverseGeocode(latitude, longitude);
            const newRegion = { latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 };
            setPin({ latitude, longitude });
            setRegion(newRegion);
            setFormData(f => ({ ...f, location: address }));
        } else {
            // Otherwise fetch fresh
            goToCurrentLocation();
        }
    };

    const handleMapPress = async (e: MapPressEvent) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setPin({ latitude, longitude });
        const address = await reverseGeocode(latitude, longitude);
        setFormData(f => ({ ...f, location: address }));
    };

    const handleSubmit = async () => {
        if (!formData.description.trim() || !formData.location.trim()) {
            toast.error(t('common.error') || 'Error', t('common.fill_required') || 'Please fill all required fields');
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                peopleCount: parseInt(formData.peopleCount) || 1,
                latitude: pin?.latitude ?? null,
                longitude: pin?.longitude ?? null,
            };
            const result = await submit(payload);
            if (result.queued) {
                toast.warning('Queued', 'You are offline. Your request will be submitted when you reconnect.');
            } else {
                toast.success(t('common.success') || 'Success', 'Help request submitted successfully');
            }
            resetAndClose();
            fetchData();
        } catch {
            toast.error(t('common.error') || 'Error', 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetAndClose = () => {
        setShowModal(false);
        setFormData({ type: 'Rescue', description: '', location: '', peopleCount: '1', priority: 'MEDIUM' });
        setPin(null);
        setRegion(SL_DEFAULT);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header
                title={t('help_requests.title') || 'Help Requests'}
                subtitle={t('help_requests.subtitle') || 'Find and submit help requests near you'}
                showBack
                rightContent={
                    <TouchableOpacity
                        onPress={openModal}
                        style={{ width: 40, height: 40, backgroundColor: '#2563EB', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Plus size={22} color="white" strokeWidth={2.5} />
                    </TouchableOpacity>
                }
            />

            {/* Filter tabs */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                {FILTER_TABS.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={{
                            paddingHorizontal: 20,
                            paddingVertical: 8,
                            borderRadius: 20,
                            marginRight: 8,
                            backgroundColor: activeTab === tab ? '#2563EB' : '#F1F5F9',
                        }}
                    >
                        <Text style={{ color: activeTab === tab ? 'white' : '#64748B', fontSize: 13, fontWeight: '700' }}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={{ paddingVertical: 80, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#2563EB" />
                        <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, marginTop: 16 }}>
                            {t('help_requests.scanning') || 'Scanning...'}
                        </Text>
                    </View>
                ) : displayed.length === 0 ? (
                    <View style={{ backgroundColor: 'white', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#E2E8F0', borderRadius: 20, padding: 40, alignItems: 'center' }}>
                        <HandHelping size={52} color="#E2E8F0" />
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#475569', marginTop: 14, marginBottom: 6 }}>
                            {activeTab === 'My Requests' ? 'No Requests Yet' : 'No Requests Near You'}
                        </Text>
                        <Text style={{ color: '#94A3B8', textAlign: 'center', fontSize: 13, lineHeight: 20 }}>
                            {activeTab === 'My Requests'
                                ? "You haven't submitted any help requests yet.\nTap + to request assistance."
                                : 'No active help requests in your area right now.'}
                        </Text>
                    </View>
                ) : (
                    displayed.map((request) => {
                        const pColor = PRIORITY_COLORS[request.priority] || PRIORITY_COLORS.MEDIUM;
                        const verified = request.verifierActions?.length > 0;
                        return (
                            <View key={request.id} style={{ backgroundColor: 'white', borderRadius: 20, marginBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
                                <View style={{ backgroundColor: pColor.bg, paddingHorizontal: 16, paddingVertical: 6, alignSelf: 'flex-start', borderBottomRightRadius: 14 }}>
                                    <Text style={{ color: pColor.text, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 }}>{request.priority}</Text>
                                </View>
                                <View style={{ padding: 16 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                            <HandHelping size={22} color="#2563EB" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>{t('help_requests.category') || 'Category'}</Text>
                                            <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>{request.type}</Text>
                                        </View>
                                    </View>
                                    {/* Status badge */}
                                    {(() => {
                                        const sc = STATUS_CONFIG[request.status] || STATUS_CONFIG.PENDING;
                                        return (
                                            <View style={{ backgroundColor: sc.bg, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 10 }}>
                                                <Text style={{ color: sc.text, fontSize: 11, fontWeight: '800' }}>{sc.label}</Text>
                                            </View>
                                        );
                                    })()}

                                    <Text style={{ color: '#64748B', fontSize: 13, lineHeight: 20, marginBottom: 12 }} numberOfLines={3}>{request.description}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                        <MapPin size={14} color="#94A3B8" strokeWidth={2} />
                                        <Text style={{ color: '#475569', fontSize: 12, fontWeight: '600', marginLeft: 6, flex: 1 }} numberOfLines={1}>{request.location}</Text>
                                        <Users size={14} color="#94A3B8" strokeWidth={2} style={{ marginLeft: 12 }} />
                                        <Text style={{ color: '#475569', fontSize: 12, fontWeight: '600', marginLeft: 6 }}>{request.peopleCount} {t('common.people') || 'people'}</Text>
                                    </View>
                                    <View style={{ borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Clock size={13} color="#94A3B8" strokeWidth={2} />
                                            <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', marginLeft: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{dayjs(request.createdAt).fromNow()}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: verified ? '#F0FDF4' : '#FFF7ED', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                                            {verified
                                                ? <ShieldCheck size={13} color="#059669" strokeWidth={2} />
                                                : <Clock size={13} color="#D97706" strokeWidth={2} />}
                                            <Text style={{ color: verified ? '#059669' : '#D97706', fontSize: 10, fontWeight: '900', marginLeft: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                {verified ? t('help_requests.verified') || 'Verified' : t('help_requests.pending') || 'Pending'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* New Help Request Modal */}
            <Modal visible={showModal} animationType="slide" transparent onRequestClose={resetAndClose}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '93%' }}>

                            {/* Header */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 16 }}>
                                <Text style={{ fontSize: 20, fontWeight: '900', color: '#0F172A' }}>
                                    {t('help_requests.form_title') || 'Request Help'}
                                </Text>
                                <TouchableOpacity onPress={resetAndClose} style={{ padding: 6, backgroundColor: '#F1F5F9', borderRadius: 20 }}>
                                    <X size={20} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                                {/* Type */}
                                <Text style={{ fontSize: 11, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                    {t('help_requests.category') || 'Type of Help'}
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                                    {TYPE_OPTIONS.map((opt) => (
                                        <TouchableOpacity
                                            key={opt}
                                            onPress={() => setFormData(f => ({ ...f, type: opt }))}
                                            style={{ backgroundColor: formData.type === opt ? '#2563EB' : '#F1F5F9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8 }}
                                        >
                                            <Text style={{ color: formData.type === opt ? 'white' : '#475569', fontSize: 13, fontWeight: '700' }}>{opt}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Priority */}
                                <Text style={{ fontSize: 11, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                    {t('help_requests.priority') || 'Priority'}
                                </Text>
                                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                                    {PRIORITY_OPTIONS.map((opt, i) => {
                                        const active = formData.priority === opt;
                                        const c = PRIORITY_COLORS[opt];
                                        return (
                                            <TouchableOpacity
                                                key={opt}
                                                onPress={() => setFormData(f => ({ ...f, priority: opt }))}
                                                style={{ flex: 1, marginRight: i < PRIORITY_OPTIONS.length - 1 ? 8 : 0, backgroundColor: active ? c.bg : '#F1F5F9', paddingVertical: 10, borderRadius: 12, alignItems: 'center' }}
                                            >
                                                <Text style={{ color: active ? c.text : '#64748B', fontSize: 12, fontWeight: '800' }}>{opt}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* Location map picker */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>
                                        {t('help_requests.location_details') || 'Location'} *
                                    </Text>
                                    <TouchableOpacity
                                        onPress={goToCurrentLocation}
                                        disabled={locating}
                                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}
                                    >
                                        {locating
                                            ? <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 4 }} />
                                            : <Navigation size={13} color="#2563EB" strokeWidth={2.5} style={{ marginRight: 4 }} />
                                        }
                                        <Text style={{ color: '#2563EB', fontSize: 12, fontWeight: '700' }}>
                                            {locating ? 'Locating…' : 'Use My Location'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Map */}
                                <View style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 10, height: 180, borderWidth: 1.5, borderColor: '#E2E8F0' }}>
                                    <MapView
                                        ref={mapRef}
                                        style={{ flex: 1 }}
                                        initialRegion={region}
                                        region={region}
                                        onPress={handleMapPress}
                                        showsUserLocation
                                        showsMyLocationButton={false}
                                    >
                                        {pin && (
                                            <Marker coordinate={pin} pinColor="#EF4444" />
                                        )}
                                    </MapView>

                                    {/* Tap-to-select hint */}
                                    {!pin && (
                                        <View style={{ position: 'absolute', bottom: 8, left: 0, right: 0, alignItems: 'center', pointerEvents: 'none' }}>
                                            <View style={{ backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
                                                <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>Tap map to set location</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {/* Address text (editable) */}
                                <TextInput
                                    value={formData.location}
                                    onChangeText={text => setFormData(f => ({ ...f, location: text }))}
                                    placeholder="Address or landmark"
                                    placeholderTextColor="#94A3B8"
                                    style={{ backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 14, color: '#0F172A', marginBottom: 16 }}
                                />

                                {/* People count */}
                                <Text style={{ fontSize: 11, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                    {t('help_requests.affected_persons') || 'Number of People'}
                                </Text>
                                <TextInput
                                    value={formData.peopleCount}
                                    onChangeText={text => setFormData(f => ({ ...f, peopleCount: text }))}
                                    placeholder="1"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="numeric"
                                    style={{ backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0F172A', marginBottom: 16 }}
                                />

                                {/* Description */}
                                <Text style={{ fontSize: 11, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                    {t('help_requests.description') || 'Description'} *
                                </Text>
                                <TextInput
                                    value={formData.description}
                                    onChangeText={text => setFormData(f => ({ ...f, description: text }))}
                                    placeholder={t('help_requests.desc_placeholder') || 'What kind of help is needed?'}
                                    placeholderTextColor="#94A3B8"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    style={{ backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0F172A', height: 100, marginBottom: 24 }}
                                />

                                {/* Submit */}
                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    disabled={isSubmitting}
                                    style={{ backgroundColor: '#2563EB', borderRadius: 16, padding: 16, alignItems: 'center' }}
                                >
                                    {isSubmitting
                                        ? <ActivityIndicator size="small" color="white" />
                                        : <Text style={{ color: 'white', fontSize: 16, fontWeight: '900' }}>{t('help_requests.submit') || 'Submit Request'}</Text>
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
