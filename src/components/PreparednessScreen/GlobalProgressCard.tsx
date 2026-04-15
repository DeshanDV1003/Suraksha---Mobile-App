import React from 'react';
import { View, Text } from 'react-native';

interface GlobalProgressCardProps {
    progress: number;
    label: string;
}

export const GlobalProgressCard: React.FC<GlobalProgressCardProps> = ({ progress, label }) => {
    return (
        <View 
            style={{ borderRadius: 32 }}
            className="bg-[#EFF6FF] border border-[#BFDBFE] p-8 mb-8"
        >
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-[#1E3A8A] text-xl font-bold uppercase tracking-tight">
                    {label}
                </Text>
                <Text className="text-[#2563EB] text-3xl font-black">
                    {progress}%
                </Text>
            </View>

            {/* Global Progress Bar */}
            <View className="bg-white/60 h-4 rounded-full w-full overflow-hidden">
                <View 
                    style={{ width: `${progress}%` }}
                    className="bg-[#2563EB] h-full rounded-full"
                />
            </View>
        </View>
    );
};
