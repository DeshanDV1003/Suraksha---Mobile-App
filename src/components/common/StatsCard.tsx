import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface StatsCardProps {
    label: string;
    count: string | number;
    variant?: 'danger' | 'success' | 'info' | 'warning' | 'white';
    icon?: LucideIcon;
    onPress?: () => void;
    size?: 'small' | 'large';
    layout?: 'vertical' | 'horizontal';
    className?: string;
    customCountColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
    label, 
    count, 
    variant = 'white',
    icon: Icon,
    onPress,
    size = 'large',
    layout = 'vertical',
    className = '',
    customCountColor
}) => {
    const bgColors = {
        danger: 'bg-[#F43F5E]',
        success: 'bg-[#10B981]',
        info: 'bg-[#3B82F6]',
        warning: 'bg-[#FEF3C7]',
        white: 'bg-white',
    };

    const textColors = {
        danger: 'text-white',
        success: 'text-white',
        info: 'text-white',
        warning: 'text-[#D97706]', // Better contrast for yellow
        white: 'text-gray-900',
    };

    const countColors = {
        danger: 'text-white',
        success: 'text-white',
        info: 'text-white',
        warning: 'text-[#D97706]',
        white: 'text-primary', // Use theme primary blue
    };

    const borderColors = {
        danger: 'border-[#F43F5E]',
        success: 'border-[#10B981]',
        info: 'border-[#3B82F6]',
        warning: 'border-[#EAB308]',
        white: 'border-gray-200',
    };

    return (
        <TouchableOpacity 
            disabled={!onPress}
            onPress={onPress}
            activeOpacity={0.8}
            className={`rounded-2xl p-4 shadow-sm border ${borderColors[variant]} ${bgColors[variant]} ${className} ${
                size === 'small' ? 'flex-1 mx-1' : 'flex-1 mx-2'
            }`}
        >
            <View className={`items-center justify-center ${layout === 'horizontal' ? 'flex-row' : 'flex-col'}`}>
                {Icon && (
                    <Icon 
                        size={24} 
                        color={variant === 'white' || variant === 'warning' ? '#4B5563' : 'white'} 
                        className="mb-1" 
                    />
                )}
                
                {size === 'large' ? (
                    <>
                        <Text className={`text-3xl font-bold ${
                            customCountColor || countColors[variant]
                        }`}>{count}</Text>
                        <Text className={`text-sm font-semibold opacity-90 ${textColors[variant]}`}>{label}</Text>
                    </>
                ) : (
                    <>
                         <Text className={`text-2xl font-bold ${
                             customCountColor || countColors[variant]
                         }`}>{count}</Text>
                         <Text className={`text-xs font-bold ${textColors[variant]}`}>{label}</Text>
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
};
