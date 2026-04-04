import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Navigation } from 'lucide-react-native';

interface LocationPickerProps {
    location: string;
    onPress?: () => void;
    label: string;
    gpsLabel: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ 
    location, 
    onPress,
    label,
    gpsLabel
}) => {
    return (
        <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-3">{label}</Text>
            
            <TouchableOpacity 
                onPress={onPress}
                activeOpacity={0.8}
                className="bg-[#EFF6FF] p-5 rounded-3xl border border-[#BFDBFE] flex-row items-center justify-between"
            >
                <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
                        <MapPin size={22} color="#2563EB" />
                    </View>
                    
                    <View className="ml-4 flex-1">
                        <Text className="text-[#1E40AF] font-bold text-lg">{gpsLabel}</Text>
                        <Text className="text-[#3B82F6] text-sm font-semibold">{location}</Text>
                    </View>
                </View>

                <Navigation size={24} color="#2563EB" />
            </TouchableOpacity>
        </View>
    );
};
