import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
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

export default function DamageReportScreen() {
    const { t } = useTranslation();
    const [selectedType, setSelectedType] = useState('business');
    const [description, setDescription] = useState('');
    const [hasInsurance, setHasInsurance] = useState(false);

    const damageTypes = [
        { id: 'house_full', label: t('damage.house_full'), icon: Home },
        { id: 'house_partial', label: t('damage.house_partial'), icon: Home },
        { id: 'crop', label: t('damage.crop'), icon: Package },
        { id: 'business', label: t('damage.business'), icon: Briefcase },
        { id: 'road', label: t('damage.road'), icon: GitBranch },
        { id: 'utility', label: t('damage.utility'), icon: Zap },
    ];

    return (
        <View className="flex-1 bg-white">
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
                    onPress={() => {}}
                    className="mb-10 overflow-hidden"
                    style={{ borderRadius: 24 }}
                >
                    <LinearGradient
                        colors={['#2563EB', '#06B6D4']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        className="py-6 flex-row items-center justify-center"
                    >
                        <Send size={24} color="white" strokeWidth={2.5} />
                        <Text className="text-white text-xl font-black ml-4 uppercase">
                            {t('damage.submit')}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
