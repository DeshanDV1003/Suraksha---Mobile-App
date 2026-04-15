import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface CategoryCardProps {
    title: string;
    current: number;
    total: number;
    icon: any;
    onPress?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
    title,
    current,
    total,
    icon: Icon,
    onPress
}) => {
    const progress = Math.min((current / total) * 100, 100);

    return (
        <TouchableOpacity 
            onPress={onPress}
            style={{ borderRadius: 32 }}
            className="bg-white border border-gray-100 p-6 mb-5 shadow-sm"
        >
            <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center flex-1">
                    <View className="bg-[#EFF6FF] w-14 h-14 rounded-2xl items-center justify-center">
                        <Icon size={28} color="#2563EB" strokeWidth={2} />
                    </View>
                    <Text className="text-[#1E3A8A] text-xl font-extrabold ml-5 flex-1 pr-2">
                        {title}
                    </Text>
                </View>
                <ChevronRight size={24} color="#94A3B8" strokeWidth={2.5} />
            </View>

            <View className="flex-row items-center">
                <View className="bg-[#F1F5F9] h-2.5 rounded-full flex-1 overflow-hidden">
                    <View 
                        style={{ width: `${progress}%` }}
                        className="bg-[#2563EB] h-full rounded-full"
                    />
                </View>
                <Text className="text-gray-400 text-sm font-bold ml-4">
                    {current}/{total}
                </Text>
            </View>
        </TouchableOpacity>
    );
};
