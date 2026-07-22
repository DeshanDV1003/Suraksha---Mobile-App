import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, Radio } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface EmergencyCardProps {
    onReportPress: () => void;
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({ onReportPress }) => {
    const { t } = useTranslation();
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={{ marginVertical: 16, borderRadius: 24, overflow: 'hidden', shadowColor: '#DC2626', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 }}>
            <LinearGradient
                colors={['#991B1B', '#DC2626', '#EF4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 22 }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <Animated.View style={{ transform: [{ scale: pulse }] }}>
                        <View style={{ width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                            <Radio size={20} color="white" strokeWidth={2.5} />
                        </View>
                    </Animated.View>
                    <View style={{ marginLeft: 12 }}>
                        <Text style={{ color: 'white', fontSize: 17, fontWeight: '800', letterSpacing: -0.3 }}>
                            {t('home.emergency_actions') || 'Emergency Actions'}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500', marginTop: 1 }}>
                            Available 24/7 · Instant response
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={onReportPress}
                    activeOpacity={0.88}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 16,
                        paddingVertical: 16,
                        paddingHorizontal: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.12,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                >
                    <AlertTriangle size={20} color="#DC2626" strokeWidth={2.5} />
                    <Text style={{ color: '#DC2626', fontSize: 16, fontWeight: '800', marginLeft: 10, letterSpacing: -0.3 }}>
                        {t('common.report_now') || 'Report Incident Now'}
                    </Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
};
