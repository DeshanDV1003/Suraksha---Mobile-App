import React from 'react';
import { View, Text } from 'react-native';
import { ShieldCheck, QrCode } from 'lucide-react-native';

interface VerifiedTokenCardProps {
    id: string;
    userName: string;
    familyInfo: string;
    verifiedLabel: string;
}

export const VerifiedTokenCard: React.FC<VerifiedTokenCardProps> = ({
    id,
    userName,
    familyInfo,
    verifiedLabel
}) => {
    return (
        <View 
            style={{ borderRadius: 40 }}
            className="bg-white border-[3px] border-[#2563EB] p-8 mb-8 items-center"
        >
            {/* Verified Badge */}
            <View className="bg-[#EFF6FF] px-6 py-3 rounded-full flex-row items-center mb-10">
                <ShieldCheck size={20} color="#2563EB" strokeWidth={2.5} />
                <Text className="text-[#2563EB] text-sm font-extrabold ml-2 uppercase tracking-wider">
                    {verifiedLabel}
                </Text>
            </View>

            {/* QR Code Placeholder */}
            <View 
                style={{ borderRadius: 24 }}
                className="bg-[#F1F5F9] w-full aspect-square items-center justify-center mb-10"
            >
                <QrCode size={180} color="#94A3B8" strokeWidth={1.5} />
            </View>

            {/* Token Info */}
            <Text className="text-[#1E3A8A] text-4xl font-black mb-4 tracking-tight">
                {id}
            </Text>
            
            <Text className="text-[#1E3A8A] text-2xl font-bold mb-1">
                {userName}
            </Text>
            
            <Text className="text-gray-400 text-lg font-semibold uppercase">
                {familyInfo}
            </Text>
        </View>
    );
};
