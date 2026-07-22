import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Globe, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    onGlobePress?: () => void;
    rightContent?: React.ReactNode;
    variant?: 'default' | 'minimal';
}

export const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    showBack = false,
    onGlobePress,
    rightContent,
    variant = 'default',
}) => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <LinearGradient
                colors={['#0F172A', '#1E3A8A', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: Platform.OS === 'android' ? insets.top + 4 : insets.top }}
            >
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: variant === 'minimal' ? 14 : 18,
                    paddingBottom: variant === 'minimal' ? 14 : 20,
                }}>
                    {showBack && (
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                            style={{
                                width: 38,
                                height: 38,
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                borderRadius: 12,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 14,
                            }}
                        >
                            <ChevronLeft size={22} color="white" strokeWidth={2.5} />
                        </TouchableOpacity>
                    )}

                    <View style={{ flex: 1 }}>
                        {title && (
                            <Text style={{
                                color: 'white',
                                fontSize: variant === 'minimal' ? 18 : 22,
                                fontWeight: '800',
                                letterSpacing: -0.5,
                                lineHeight: variant === 'minimal' ? 22 : 26,
                            }}>
                                {title}
                            </Text>
                        )}
                        {subtitle && (
                            <Text style={{
                                color: 'rgba(255,255,255,0.65)',
                                fontSize: 13,
                                fontWeight: '500',
                                marginTop: 2,
                            }}>
                                {subtitle}
                            </Text>
                        )}
                    </View>

                    {rightContent}

                    {onGlobePress && !rightContent && (
                        <TouchableOpacity
                            onPress={onGlobePress}
                            activeOpacity={0.7}
                            style={{
                                width: 38,
                                height: 38,
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                borderRadius: 12,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Globe size={18} color="white" strokeWidth={2} />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>
        </>
    );
};
