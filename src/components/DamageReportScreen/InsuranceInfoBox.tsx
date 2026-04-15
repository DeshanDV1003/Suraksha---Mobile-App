import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Square } from 'lucide-react-native';

interface InsuranceInfoBoxProps {
    title: string;
    text: string;
    checkLabel: string;
    isChecked: boolean;
    onToggle: () => void;
}

export const InsuranceInfoBox: React.FC<InsuranceInfoBoxProps> = ({
    title,
    text,
    checkLabel,
    isChecked,
    onToggle
}) => {
    return (
        <View 
            style={{ borderRadius: 28 }}
            className="bg-[#FEF9C3] border border-[#FDE047] p-7 mb-10"
        >
            <Text className="text-[#854D0E] text-lg font-extrabold mb-3 uppercase tracking-tighter">
                {title}
            </Text>
            <Text className="text-[#A16207] text-sm font-bold leading-5 mb-6">
                {text}
            </Text>

            <TouchableOpacity 
                onPress={onToggle}
                className="flex-row items-center"
            >
                <View 
                    style={{ borderRadius: 8 }}
                    className={`w-8 h-8 items-center justify-center border-2 ${
                        isChecked ? 'bg-[#334155] border-[#334155]' : 'bg-white border-gray-300'
                    }`}
                >
                    {isChecked && <Text className="text-white text-lg font-black mt-[-2px]">✓</Text>}
                </View>
                <Text className="text-[#713F12] text-base font-extrabold ml-4">
                    {checkLabel}
                </Text>
            </TouchableOpacity>
        </View>
    );
};
