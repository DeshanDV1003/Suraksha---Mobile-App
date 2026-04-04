import React from 'react';
import { View, Text } from 'react-native';
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
            colors={['#FF512F', '#DD2476']} // Bright red-orange gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-3xl p-6 shadow-lg my-4"
        >
            <View className="flex-row items-center mb-6">
                <Zap size={24} color="white" strokeWidth={2.5} />
                <Text className="text-white text-2xl font-bold ml-2">
                    {t('home.emergency_actions')}
                </Text>
            </View>

            <CustomButton
                label={t('common.report_now')}
                onPress={onReportPress}
                variant="white"
                icon={AlertTriangle}
                className="shadow-md"
            />
        </LinearGradient>
    );
};
