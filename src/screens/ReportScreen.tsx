import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import {
    ScrollView, View, Text, Modal, TouchableOpacity,
    FlatList, TextInput, ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { useOfflineSubmit } from '../hooks/useOfflineSubmit';
import { useToast } from '../context/ToastContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    MapPin, Navigation, ChevronDown, Send, AlertTriangle,
    Users, FileText, CheckCircle2,
} from 'lucide-react-native';

const INCIDENT_TYPES = [
    { id: 'FLOOD',             label: 'Flood',              color: '#2563EB' },
    { id: 'LANDSLIDE',         label: 'Landslide',          color: '#92400E' },
    { id: 'FIRE',              label: 'Fire',               color: '#EF4444' },
    { id: 'BUILDING_COLLAPSE', label: 'Building Collapse',  color: '#7C3AED' },
    { id: 'MEDICAL_EMERGENCY', label: 'Medical Emergency',  color: '#059669' },
    { id: 'OTHER',             label: 'Other',              color: '#64748B' },
];

export default function ReportScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { submit, status } = useOfflineSubmit('INCIDENT_REPORT', '/api/incidents');
    const toast = useToast();

    const [description, setDescription] = useState('');
    const [peopleAffected, setPeopleAffected] = useState('');
    const [incidentType, setIncidentType] = useState<typeof INCIDENT_TYPES[0] | null>(null);
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [locationText, setLocationText] = useState('Detecting location...');
    const [locationCoords, setLocationCoords] = useState({ lat: 6.9271, lng: 79.8612 });
    const loading = status === 'submitting';

    useEffect(() => {
        (async () => {
            try {
                const { status: s } = await Location.requestForegroundPermissionsAsync();
                if (s !== 'granted') { setLocationText('Colombo, Sri Lanka'); return; }
                const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                setLocationCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                const [place] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                if (place) {
                    const parts = [place.street, place.district || place.subregion, place.region].filter(Boolean);
                    setLocationText(parts.join(', ') || 'Current Location');
                } else {
                    setLocationText('Current Location');
                }
            } catch { setLocationText('Colombo, Sri Lanka'); }
        })();
    }, []);

    const handleSubmit = async () => {
        if (!incidentType || !description.trim()) {
            toast.error('Missing Info', 'Please select an incident type and describe what happened.');
            return;
        }
        try {
            const result = await submit({
                title: incidentType.label,
                description,
                location: locationText,
                latitude: locationCoords.lat,
                longitude: locationCoords.lng,
                category: incidentType.id,
                peopleAffected: parseInt(peopleAffected) || 0,
            });
            if (result.queued) {
                toast.warning('Saved Offline', 'Your report will be sent when you reconnect.');
            } else {
                toast.success('Report Submitted', 'Authorities have been notified.');
            }
            navigation.navigate('Home');
        } catch {
            toast.error('Failed', 'Could not submit report. Please try again.');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header title={t('report.title') || 'Report Incident'} subtitle="Report any emergency or disaster" showBack />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Incident Type */}
                <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>
                    Incident Type *
                </Text>
                <TouchableOpacity
                    onPress={() => setShowTypePicker(true)}
                    activeOpacity={0.8}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 16,
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 18,
                        borderWidth: 1.5,
                        borderColor: incidentType ? incidentType.color + '40' : '#E2E8F0',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 2,
                    }}
                >
                    {incidentType ? (
                        <View style={{ width: 36, height: 36, backgroundColor: incidentType.color + '15', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                            <AlertTriangle size={18} color={incidentType.color} strokeWidth={2.5} />
                        </View>
                    ) : (
                        <View style={{ width: 36, height: 36, backgroundColor: '#F1F5F9', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                            <AlertTriangle size={18} color="#94A3B8" strokeWidth={2} />
                        </View>
                    )}
                    <Text style={{ flex: 1, color: incidentType ? '#0F172A' : '#94A3B8', fontSize: 15, fontWeight: incidentType ? '700' : '500' }}>
                        {incidentType?.label || 'Select incident type...'}
                    </Text>
                    <ChevronDown size={18} color="#94A3B8" strokeWidth={2} />
                </TouchableOpacity>

                {/* Location */}
                <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>
                    Location
                </Text>
                <View style={{
                    backgroundColor: '#EFF6FF',
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 18,
                    borderWidth: 1.5,
                    borderColor: '#BFDBFE',
                }}>
                    <View style={{ width: 36, height: 36, backgroundColor: 'white', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <MapPin size={18} color="#2563EB" strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#1E40AF', fontSize: 12, fontWeight: '700', marginBottom: 2 }}>Using GPS Location</Text>
                        <Text style={{ color: '#2563EB', fontSize: 13, fontWeight: '500' }} numberOfLines={1}>{locationText}</Text>
                    </View>
                    <Navigation size={16} color="#2563EB" strokeWidth={2} />
                </View>

                {/* Description */}
                <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>
                    Description *
                </Text>
                <View style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: description ? '#2563EB40' : '#E2E8F0',
                    marginBottom: 18,
                    overflow: 'hidden',
                }}>
                    <TextInput
                        multiline
                        numberOfLines={5}
                        placeholder="Describe what happened, the severity, and any immediate dangers..."
                        placeholderTextColor="#CBD5E1"
                        value={description}
                        onChangeText={setDescription}
                        style={{ padding: 16, color: '#0F172A', fontSize: 14, lineHeight: 22, textAlignVertical: 'top', minHeight: 120 }}
                    />
                </View>

                {/* People affected */}
                <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 }}>
                    Estimated People Affected
                </Text>
                <View style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: '#E2E8F0',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    marginBottom: 28,
                }}>
                    <Users size={18} color="#94A3B8" strokeWidth={2} />
                    <TextInput
                        placeholder="Enter approximate number"
                        placeholderTextColor="#CBD5E1"
                        value={peopleAffected}
                        onChangeText={setPeopleAffected}
                        keyboardType="numeric"
                        style={{ flex: 1, paddingVertical: 15, paddingHorizontal: 12, color: '#0F172A', fontSize: 15 }}
                    />
                </View>

                {/* Submit button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.85}
                    style={{ borderRadius: 18, overflow: 'hidden', marginBottom: 12 }}
                >
                    <LinearGradient
                        colors={['#991B1B', '#DC2626', '#EF4444']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Send size={20} color="white" strokeWidth={2.5} />
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: '800' }}>
                                    {t('common.submit') || 'Submit Report'}
                                </Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <Text style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
                    {t('report.ml_disclaimer') || 'Reports are processed with ML priority classification and routed to the nearest response team.'}
                </Text>
            </ScrollView>

            {/* Type picker modal */}
            <Modal
                visible={showTypePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowTypePicker(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setShowTypePicker(false)}
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
                >
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ color: '#0F172A', fontSize: 18, fontWeight: '800' }}>Select Incident Type</Text>
                            <View style={{ width: 32, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2 }} />
                        </View>
                        {INCIDENT_TYPES.map(type => (
                            <TouchableOpacity
                                key={type.id}
                                onPress={() => { setIncidentType(type); setShowTypePicker(false); }}
                                activeOpacity={0.7}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 14,
                                    borderRadius: 16,
                                    marginBottom: 8,
                                    backgroundColor: incidentType?.id === type.id ? type.color + '12' : '#F8FAFC',
                                    borderWidth: 1.5,
                                    borderColor: incidentType?.id === type.id ? type.color + '50' : '#F1F5F9',
                                }}
                            >
                                <View style={{ width: 38, height: 38, backgroundColor: type.color + '15', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                    <AlertTriangle size={18} color={type.color} strokeWidth={2.5} />
                                </View>
                                <Text style={{ color: incidentType?.id === type.id ? type.color : '#0F172A', fontSize: 15, fontWeight: '700', flex: 1 }}>
                                    {type.label}
                                </Text>
                                {incidentType?.id === type.id && (
                                    <CheckCircle2 size={20} color={type.color} strokeWidth={2.5} />
                                )}
                            </TouchableOpacity>
                        ))}
                        <View style={{ height: 20 }} />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
