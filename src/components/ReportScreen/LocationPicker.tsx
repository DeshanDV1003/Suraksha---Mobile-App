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
        <View className="mb-8">
            <Text className="text-xl font-bold text-[#1E3A8A] mb-3">{label}</Text>
            
            <TouchableOpacity 
                onPress={onPress}
                activeOpacity={0.8}
                className="bg-[#EFF6FF] p-5 rounded-[24px] border border-[#BFDBFE] flex-row items-center justify-between"
            >
                <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 rounded-[16px] bg-white items-center justify-center shadow-sm">
                        <MapPin size={24} color="#2563EB" strokeWidth={2} />
                    </View>
                    
                    <View className="ml-4 flex-1">
                        <Text className="text-[#1E40AF] font-extrabold text-xl mb-0.5">{gpsLabel}</Text>
                        <Text className="text-[#2563EB] text-base font-semibold">{location}</Text>
                    </View>
                </View>

                <Navigation size={24} color="#2563EB" strokeWidth={2.5} />
            </TouchableOpacity>
        </View>
    );
};
