import React from 'react';
import { View, Text } from 'react-native';
import { Zap } from 'lucide-react-native';

interface AutoAlertSectionProps {
    title: string;
    description: string;
    tags: string[];
}

export const AutoAlertSection: React.FC<AutoAlertSectionProps> = ({
    title,
    description,
    tags
}) => {
    return (
        <View 
            style={{ borderRadius: 40, overflow: 'hidden' }}
            className="bg-red-50/50 border border-red-100 p-8 mb-10"
        >
            <View className="flex-row items-center mb-4">
                <Zap size={24} color="#EF4444" fill="#EF4444" />
                <Text className="text-[#1E3A8A] text-2xl font-extrabold ml-3">
                    {title}
                </Text>
            </View>

            <Text className="text-gray-500 text-base font-semibold leading-6 mb-6">
                {description}
            </Text>

            <View className="flex-row flex-wrap">
                {tags.map((tag, index) => (
                    <View 
                        key={index} 
                        className={`px-5 py-2.5 rounded-full mr-3 mb-3 border ${
                            index === 0 ? 'bg-red-50 border-red-200' : 
                            index === 1 ? 'bg-blue-50 border-blue-200' : 
                            'bg-purple-50 border-purple-200'
                        }`}
                    >
                        <Text className={`text-sm font-extrabold ${
                            index === 0 ? 'text-red-500' : 
                            index === 1 ? 'text-blue-500' : 
                            'text-purple-500'
                        }`}>
                            {tag}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};
