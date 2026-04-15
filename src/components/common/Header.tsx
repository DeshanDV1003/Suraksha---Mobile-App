import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Globe, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    onGlobePress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    title, 
    subtitle, 
    showBack = false, 
    onGlobePress 
}) => {
    const navigation = useNavigation();

    return (
        <SafeAreaView className="bg-white">
            {/* Top blue bar placeholder for status bar area as seen in images */}
            <View className="h-2 bg-primary" />
            
            <View className="px-6 py-6 flex-row justify-between items-start bg-white">
                <View className="flex-1">
                    {showBack ? (
                        <TouchableOpacity 
                            onPress={() => navigation.goBack()}
                            className="flex-row items-center mb-4"
                        >
                            <ChevronLeft size={24} color="#1E3A8A" />
                            <Text className="text-[#1E3A8A] text-lg font-semibold ml-1">Back</Text>
                        </TouchableOpacity>
                    ) : null}
                    
                    {title && (
                        <Text className={`text-4xl font-extrabold text-[#1E3A8A] leading-tight ${showBack ? 'mt-2' : ''}`}>
                            {title}
                        </Text>
                    )}
                    
                    {subtitle && (
                        <Text className="text-gray-500 text-lg font-medium mt-1">
                            {subtitle}
                        </Text>
                    )}
                </View>

                {!showBack && onGlobePress && (
                    <TouchableOpacity 
                        onPress={onGlobePress}
                        className="mt-1"
                    >
                        <Globe size={32} color="#2563EB" strokeWidth={1.5} />
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};
