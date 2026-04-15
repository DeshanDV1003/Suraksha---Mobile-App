import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle2, MapPin } from 'lucide-react-native';

interface CollectionHistoryItemProps {
    title: string;
    location: string;
    timeLabel: string;
    statusLabel: string;
}

export const CollectionHistoryItem: React.FC<CollectionHistoryItemProps> = ({
    title,
    location,
    timeLabel,
    statusLabel
}) => {
    return (
        <View 
            style={{ borderRadius: 32 }}
            className="bg-white border border-gray-100 p-6 mb-4 flex-row items-center justify-between"
        >
            <View className="flex-row items-center flex-1">
                <View className="bg-green-50 w-14 h-14 rounded-full items-center justify-center">
                    <CheckCircle2 size={32} color="#10B981" strokeWidth={2.5} />
                </View>

                <View className="ml-5 flex-1 pr-4">
                    <Text className="text-[#1E3A8A] text-xl font-extrabold mb-1">
                        {title}
                    </Text>
                    <View className="flex-row items-center">
                        <MapPin size={14} color="#94A3B8" />
                        <Text className="text-gray-400 text-sm font-semibold ml-1">
                            {location}
                        </Text>
                    </View>
                </View>
            </View>

            <View className="items-end">
                <Text className="text-gray-400 text-sm font-semibold mb-1">
                    {timeLabel}
                </Text>
                <View className="flex-row items-center">
                    <CheckCircle2 size={12} color="#10B981" strokeWidth={3} />
                    <Text className="text-green-600 text-sm font-extrabold ml-1 uppercase">
                        {statusLabel}
                    </Text>
                </View>
            </View>
        </View>
    );
};
