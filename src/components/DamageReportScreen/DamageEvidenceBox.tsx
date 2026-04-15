import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Camera } from 'lucide-react-native';

interface DamageEvidenceBoxProps {
    label: string;
    onPress: () => void;
}

export const DamageEvidenceBox: React.FC<DamageEvidenceBoxProps> = ({ label, onPress }) => {
    return (
        <TouchableOpacity 
            onPress={onPress}
            style={{ 
                borderRadius: 24, 
                borderStyle: 'dashed', 
                borderWidth: 2, 
                borderColor: '#CBD5E1' 
            }}
            className="w-full py-10 items-center justify-center bg-gray-50/50 mb-8"
        >
            <View className="flex-row items-center">
                <Camera size={28} color="#94A3B8" strokeWidth={2} />
                <Text className="text-[#64748B] text-lg font-bold ml-4">
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
};
