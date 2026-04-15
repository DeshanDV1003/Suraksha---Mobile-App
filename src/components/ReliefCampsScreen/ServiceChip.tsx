import React from 'react';
import { View, Text } from 'react-native';
import { 
    Package, 
    Droplets, 
    Heart, 
    Zap, 
    User, 
    Baby 
} from 'lucide-react-native';

const serviceIcons: Record<string, any> = {
    food: Package,
    water: Droplets,
    medical: Heart,
    charging: Zap,
    toilets: User,
    'child-care': Baby
};

interface ServiceChipProps {
    type: 'food' | 'water' | 'medical' | 'charging' | 'toilets' | 'child-care';
    label: string;
}

export const ServiceChip: React.FC<ServiceChipProps> = ({ type, label }) => {
    const Icon = serviceIcons[type] || Package;
    
    return (
        <View className="flex-row items-center bg-[#EFF6FF] px-3 py-1.5 rounded-lg mr-2 mb-2">
            <Icon size={16} color="#2563EB" strokeWidth={2.5} />
            <Text className="text-[#2563EB] text-xs font-bold ml-1.5 uppercase">
                {label}
            </Text>
        </View>
    );
};
