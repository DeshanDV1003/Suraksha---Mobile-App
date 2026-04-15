import React from 'react';
import { View, Text } from 'react-native';
import { Heart } from 'lucide-react-native';

interface ContributionStatsCardProps {
    amount: string;
    totalLabel: string;
    helpedMsg: string;
}

export const ContributionStatsCard: React.FC<ContributionStatsCardProps> = ({
    amount,
    totalLabel,
    helpedMsg
}) => {
    return (
        <View 
            style={{ borderRadius: 32 }}
            className="bg-[#F0FDF4] border border-[#DCFCE7] p-8 mb-8"
        >
            <View className="flex-row items-center mb-6">
                <View className="bg-[#10B981] w-14 h-14 rounded-full items-center justify-center">
                    <Heart size={28} color="white" fill="white" />
                </View>
                <View className="ml-5">
                    <Text className="text-[#065F46] text-3xl font-black">
                        {amount}
                    </Text>
                    <Text className="text-[#10B981] text-sm font-bold uppercase tracking-tight">
                        {totalLabel}
                    </Text>
                </View>
            </View>

            <View className="border-t border-[#DCFCE7] mt-2 pt-5">
                <Text className="text-[#047857] text-lg font-extrabold leading-tight">
                    {helpedMsg}
                </Text>
            </View>
        </View>
    );
};
