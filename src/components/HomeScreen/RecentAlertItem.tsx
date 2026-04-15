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
            className={`flex-row p-5 rounded-[28px] mb-4 border-l-[8px] ${bgColors[variant]} ${borderColors[variant]} shadow-sm items-center`}
        >
            <View className="flex-1">
                <Text className="text-2xl font-extrabold text-[#1E3A8A] mb-2">{title}</Text>
                
                <View className="flex-row items-center">
                    <MapPin size={18} color="#64748B" />
                    <Text className="text-[#64748B] text-base font-semibold ml-1.5 mr-5">{location}</Text>
                    
                    <Clock size={18} color="#64748B" />
                    <Text className="text-[#64748B] text-base font-semibold ml-1.5">{time}</Text>
                </View>
            </View>

            {/* Status dot */}
            <View className={`w-4 h-4 rounded-full ${variant === 'danger' ? 'bg-[#F43F5E]' : 'bg-[#F97316]'}`} />
        </TouchableOpacity>
    );
};
