import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Clock, CheckCircle2 } from 'lucide-react-native';

interface ArticleCardProps {
    title: string;
    readTime: string;
    completed?: boolean;
    icon: any;
    iconColor: string;
    onPress?: () => void;
    labels: {
        minRead: string;
        completed: string;
    };
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
    title,
    readTime,
    completed,
    icon: Icon,
    iconColor,
    onPress,
    labels
}) => {
    return (
        <TouchableOpacity 
            onPress={onPress}
            style={{ borderRadius: 32 }}
            className="bg-white border border-gray-100 p-6 mb-5 shadow-sm"
        >
            <View className="flex-row items-start justify-between mb-4">
                <View className="flex-row items-center flex-1">
                    <View 
                        style={{ backgroundColor: iconColor }}
                        className="w-14 h-14 rounded-2xl items-center justify-center"
                    >
                        <Icon size={28} color="white" strokeWidth={2} />
                    </View>
                    <Text className="text-[#1E3A8A] text-xl font-extrabold ml-5 flex-1 pr-2 leading-tight">
                        {title}
                    </Text>
                </View>
                <ChevronRight size={24} color="#94A3B8" strokeWidth={2.5} />
            </View>

            <View className="flex-row items-center ml-[76px]">
                <View className="flex-row items-center">
                    <Clock size={14} color="#94A3B8" />
                    <Text className="text-gray-400 text-sm font-bold ml-1.5 uppercase italic">
                        {readTime} {labels.minRead}
                    </Text>
                </View>

                {completed && (
                    <View className="flex-row items-center ml-4">
                        <Text className="text-gray-400 text-sm font-bold mx-2">•</Text>
                        <CheckCircle2 size={14} color="#10B981" strokeWidth={3} />
                        <Text className="text-[#10B981] text-sm font-black ml-1.5 uppercase tracking-tight">
                            {labels.completed}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};
