import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomButton } from '../common/CustomButton';

interface TaskItemCardProps {
    title: string;
    location: string;
    description: string;
    time: string;
    status: 'pending' | 'in-progress' | 'completed';
    onAccept?: () => void;
    onDecline?: () => void;
    labels: {
        decline: string;
        accept: string;
        pending: string;
        inProgress: string;
        completed: string;
    }
}

export const TaskItemCard: React.FC<TaskItemCardProps> = ({ 
    title, 
    location, 
    description,
    time,
    status = 'pending',
    onAccept,
    onDecline,
    labels
}) => {
    return (
        <View className="bg-white p-5 rounded-3xl mb-5 shadow-md border border-gray-200">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="text-2xl font-bold text-gray-900 flex-1 pr-4">
                    {title}
                </Text>
                <View className={`w-3.5 h-3.5 rounded-full ${
                    status === 'pending' ? 'bg-orange-500' : 
                    status === 'in-progress' ? 'bg-blue-500' : 'bg-green-500'
                }`} />
            </View>

            <View className="flex-row items-start mb-4">
                <MapPin size={18} color="#6B7280" />
                <Text className="text-gray-500 font-bold text-base ml-2">{location}</Text>
            </View>

            <Text className="text-gray-700 text-lg leading-6 mb-6">
                {description}
            </Text>

            <View className="h-[1px] bg-gray-200 w-full mt-4 mb-4" />

            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Clock size={16} color="#4B5563" />
                    <Text className="text-gray-500 font-medium ml-2">{time}</Text>
                </View>

                <View className={`px-4 py-1.5 rounded-full ${
                    status === 'pending' ? 'bg-[#FEF3C7]' : 
                    status === 'in-progress' ? 'bg-[#DBEAFE]' : 'bg-[#D1FAE5]'
                }`}>
                    <Text className={`font-bold text-sm ${
                        status === 'pending' ? 'text-[#D97706]' : 
                        status === 'in-progress' ? 'text-[#2563EB]' : 'text-[#059669]'
                    }`}>
                        {status === 'pending' ? labels.pending : 
                         status === 'in-progress' ? labels.inProgress : labels.completed}
                    </Text>
                </View>
            </View>

            {status === 'pending' && (
                <View className="flex-row mt-6 items-center">
                    <TouchableOpacity 
                        onPress={onDecline}
                        activeOpacity={0.7}
                        className="flex-1 bg-white border border-[#FFDADA] rounded-2xl py-4 items-center justify-center mr-4"
                    >
                        <Text className="text-[#EF4444] text-xl font-bold">{labels.decline}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={onAccept}
                        activeOpacity={0.7}
                        className="flex-1 rounded-2xl overflow-hidden"
                    >
                        <LinearGradient
                            colors={['#2563EB', '#0891B2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-4 items-center justify-center"
                        >
                            <Text className="text-white text-xl font-bold">{labels.accept}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};
