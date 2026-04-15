import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, AlertTriangle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { CustomButton } from '../common/CustomButton';

interface EmergencyCardProps {
    onReportPress: () => void;
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({ onReportPress }) => {
    const { t } = useTranslation();

    return (
        <LinearGradient
            colors={['#F97316', '#FF4D17']} // Vibrant Orange to Red-Orange
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 32 }}
            className="p-8 shadow-2xl my-6"
        >
            <View className="flex-row items-center mb-10">
                <Zap size={30} color="white" strokeWidth={3} />
                <Text className="text-white text-3xl font-black ml-4 tracking-tight">
                    {t('home.emergency_actions') || "Emergency Actions"}
                </Text>
            </View>

            <TouchableOpacity 
                onPress={onReportPress}
                activeOpacity={0.9}
                style={{ borderRadius: 28 }}
                className="bg-white py-6 px-8 flex-row items-center justify-center shadow-lg"
            >
                <AlertTriangle size={26} color="#EF4444" strokeWidth={3} />
                <Text className="text-[#EF4444] text-2xl font-black ml-4 tracking-tight">
                    {t('common.report_now') || "Report Incident Now"}
                </Text>
            </TouchableOpacity>
        </LinearGradient>
    );
};
