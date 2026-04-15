import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

interface DonationRequestCardProps {
    title: string;
    recipient: string;
    amount: string;
    perKitLabel: string;
    donateNowLabel: string;
    accentColor: string;
    onPress?: () => void;
}

export const DonationRequestCard: React.FC<DonationRequestCardProps> = ({
    title,
    recipient,
    amount,
    perKitLabel,
    donateNowLabel,
    accentColor,
    onPress
}) => {
    return (
        <View 
            style={{ borderRadius: 24, paddingLeft: 8 }}
            className={`bg-white border border-gray-100 overflow-hidden mb-5 shadow-sm`}
        >
            <View 
                style={{ backgroundColor: accentColor }}
                className="absolute left-0 top-0 bottom-0 w-2"
            />
            
            <View className="p-6">
                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-row items-center flex-1 pr-2">
                        <Text className="text-[#1E3A8A] text-xl font-extrabold mr-2">
                            {title}
                        </Text>
                        <ShieldCheck size={18} color="#10B981" strokeWidth={2.5} />
                    </View>
                    <View className="items-end">
                        <Text className="text-[#1E3A8A] text-xl font-black uppercase">
                            {amount}
                        </Text>
                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                            {perKitLabel}
                        </Text>
                    </View>
                </View>

                <Text className="text-gray-500 text-sm font-bold mb-6 italic">
                    {recipient}
                </Text>

                <TouchableOpacity 
                    onPress={onPress}
                    style={{ borderRadius: 16 }}
                    className="bg-[#10B981] py-4 items-center justify-center overflow-hidden"
                >
                    <Text className="text-white text-lg font-black uppercase tracking-tight">
                        {donateNowLabel}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
