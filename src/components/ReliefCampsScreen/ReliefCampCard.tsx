import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Clock } from 'lucide-react-native';
import { ServiceChip } from './ServiceChip';

interface ReliefCampCardProps {
    name: string;
    distance: string;
    currentOccupancy: number;
    maxOccupancy: number;
    services: ReadonlyArray<'food' | 'water' | 'medical' | 'charging' | 'toilets' | 'child-care'>;
    waitTime: string;
    onGetDirections?: () => void;
    labels: {
        occupancy: string;
        services: string;
        waitTime: string;
        getDirections: string;
        allServices: Record<string, string>;
    };
}

export const ReliefCampCard: React.FC<ReliefCampCardProps> = ({
    name,
    distance,
    currentOccupancy,
    maxOccupancy,
    services,
    waitTime,
    onGetDirections,
    labels
}) => {
    const isFull = currentOccupancy >= maxOccupancy;
    const occupancyPercent = Math.min((currentOccupancy / maxOccupancy) * 100, 100);

    const theme = {
        badgeBg: isFull ? 'bg-red-50' : 'bg-blue-50',
        badgeText: isFull ? 'text-red-600' : 'text-blue-600',
        progressBar: isFull ? 'bg-red-500' : 'bg-green-500',
        occupancyText: isFull ? 'text-red-500' : 'text-green-600',
        border: isFull ? 'border-red-100' : 'border-gray-100'
    };

    return (
        <View 
            style={{ borderRadius: 32 }}
            className={`bg-white border ${theme.border} p-7 mb-6 shadow-sm`}
        >
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-[#1E3A8A] text-[22px] font-extrabold flex-1 mr-4">
                    {name}
                </Text>
                <View className={`${theme.badgeBg} px-4 py-1.5 rounded-full`}>
                    <Text className={`${theme.badgeText} text-sm font-bold`}>
                        {distance}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center mb-6">
                <MapPin size={16} color="#64748B" />
                <Text className="text-gray-400 text-base font-semibold ml-2">
                    {distance}
                </Text>
            </View>

            <View className="flex-row justify-between items-end mb-3">
                <Text className="text-gray-500 text-sm font-bold uppercase">
                    {labels.occupancy}
                </Text>
                <Text className={`${theme.occupancyText} text-base font-extrabold`}>
                    {currentOccupancy}/{maxOccupancy}
                </Text>
            </View>

            {/* Progress Bar Container */}
            <View className="bg-gray-100 h-2.5 rounded-full w-full mb-8 overflow-hidden">
                <View 
                    style={{ width: `${occupancyPercent}%` }}
                    className={`${theme.progressBar} h-full rounded-full`}
                />
            </View>

            <Text className="text-gray-500 text-sm font-bold uppercase mb-4">
                {labels.services}
            </Text>

            <View className="flex-row flex-wrap mb-4">
                {services.map((service, index) => (
                    <ServiceChip 
                        key={index}
                        type={service}
                        label={labels.allServices[service]}
                    />
                ))}
            </View>

            <View className="h-[1px] bg-gray-100 w-full mb-5" />

            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <Clock size={16} color="#64748B" />
                    <Text className="text-gray-500 text-sm font-bold ml-2 leading-relaxed">
                        {labels.waitTime}: <Text className={`${isFull ? 'text-gray-700' : 'text-gray-900'} font-extrabold uppercase`}>{waitTime}</Text>
                    </Text>
                </View>
                <TouchableOpacity onPress={onGetDirections}>
                    <Text className="text-[#2563EB] text-base font-extrabold">
                        {labels.getDirections}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
