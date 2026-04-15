import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { 
    Baby, 
    UserCircle, 
    Accessibility, 
    Waves, 
    Dog, 
    Stethoscope,
    CircleDashed,
    Users
} from 'lucide-react-native';

interface Need {
    id: string;
    label: string;
    icon: any;
}

interface NeedsSelectionProps {
    label: string;
}

export const NeedsSelection: React.FC<NeedsSelectionProps> = ({ label }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const needs: Need[] = [
        { id: 'children', label: 'Children', icon: Users },
        { id: 'elderly', label: 'Elderly', icon: UserCircle },
        { id: 'disabled', label: 'Disabled', icon: Accessibility },
        { id: 'pregnant', label: 'Pregnant', icon: CircleDashed },
        { id: 'animals', label: 'Animals', icon: Dog },
        { id: 'medical', label: 'Medical', icon: Stethoscope },
    ];

    const toggleNeed = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    return (
        <View className="mb-8">
            <Text className="text-xl font-bold text-[#1E3A8A] mb-4">{label}</Text>
            
            <View className="flex-row flex-wrap justify-between">
                {needs.map((need) => {
                    const isSelected = selectedIds.includes(need.id);
                    const Icon = need.icon;
                    
                    return (
                        <TouchableOpacity
                            key={need.id}
                            onPress={() => toggleNeed(need.id)}
                            activeOpacity={0.7}
                            className={`flex-row items-center w-[48%] mb-3 p-4 rounded-[16px] border ${
                                isSelected ? 'bg-[#2563EB] border-[#2563EB]' : 'bg-white border-gray-200'
                            } h-16`}
                        >
                            <Icon 
                                size={22} 
                                color={isSelected ? 'white' : '#64748B'} 
                                strokeWidth={2}
                            />
                            <Text className={`ml-3 text-lg font-bold ${
                                isSelected ? 'text-white' : 'text-[#64748B]'
                            }`}>
                                {need.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};
