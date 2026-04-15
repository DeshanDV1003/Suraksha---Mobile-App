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
            className="bg-white p-5 rounded-[28px] mb-4 shadow-sm border border-gray-100"
        >
            <View className="flex-row justify-between items-start mb-4">
                <Text className="text-2xl font-extrabold text-[#1E3A8A]">{title}</Text>
                
                <View className={`px-4 py-2 rounded-full ${
                    statusVariant === 'pending' ? 'bg-[#FEF3C7]' : 'bg-[#DBEAFE]'
                }`}>
                    <View className="flex-row items-center">
                        {statusVariant === 'pending' ? (
                            <Clock size={16} color="#D97706" />
                        ) : (
                            <View className="w-4 h-4 rounded-full border border-[#2563EB] items-center justify-center">
                                <View className="w-2 h-2 rounded-full bg-[#2563EB]" />
                            </View>
                        )}
                        <Text className={`font-extrabold ml-2 ${
                            statusVariant === 'pending' ? 'text-[#D97706]' : 'text-[#2563EB]'
                        }`}>
                            {statusLabel}
                        </Text>
                    </View>
                </View>
            </View>

            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <MapPin size={18} color="#64748B" />
                    <Text className="text-[#64748B] text-base font-semibold ml-1.5">{location}</Text>
                </View>
                
                <Text className="text-[#64748B] font-extrabold text-base">{reportId}</Text>
            </View>
        </TouchableOpacity>
    );
};
