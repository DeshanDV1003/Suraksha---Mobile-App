import React, { useState } from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity,
    ActivityIndicator, Alert, Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import {
    Home, Package, Briefcase, GitBranch, Zap, Send, Camera, X,
    CheckSquare, Square, CheckCircle2, Plus, ArrowLeft,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOfflineSubmit } from '../hooks/useOfflineSubmit';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

const DAMAGE_TYPES = [
    { id: 'RESIDENTIAL',    labelKey: 'damage.house_full',  icon: Home },
    { id: 'AGRICULTURAL',   labelKey: 'damage.crop',        icon: Package },
    { id: 'COMMERCIAL',     labelKey: 'damage.business',    icon: Briefcase },
    { id: 'INFRASTRUCTURE', labelKey: 'damage.road',        icon: GitBranch },
    { id: 'UTILITY',        labelKey: 'damage.utility',     icon: Zap },
];

const STRUCTURAL_LEVELS = [
    { id: 'NONE',     labelKey: 'damage.structural_none',     fallback: 'None' },
    { id: 'MINOR',    labelKey: 'damage.structural_minor',    fallback: 'Minor' },
    { id: 'MODERATE', labelKey: 'damage.structural_moderate', fallback: 'Moderate' },
    { id: 'MAJOR',    labelKey: 'damage.structural_major',    fallback: 'Major' },
    { id: 'TOTAL',    labelKey: 'damage.structural_total',    fallback: 'Total Loss' },
];

interface SubmittedRecord {
    category: string;
    categoryLabel: string;
    structuralDamage: string;
    structuralLabel: string;
    notes: string;
    location: string;
    photos: string[];
    submittedAt: Date;
    queued: boolean;
}

const INITIAL_TYPE = 'RESIDENTIAL';
const INITIAL_STRUCTURAL = 'MODERATE';

export default function DamageReportScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const toast = useToast();

    const [selectedType, setSelectedType]         = useState(INITIAL_TYPE);
    const [structuralDamage, setStructuralDamage] = useState(INITIAL_STRUCTURAL);
    const [description, setDescription]           = useState('');
    const [hasInsurance, setHasInsurance]         = useState(false);
    const [photos, setPhotos]                     = useState<string[]>([]);
    const [loading, setLoading]                   = useState(false);
    const [submitted, setSubmitted]               = useState<SubmittedRecord | null>(null);

    const { submit } = useOfflineSubmit('DAMAGE_ASSESSMENT', '/assessments/damage');

    const resetForm = () => {
        setSelectedType(INITIAL_TYPE);
        setStructuralDamage(INITIAL_STRUCTURAL);
        setDescription('');
        setHasInsurance(false);
        setPhotos([]);
        setSubmitted(null);
    };

    const pickPhoto = async () => {
        Alert.alert(
            'Add Evidence Photo',
            'Choose a source',
            [
                {
                    text: 'Take Photo',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permission needed', 'Please allow camera access to take photos.');
                            return;
                        }
                        const result = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [4, 3] });
                        if (!result.canceled && result.assets[0]) {
                            setPhotos(prev => [...prev, result.assets[0].uri]);
                        }
                    },
                },
                {
                    text: 'Choose from Library',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permission needed', 'Please allow photo library access.');
                            return;
                        }
                        const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, aspect: [4, 3] });
                        if (!result.canceled && result.assets[0]) {
                            setPhotos(prev => [...prev, result.assets[0].uri]);
                        }
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handleSubmit = async () => {
        if (!description.trim()) {
            toast.error(t('common.error') || 'Error', 'Please provide a description of the damage.');
            return;
        }

        setLoading(true);
        try {
            let userLocation = null;
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                userLocation = await Location.getCurrentPositionAsync({});
            }

            const locationLabel = userLocation ? 'Current Location' : 'Unknown Location';

            const data = {
                category: selectedType,
                notes: description,
                location: locationLabel,
                latitude: userLocation?.coords.latitude ?? 6.9271,
                longitude: userLocation?.coords.longitude ?? 79.8612,
                structuralDamage,
                estimatedLoss: 0,
                mediaUrls: [],
            };

            const result = await submit(data);

            const typeInfo = DAMAGE_TYPES.find(d => d.id === selectedType)!;
            const levelInfo = STRUCTURAL_LEVELS.find(l => l.id === structuralDamage)!;

            setSubmitted({
                category: selectedType,
                categoryLabel: t(typeInfo.labelKey),
                structuralDamage,
                structuralLabel: t(levelInfo.labelKey) || levelInfo.fallback,
                notes: description,
                location: locationLabel,
                photos: [...photos],
                submittedAt: new Date(),
                queued: !!result.queued,
            });

            if (result.queued) {
                toast.warning(
                    t('common.offline_queued') || 'Queued',
                    'You are offline. Your report will be submitted when you reconnect.'
                );
            } else {
                toast.success(t('common.success') || 'Success', 'Damage assessment submitted for review.');
            }
        } catch (error) {
            console.error('Failed to submit damage report:', error);
            toast.error(t('common.error') || 'Error', 'Failed to submit damage assessment.');
        } finally {
            setLoading(false);
        }
    };

    // ── Success / confirmation view ──────────────────────────────────────────
    if (submitted) {
        const typeInfo = DAMAGE_TYPES.find(d => d.id === submitted.category);
        return (
            <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
                <Header title={t('damage.title')} subtitle={t('damage.subtitle')} showBack />

                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Success banner */}
                    <View style={{
                        backgroundColor: submitted.queued ? '#FFFBEB' : '#F0FDF4',
                        borderWidth: 1.5,
                        borderColor: submitted.queued ? '#FCD34D' : '#86EFAC',
                        borderRadius: 24,
                        padding: 24,
                        alignItems: 'center',
                        marginBottom: 24,
                    }}>
                        <CheckCircle2
                            size={52}
                            color={submitted.queued ? '#F59E0B' : '#16A34A'}
                            strokeWidth={2}
                        />
                        <Text style={{
                            color: submitted.queued ? '#92400E' : '#15803D',
                            fontSize: 20,
                            fontWeight: '900',
                            marginTop: 14,
                            marginBottom: 6,
                            textAlign: 'center',
                        }}>
                            {submitted.queued ? 'Saved — Will Sync Later' : 'Report Submitted!'}
                        </Text>
                        <Text style={{
                            color: submitted.queued ? '#B45309' : '#166534',
                            fontSize: 13,
                            fontWeight: '600',
                            textAlign: 'center',
                            lineHeight: 20,
                        }}>
                            {submitted.queued
                                ? 'You are offline. This report is saved on your device and will be sent automatically when you reconnect.'
                                : 'Your damage assessment has been received and is under review by the DMC team.'}
                        </Text>
                        <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 12 }}>
                            {submitted.submittedAt.toLocaleString()}
                        </Text>
                    </View>

                    {/* Submitted details card */}
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 24,
                        padding: 20,
                        marginBottom: 24,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 3,
                    }}>
                        <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                            Submitted Record
                        </Text>

                        <Row label="Damage Type" value={submitted.categoryLabel} />
                        <Row label="Structural Level" value={submitted.structuralLabel} />
                        <Row label="Location" value={submitted.location} />

                        <View style={{ marginTop: 4, marginBottom: 12 }}>
                            <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>Description</Text>
                            <Text style={{ color: '#1E293B', fontSize: 14, fontWeight: '600', lineHeight: 20 }}>
                                {submitted.notes}
                            </Text>
                        </View>

                        {submitted.photos.length > 0 && (
                            <View>
                                <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>
                                    Evidence Photos ({submitted.photos.length})
                                </Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    {submitted.photos.map(uri => (
                                        <Image
                                            key={uri}
                                            source={{ uri }}
                                            style={{ width: 80, height: 80, borderRadius: 12, marginRight: 8, marginBottom: 8 }}
                                            resizeMode="cover"
                                        />
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={{
                            backgroundColor: submitted.queued ? '#FFFBEB' : '#F0FDF4',
                            borderRadius: 12,
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            alignSelf: 'flex-start',
                            marginTop: 4,
                        }}>
                            <Text style={{ color: submitted.queued ? '#B45309' : '#15803D', fontSize: 12, fontWeight: '800' }}>
                                {submitted.queued ? '⏳ Pending Sync' : '✓ Submitted'}
                            </Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <TouchableOpacity
                        onPress={resetForm}
                        activeOpacity={0.85}
                        style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 14 }}
                    >
                        <LinearGradient
                            colors={['#2563EB', '#06B6D4']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={{ paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Plus size={20} color="white" strokeWidth={2.5} />
                            <Text style={{ color: 'white', fontSize: 15, fontWeight: '900', marginLeft: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                Submit Another Report
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Home')}
                        activeOpacity={0.7}
                        style={{
                            borderRadius: 20,
                            borderWidth: 2,
                            borderColor: '#CBD5E1',
                            paddingVertical: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'white',
                        }}
                    >
                        <ArrowLeft size={18} color="#64748B" strokeWidth={2.5} />
                        <Text style={{ color: '#64748B', fontSize: 15, fontWeight: '800', marginLeft: 8 }}>
                            Back to Home
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    // ── Form view ────────────────────────────────────────────────────────────
    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header title={t('damage.title')} subtitle={t('damage.subtitle')} showBack />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Damage type */}
                <Text style={sectionLabel}>{t('damage.type_label')}</Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 }}>
                    {DAMAGE_TYPES.map(type => {
                        const selected = selectedType === type.id;
                        return (
                            <TouchableOpacity
                                key={type.id}
                                onPress={() => setSelectedType(type.id)}
                                activeOpacity={0.8}
                                style={{
                                    width: '48%',
                                    aspectRatio: 1.1,
                                    backgroundColor: selected ? '#EFF6FF' : 'white',
                                    borderWidth: 2,
                                    borderColor: selected ? '#2563EB' : '#E2E8F0',
                                    borderRadius: 20,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 12,
                                    padding: 14,
                                }}
                            >
                                <type.icon size={32} color={selected ? '#2563EB' : '#1E3A8A'} strokeWidth={2} />
                                <Text style={{ color: selected ? '#2563EB' : '#1E3A8A', fontWeight: '700', fontSize: 13, textAlign: 'center', marginTop: 10 }}>
                                    {t(type.labelKey)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Description */}
                <Text style={sectionLabel}>{t('damage.desc_label')}</Text>
                <TextInput
                    multiline
                    numberOfLines={5}
                    placeholder={t('damage.desc_placeholder')}
                    placeholderTextColor="#94A3B8"
                    value={description}
                    onChangeText={setDescription}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                        padding: 18,
                        fontSize: 15,
                        color: '#1E3A8A',
                        fontWeight: '600',
                        textAlignVertical: 'top',
                        minHeight: 120,
                        marginBottom: 24,
                    }}
                />

                {/* Structural damage level */}
                <Text style={sectionLabel}>{t('damage.structural_label') || 'Structural Damage Level'}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
                    {STRUCTURAL_LEVELS.map(level => {
                        const selected = structuralDamage === level.id;
                        return (
                            <TouchableOpacity
                                key={level.id}
                                onPress={() => setStructuralDamage(level.id)}
                                style={{
                                    backgroundColor: selected ? '#2563EB' : 'white',
                                    borderWidth: 2,
                                    borderColor: selected ? '#2563EB' : '#E2E8F0',
                                    borderRadius: 50,
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    marginRight: 8,
                                    marginBottom: 8,
                                }}
                            >
                                <Text style={{ color: selected ? 'white' : '#475569', fontWeight: '700', fontSize: 13 }}>
                                    {t(level.labelKey) || level.fallback}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Photo evidence */}
                <Text style={sectionLabel}>{t('damage.upload_label')}</Text>

                {photos.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                        {photos.map(uri => (
                            <View key={uri} style={{ width: 90, height: 90, borderRadius: 14, overflow: 'hidden', marginRight: 10, marginBottom: 10 }}>
                                <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                <TouchableOpacity
                                    onPress={() => setPhotos(prev => prev.filter(p => p !== uri))}
                                    style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 12, padding: 2 }}
                                >
                                    <X size={14} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity
                    onPress={pickPhoto}
                    activeOpacity={0.8}
                    style={{
                        borderRadius: 20,
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        borderColor: '#CBD5E1',
                        paddingVertical: 28,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#F8FAFC',
                        marginBottom: 24,
                    }}
                >
                    <Camera size={28} color="#94A3B8" strokeWidth={2} />
                    <Text style={{ color: '#64748B', fontSize: 15, fontWeight: '700', marginTop: 8 }}>
                        {t('damage.upload_placeholder')}
                    </Text>
                    {photos.length > 0 && (
                        <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>
                            {photos.length} photo{photos.length !== 1 ? 's' : ''} added — tap to add more
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Insurance */}
                <View style={{
                    backgroundColor: '#FEF9C3',
                    borderWidth: 1,
                    borderColor: '#FDE047',
                    borderRadius: 24,
                    padding: 24,
                    marginBottom: 28,
                }}>
                    <Text style={{ color: '#854D0E', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                        {t('damage.insurance_title')}
                    </Text>
                    <Text style={{ color: '#A16207', fontSize: 13, fontWeight: '600', lineHeight: 20, marginBottom: 18 }}>
                        {t('damage.insurance_text')}
                    </Text>
                    <TouchableOpacity
                        onPress={() => setHasInsurance(!hasInsurance)}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        activeOpacity={0.7}
                    >
                        {hasInsurance
                            ? <CheckSquare size={26} color="#334155" strokeWidth={2.5} />
                            : <Square size={26} color="#94A3B8" strokeWidth={2} />
                        }
                        <Text style={{ color: '#713F12', fontSize: 14, fontWeight: '800', marginLeft: 12 }}>
                            {t('damage.insurance_check')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Submit */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.85}
                    style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 10 }}
                >
                    <LinearGradient
                        colors={['#2563EB', '#06B6D4']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={{ paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Send size={22} color="white" strokeWidth={2.5} />
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: '900', marginLeft: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {t('damage.submit')}
                                </Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const sectionLabel = {
    color: '#1E3A8A',
    fontSize: 13,
    fontWeight: '800' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 12,
};

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
            <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', flex: 1 }}>{label}</Text>
            <Text style={{ color: '#1E293B', fontSize: 13, fontWeight: '700', flex: 2, textAlign: 'right' }}>{value}</Text>
        </View>
    );
}
