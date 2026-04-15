import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface ActionGridCardProps {
    label: string;
    icon: LucideIcon;
    onPress: () => void;
    bgColor: string;
    iconSize?: number;
}

export const ActionGridCard: React.FC<ActionGridCardProps> = ({ 
    label, 
    icon: Icon, 
    onPress, 
    bgColor,
    iconSize = 40
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={{ backgroundColor: bgColor }}
            className="flex-1 rounded-[28px] p-6 m-2 shadow-sm min-h-[130px] justify-between"
        >
            <View className="items-start justify-start">
                <Icon size={iconSize} color="white" strokeWidth={1.5} />
            </View>
            <View className="items-end justify-end">
                <Text className="text-white text-lg font-extrabold text-right">
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
};
