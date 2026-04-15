import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';

interface StatusActionCardProps {
    title: string;
    description: string;
    icon: any;
    colors: [string, string, ...string[]];
    onPress?: () => void;
}

export const StatusActionCard: React.FC<StatusActionCardProps> = ({
    title,
    description,
    icon: Icon,
    colors,
    onPress
}) => {
    return (
        <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={onPress}
            className="mb-4"
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.2 }}
                style={{ borderRadius: 45, overflow: 'hidden' }}
                className="flex-row items-center p-7 h-36"
            >
                <View className="w-16 h-16 rounded-full bg-white/30 items-center justify-center mr-6">
                    <Icon size={34} color="white" strokeWidth={3} />
                </View>

                <View className="flex-1">
                    <Text className="text-white text-[22px] font-extrabold mb-1">
                        {title}
                    </Text>
                    <Text className="text-white/90 text-sm font-bold opacity-80">
                        {description}
                    </Text>
                </View>

                <ChevronRight size={24} color="white" strokeWidth={3} />
            </LinearGradient>
        </TouchableOpacity>
    );
};
