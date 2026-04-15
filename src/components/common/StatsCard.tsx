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
        danger: 'bg-[#F97316]',
        success: 'bg-[#10B981]',
        info: 'bg-[#3B82F6]',
        warning: 'bg-[#F97316]',
        white: 'bg-white',
    };

    const textColors = {
        danger: 'text-white',
        success: 'text-white',
        info: 'text-white',
        warning: 'text-white',
        white: 'text-gray-900',
    };

    const countColors = {
        danger: 'text-white',
        success: 'text-white',
        info: 'text-white',
        warning: 'text-white',
        white: 'text-primary',
    };

    return (
        <TouchableOpacity 
            disabled={!onPress}
            onPress={onPress}
            activeOpacity={0.8}
            className={`rounded-3xl p-4 shadow-sm ${bgColors[variant]} ${className} ${
                size === 'small' ? 'flex-1 mx-1' : 'flex-1 mx-1'
            }`}
        >
            <View className="items-start">
                {Icon && (
                    <Icon 
                        size={28} 
                        color={variant === 'white' ? '#4B5563' : 'white'} 
                        className="mb-4"
                        strokeWidth={1.5}
                    />
                )}
                
                <Text className={`text-4xl font-extrabold ${
                    customCountColor || countColors[variant]
                }`}>{count}</Text>
                
                <Text className={`text-sm font-bold opacity-90 ${textColors[variant]}`}>
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
};
