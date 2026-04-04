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
            
            <View className="px-6 py-4 flex-row justify-between items-center bg-white">
                <View className="flex-1">
                    {showBack ? (
                        <TouchableOpacity 
                            onPress={() => navigation.goBack()}
                            className="flex-row items-center mb-2"
                        >
                            <ChevronLeft size={24} color="#374151" />
                            <Text className="text-gray-700 text-lg ml-1">Back</Text>
                        </TouchableOpacity>
                    ) : null}
                    
                    {title && (
                        <Text className={`text-3xl font-bold text-gray-900 ${showBack ? 'mt-2' : ''}`}>
                            {title}
                        </Text>
                    )}
                    
                    {subtitle && (
                        <Text className="text-gray-500 text-base mt-0.5">
                            {subtitle}
                        </Text>
                    )}
                </View>

                {!showBack && onGlobePress && (
                    <TouchableOpacity 
                        onPress={onGlobePress}
                        className="p-2"
                    >
                        <Globe size={28} color="#2563EB" strokeWidth={2} />
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};
