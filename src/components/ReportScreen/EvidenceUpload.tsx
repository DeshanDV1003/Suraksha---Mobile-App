import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Camera, Video } from 'lucide-react-native';

interface EvidenceUploadProps {
    onPhotoPress?: () => void;
    onVideoPress?: () => void;
    label: string;
    photoLabel: string;
    videoLabel: string;
}

export const EvidenceUpload: React.FC<EvidenceUploadProps> = ({ 
    onPhotoPress, 
    onVideoPress,
    label,
    photoLabel,
    videoLabel
}) => {
    return (
        <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">{label}</Text>
            
            <View className="flex-row">
                <TouchableOpacity 
                    onPress={onPhotoPress}
                    activeOpacity={0.7}
                    className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl p-6 items-center justify-center mr-2 h-32"
                >
                    <Camera size={28} color="#4B5563" />
                    <Text className="text-gray-600 font-bold mt-2">{photoLabel}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={onVideoPress}
                    activeOpacity={0.7}
                    className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl p-6 items-center justify-center ml-2 h-32"
                >
                    <Video size={28} color="#4B5563" />
                    <Text className="text-gray-600 font-bold mt-2">{videoLabel}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
