import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle, MapPin, Navigation, User } from 'lucide-react-native';

interface AlertDetailCardProps {
    title: string;
    time: string;
    location: string;
    description: string;
    officer: string;
    mapLabel: string;
    variant?: 'danger' | 'warning' | 'info';
    onMapPress?: () => void;
}

export const AlertDetailCard: React.FC<AlertDetailCardProps> = ({ 
    title, 
    time, 
    location, 
    description,
    officer,
    mapLabel,
    variant = 'danger',
    onMapPress
}) => {
    const theme = {
        danger: {
            bg: 'bg-[#FFF5F5]',
            border: 'border-[#EF4444]',
            iconBg: 'bg-[#EF4444]',
            text: 'text-[#991B1B]',
            title: 'text-[#B91C1C]'
        },
        warning: {
            bg: 'bg-[#FFF9F2]',
            border: 'border-[#F97316]',
            iconBg: 'bg-[#F97316]',
            text: 'text-[#92400E]',
            title: 'text-[#C2410C]'
        },
        info: {
            bg: 'bg-[#FEFCE8]',
            border: 'border-[#EAB308]',
            iconBg: 'bg-[#EAB308]',
            text: 'text-[#854D0E]',
            title: 'text-[#A16207]'
        }
    };

    const currentTheme = theme[variant];

    return (
        <View className={`rounded-3xl border-2 mb-6 overflow-hidden ${currentTheme.bg} ${currentTheme.border} p-5 shadow-sm`}>
            <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center flex-1">
                    <View className={`w-12 h-12 rounded-2xl items-center justify-center shadow-sm ${currentTheme.iconBg}`}>
                        <AlertTriangle size={26} color="white" strokeWidth={2.5} />
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className={`text-2xl font-bold leading-7 ${currentTheme.title}`}>
                            {title}
                        </Text>
                    </View>
                </View>
                <Text className="text-gray-500 font-bold text-sm">{time}</Text>
            </View>

            <View className="flex-row items-start mb-4 ml-1">
                <MapPin size={18} color="#4B5563" />
                <View className="ml-2 flex-1">
                    <Text className="text-gray-600 font-bold text-base">{location}</Text>
                </View>
            </View>

            <View className="mb-6">
                <Text className="text-gray-700 text-lg leading-6 font-medium">
                    {description}
                </Text>
            </View>

            <View className="h-[1px] bg-gray-200 mb-4 mx-[-20px]" />

            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <User size={18} color="#6B7280" />
                    <Text className="text-gray-500 font-bold text-sm ml-2">
                        {officer}
                    </Text>
                </View>
                
                <TouchableOpacity 
                    onPress={onMapPress}
                    className="flex-row items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
                >
                    <Text className="text-[#2563EB] font-bold text-base mr-2">{mapLabel}</Text>
                    <Navigation size={16} color="#2563EB" />
                </TouchableOpacity>
            </View>
        </View>
    );
};
