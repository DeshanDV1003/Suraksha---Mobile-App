import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Clock } from 'lucide-react-native';

interface RecentAlertItemProps {
    title: string;
    location: string;
    time: string;
    variant?: 'danger' | 'warning';
}

export const RecentAlertItem: React.FC<RecentAlertItemProps> = ({ 
    title, 
    location, 
    time, 
    variant = 'danger' 
}) => {
    const bgColors = {
        danger: 'bg-alert-red-bg',
        warning: 'bg-alert-orange-bg',
    };

    const borderColors = {
        danger: 'border-alert-red-border',
        warning: 'border-alert-orange-border',
    };

    return (
        <TouchableOpacity 
            activeOpacity={0.7}
            className={`flex-row p-4 rounded-3xl mb-4 border-l-[6px] ${bgColors[variant]} ${borderColors[variant]} shadow-md items-center shadow-gray-200`}
        >
            <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900 mb-2">{title}</Text>
                
                <View className="flex-row items-center">
                    <MapPin size={16} color="#4B5563" />
                    <Text className="text-gray-600 text-sm ml-1 mr-4">{location}</Text>
                    
                    <Clock size={16} color="#4B5563" />
                    <Text className="text-gray-600 text-sm ml-1">{time}</Text>
                </View>
            </View>

            {/* Status dot */}
            <View className={`w-3 h-3 rounded-full ${variant === 'danger' ? 'bg-red-500' : 'bg-orange-500'}`} />
        </TouchableOpacity>
    );
};
