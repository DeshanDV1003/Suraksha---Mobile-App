import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { DamageTypeCard } from '../components/DamageReportScreen/DamageTypeCard';
import { DamageEvidenceBox } from '../components/DamageReportScreen/DamageEvidenceBox';
import { InsuranceInfoBox } from '../components/DamageReportScreen/InsuranceInfoBox';
import { 
    Home, 
    Package, 
    Briefcase, 
    GitBranch, 
    Zap, 
    Send 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOfflineSubmit } from '../hooks/useOfflineSubmit';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import * as Location from 'expo-location';

export default function DamageReportScreen() {
    const { t } = useTranslation();
    const [selectedType, setSelectedType] = useState('RESIDENTIAL');
    const [structuralDamage, setStructuralDamage] = useState('MODERATE');
    const [description, setDescription] = useState('');
    const [hasInsurance, setHasInsurance] = useState(false);
    const [loading, setLoading] = useState(false);

    const structuralLevels = [
        { id: 'NONE', label: t('damage.structural_none') || 'None' },
        { id: 'MINOR', label: t('damage.structural_minor') || 'Minor' },
        { id: 'MODERATE', label: t('damage.structural_moderate') || 'Moderate' },
        { id: 'MAJOR', label: t('damage.structural_major') || 'Major' },
        { id: 'TOTAL', label: t('damage.structural_total') || 'Total Loss' },
    ];
    const navigation = useNavigation<any>();

    const damageTypes = [
        { id: 'RESIDENTIAL', label: t('damage.house_full'), icon: Home },
        { id: 'AGRICULTURAL', label: t('damage.crop'), icon: Package },
        { id: 'COMMERCIAL', label: t('damage.business'), icon: Briefcase },
        { id: 'INFRASTRUCTURE', label: t('damage.road'), icon: GitBranch },
        { id: 'UTILITY', label: t('damage.utility'), icon: Zap },
    ];

    const { submit } = useOfflineSubmit('DAMAGE_ASSESSMENT', '/api/assessments/damage');
    const toast = useToast();

    const handleSubmit = async () => {
        if (!description) {
            toast.error(t('common.error') || "Error", "Please provide a description of the damage.");
            return;
        }

        setLoading(true);
        try {
            let userLocation = null;
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                userLocation = await Location.getCurrentPositionAsync({});
            }

            const data = {
                category: selectedType,
                notes: description,
                location: userLocation ? "Current Location" : "Unknown Location",
                latitude: userLocation?.coords.latitude || 6.9271,
                longitude: userLocation?.coords.longitude || 79.8612,
                structuralDamage: structuralDamage,
                estimatedLoss: 0,
            };

            const result = await submit(data);
            
            if (result.queued) {
                toast.warning(
                    t('common.offline_queued') || "Queued", 
                    "You are offline. Your damage assessment will be submitted when you reconnect."
                );
                navigation.navigate('Home');
            } else {
                toast.success(
                    t('common.success') || "Success", 
                    "Your damage assessment has been submitted for review."
                );
                navigation.navigate('Home');
            }
        } catch (error) {
            console.error('Failed to submit damage report:', error);
            toast.error(t('common.error') || "Error", "Failed to submit damage assessment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header 
                title={t('damage.title')} 
                subtitle={t('damage.subtitle')} 
                showBack 
            />

            <ScrollView 
                className="flex-1 px-6 pt-6" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <Text className="text-[#1E3A8A] text-xl font-extrabold mb-6 uppercase tracking-tighter">
                    {t('damage.type_label')}
                </Text>

                <View className="flex-row flex-wrap justify-between mb-8">
                    {damageTypes.map((type) => (
                        <DamageTypeCard 
                            key={type.id}
                            label={type.label}
                            icon={type.icon}
                            isSelected={selectedType === type.id}
                            onPress={() => setSelectedType(type.id)}
                        />
                    ))}
                </View>

                <Text className="text-[#1E3A8A] text-xl font-extrabold mb-4 uppercase tracking-tighter">
                    {t('damage.desc_label')}
                </Text>
                
                <TextInput 
                    multiline
                    numberOfLines={5}
                    placeholder={t('damage.desc_placeholder')}
                    placeholderTextColor="#94A3B8"
                    value={description}
                    onChangeText={setDescription}
                    style={{ textAlignVertical: 'top', borderRadius: 24 }}
                    className="bg-[#F8FAFC] border border-gray-100 p-6 text-[#1E3A8A] text-lg font-bold mb-10"
                />

                <Text className="text-[#1E3A8A] text-xl font-extrabold mb-4 uppercase tracking-tighter">
                    {t('damage.structural_label') || 'Structural Damage Level'}
                </Text>

                <View className="flex-row flex-wrap mb-8">
                    {structuralLevels.map((level) => (
                        <TouchableOpacity
                            key={level.id}
                            onPress={() => setStructuralDamage(level.id)}
                            className={`mr-2 mb-2 px-4 py-2 rounded-full border-2 ${
                                structuralDamage === level.id
                                    ? 'bg-[#2563EB] border-[#2563EB]'
                                    : 'bg-white border-gray-200'
                            }`}
                        >
                            <Text className={`font-bold text-sm ${
                                structuralDamage === level.id ? 'text-white' : 'text-gray-600'
                            }`}>
                                {level.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text className="text-[#1E3A8A] text-xl font-extrabold mb-6 uppercase tracking-tighter">
                    {t('damage.upload_label')}
                </Text>

                <DamageEvidenceBox 
                    label={t('damage.upload_placeholder')} 
                    onPress={() => {}} 
                />

                <InsuranceInfoBox 
                    title={t('damage.insurance_title')}
                    text={t('damage.insurance_text')}
                    checkLabel={t('damage.insurance_check')}
                    isChecked={hasInsurance}
                    onToggle={() => setHasInsurance(!hasInsurance)}
                />

                <TouchableOpacity 
                    onPress={handleSubmit}
                    disabled={loading}
                    className="mb-10 overflow-hidden"
                    style={{ borderRadius: 24 }}
                >
                    <LinearGradient
                        colors={['#2563EB', '#06B6D4']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        className="py-6 flex-row items-center justify-center"
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Send size={24} color="white" strokeWidth={2.5} />
                                <Text className="text-white text-xl font-black ml-4 uppercase">
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
