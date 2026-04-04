import React from 'react';
import { View, Text } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

interface UserProfileCardProps {
    name: string;
    role: string;
    location: string;
    verifiedLabel: string;
    isVerified?: boolean;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ 
    name, 
    role, 
    location,
    verifiedLabel,
    isVerified = true
}) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <View className="bg-[#EFF6FF] border border-[#BFDBFE] p-6 rounded-3xl mb-8 flex-row items-center">
            <View className="w-20 h-20 rounded-full bg-[#2563EB] items-center justify-center shadow-md">
                <Text className="text-white text-3xl font-extrabold">{initials}</Text>
            </View>
            
            <View className="ml-6 flex-1">
                <Text className="text-gray-900 text-3xl font-extrabold mb-1">{name}</Text>
                <Text className="text-gray-600 font-bold text-lg mb-2">
                    {role} • {location}
                </Text>
                
                {isVerified && (
                    <View className="flex-row items-center">
                        <ShieldCheck size={20} color="#10B981" />
                        <Text className="text-green-600 font-extrabold text-base ml-1.5">
                            {verifiedLabel}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};
