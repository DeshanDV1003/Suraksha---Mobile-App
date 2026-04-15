import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface DamageTypeCardProps {
    label: string;
    icon: any;
    isSelected: boolean;
    onPress: () => void;
}

export const DamageTypeCard: React.FC<DamageTypeCardProps> = ({
    label,
    icon: Icon,
    isSelected,
    onPress
}) => {
    return (
        <TouchableOpacity 
            onPress={onPress}
            style={{ borderRadius: 24 }}
            className={`w-[48%] aspect-[1.1] p-4 mb-4 items-center justify-center border-2 ${
                isSelected ? 'bg-[#EFF6FF] border-[#2563EB]' : 'bg-white border-gray-100'
            }`}
        >
            <Icon size={32} color={isSelected ? '#2563EB' : '#1E3A8A'} strokeWidth={2} />
            <Text className={`text-center mt-3 text-sm font-bold ${
                isSelected ? 'text-[#2563EB]' : 'text-[#1E3A8A]'
            }`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};
