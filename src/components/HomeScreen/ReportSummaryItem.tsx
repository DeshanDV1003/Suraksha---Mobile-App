import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Clock } from 'lucide-react-native';

interface ReportSummaryItemProps {
    title: string;
    location: string;
    statusLabel: string;
    statusVariant?: 'pending' | 'assigned' | 'resolved';
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
        pending: 'bg-[#FEF3C7] text-[#D97706]',
        assigned: 'bg-[#DBEAFE] text-[#2563EB]',
        resolved: 'bg-[#D1FAE5] text-[#059669]',
    };

    return (
        <TouchableOpacity 
            activeOpacity={0.7}
            className="bg-white p-5 rounded-[28px] mb-4 shadow-sm border border-gray-100"
        >
            <View className="flex-row justify-between items-start mb-4">
                <Text className="text-2xl font-extrabold text-[#1E3A8A]">{title}</Text>
                
                <View className={`px-4 py-2 rounded-full ${
                    statusVariant === 'pending' ? 'bg-[#FEF3C7]' : 
                    statusVariant === 'assigned' ? 'bg-[#DBEAFE]' : 'bg-[#D1FAE5]'
                }`}>
                    <View className="flex-row items-center">
                        {statusVariant === 'pending' ? (
                            <Clock size={16} color="#D97706" />
                        ) : statusVariant === 'assigned' ? (
                            <View className="w-4 h-4 rounded-full border border-[#2563EB] items-center justify-center">
                                <View className="w-2 h-2 rounded-full bg-[#2563EB]" />
                            </View>
                        ) : (
                            <View className="w-4 h-4 rounded-full bg-[#059669] items-center justify-center">
                                <View className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />
                            </View>
                        )}
                        <Text className={`font-extrabold ml-2 ${
                            statusVariant === 'pending' ? 'text-[#D97706]' : 
                            statusVariant === 'assigned' ? 'text-[#2563EB]' : 'text-[#059669]'
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
