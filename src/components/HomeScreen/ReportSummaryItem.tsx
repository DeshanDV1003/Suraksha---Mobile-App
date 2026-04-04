import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Clock } from 'lucide-react-native';

interface ReportSummaryItemProps {
    title: string;
    location: string;
    statusLabel: string;
    statusVariant?: 'pending' | 'assigned';
    reportId: string;
}

export const ReportSummaryItem: React.FC<ReportSummaryItemProps> = ({ 
    title, 
    location, 
    statusLabel, 
    statusVariant = 'pending',
    reportId
}) => {
    const badgeColors = {
        pending: 'bg-status-pending-bg text-status-pending-text',
        assigned: 'bg-status-assigned-bg text-status-assigned-text',
    };

    return (
        <TouchableOpacity 
            activeOpacity={0.7}
            className="bg-white p-4 rounded-3xl mb-4 shadow-md border border-gray-200"
        >
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-xl font-bold text-gray-900">{title}</Text>
                
                <View className={`px-4 py-1.5 rounded-full ${
                    statusVariant === 'pending' ? 'bg-[#FEF3C7]' : 'bg-[#DBEAFE]'
                }`}>
                    <View className="flex-row items-center">
                        {statusVariant === 'pending' ? (
                            <Clock size={14} color="#D97706" />
                        ) : (
                            <View className="w-3.5 h-3.5 rounded-full border border-[#2563EB] items-center justify-center">
                                <View className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                            </View>
                        )}
                        <Text className={`font-bold ml-1.5 ${
                            statusVariant === 'pending' ? 'text-[#D97706]' : 'text-[#2563EB]'
                        }`}>
                            {statusLabel}
                        </Text>
                    </View>
                </View>
            </View>

            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <MapPin size={16} color="#4B5563" />
                    <Text className="text-gray-600 text-sm ml-1">{location}</Text>
                </View>
                
                <Text className="text-gray-400 font-bold text-sm">{reportId}</Text>
            </View>
        </TouchableOpacity>
    );
};
