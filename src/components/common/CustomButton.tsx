import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';

interface CustomButtonProps {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'danger' | 'outline' | 'white' | 'success' | 'warning' | 'info';
    icon?: LucideIcon;
    className?: string;
    iconColor?: string;
    textClassName?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    label,
    onPress,
    variant = 'primary',
    icon: Icon,
    className = '',
    iconColor,
    textClassName
}) => {
    const isGradient = variant === 'primary' || variant === 'danger';
    const isOutline = variant === 'outline';

    const gradientColors = (variant === 'primary'
        ? ['#2563EB', '#0891B2']
        : ['#FF5F6D', '#FFC371']) as [string, string, ...string[]];

    const buttonContent = (
        <View
            className={`py-3 px-6 flex-row items-center justify-center ${isOutline ? 'border-2 border-[#EF4444] bg-white' :
                variant === 'white' ? 'bg-white' :
                    variant === 'success' ? 'bg-[#D1FAE5]' :
                        variant === 'warning' ? 'bg-[#FEF3C7]' :
                            variant === 'info' ? 'bg-[#DBEAFE]' :
                                ''
                }`}
        >
            {Icon && (
                <View className="mr-2">
                    <Icon
                        size={20}
                        color={
                            iconColor || (
                                isOutline ? '#EF4444' :
                                    variant === 'white' ? '#EF4444' :
                                        variant === 'success' ? '#059669' :
                                            variant === 'warning' ? '#D97706' :
                                                variant === 'info' ? '#2563EB' :
                                                    'white'
                            )
                        }
                    />
                </View>
            )}
            <Text className={`${textClassName || `text-lg font-bold ${isOutline ? 'text-[#EF4444]' :
                variant === 'white' ? 'text-[#EF4444]' :
                    variant === 'success' ? 'text-[#059669]' :
                        variant === 'warning' ? 'text-[#D97706]' :
                            variant === 'info' ? 'text-[#2563EB]' :
                                'text-white'
                }`}`}>
                {label}
            </Text>
        </View>
    );

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className={`rounded-2xl overflow-hidden ${className}`}
        >
            {isGradient ? (
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    {buttonContent}
                </LinearGradient>
            ) : (
                buttonContent
            )}
        </TouchableOpacity>
    );
};
