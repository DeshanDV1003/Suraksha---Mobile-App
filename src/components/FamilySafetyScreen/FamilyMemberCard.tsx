import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';

interface FamilyMemberCardProps {
    name: string;
    lastUpdate: string;
    status: 'safe' | 'none';
    safeLabel: string;
    noneLabel: string;
}

export const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
    name,
    lastUpdate,
    status,
    safeLabel,
    noneLabel
}) => {
    const isSafe = status === 'safe';

    return (
        <View 
            style={{ borderRadius: 32 }}
            className="bg-white border border-gray-100 p-6 mb-4 flex-row items-center justify-between shadow-sm"
        >
            <View className="flex-row items-center">
                <View className={`w-14 h-14 rounded-full items-center justify-center ${
                    isSafe ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                    {isSafe ? (
                        <CheckCircle2 size={32} color="#10B981" strokeWidth={2.5} />
                    ) : (
                        <Circle size={32} color="#94A3B8" strokeWidth={2.5} />
                    )}
                </View>

                <View className="ml-5">
                    <Text className="text-[#1E3A8A] text-xl font-extrabold mb-1">
                        {name}
                    </Text>
                    <Text className="text-gray-400 text-sm font-semibold">
                        {lastUpdate}
                    </Text>
                </View>
            </View>

            <View className={`px-4 py-2 rounded-full ${
                isSafe ? 'bg-green-50' : 'bg-gray-50'
            }`}>
                <Text className={`text-sm font-extrabold ${
                    isSafe ? 'text-green-600' : 'text-gray-500'
                }`}>
                    {isSafe ? safeLabel : noneLabel}
                </Text>
            </View>
        </View>
    );
};
