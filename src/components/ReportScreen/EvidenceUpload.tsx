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
        <View className="mb-8">
            <Text className="text-xl font-bold text-[#1E3A8A] mb-4">{label}</Text>
            
            <View className="flex-row">
                <TouchableOpacity 
                    onPress={onPhotoPress}
                    activeOpacity={0.7}
                    className="flex-1 bg-white border-2 border-dashed border-[#CBD5E1] rounded-[24px] p-6 items-center justify-center mr-2 h-40"
                >
                    <View className="mb-3">
                        <Camera size={40} color="#64748B" strokeWidth={1.5} />
                    </View>
                    <Text className="text-[#64748B] text-lg font-bold">{photoLabel}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={onVideoPress}
                    activeOpacity={0.7}
                    className="flex-1 bg-white border-2 border-dashed border-[#CBD5E1] rounded-[24px] p-6 items-center justify-center ml-2 h-40"
                >
                    <View className="mb-3">
                        <Video size={40} color="#64748B" strokeWidth={1.5} />
                    </View>
                    <Text className="text-[#64748B] text-lg font-bold">{videoLabel}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
