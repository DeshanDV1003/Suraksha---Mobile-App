import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Mic } from 'lucide-react-native';

interface VoiceReportProps {
    label: string;
    actionLabel: string;
    subtitle: string;
    onPress?: () => void;
}

export const VoiceReport: React.FC<VoiceReportProps> = ({ 
    label, 
    actionLabel, 
    subtitle,
    onPress 
}) => {
    return (
        <View className="mb-8">
            <Text className="text-xl font-bold text-[#1E3A8A] mb-4">{label}</Text>
            
            <TouchableOpacity 
                onPress={onPress}
                activeOpacity={0.7}
                className="bg-[#EFF6FF] border-2 border-dashed border-[#BFDBFE] rounded-[24px] p-8 flex-row items-center"
            >
                <View className="w-14 h-14 rounded-full bg-white items-center justify-center shadow-sm mr-5">
                    <Mic size={32} color="#2563EB" strokeWidth={2} />
                </View>
                
                <View>
                    <Text className="text-[#1E40AF] text-xl font-bold mb-1">{actionLabel}</Text>
                    <Text className="text-[#2563EB] text-base font-semibold">{subtitle}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};
