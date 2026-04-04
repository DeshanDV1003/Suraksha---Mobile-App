import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ChevronDown, Globe } from 'lucide-react-native';

interface IncidentFormProps {
    incidentType: string;
    onTypePress: () => void;
    description: string;
    setDescription: (text: string) => void;
    peopleAffected: string;
    setPeopleAffected: (text: string) => void;
    labels: {
        type: string;
        desc: string;
        placeholder: string;
        autoDetect: string;
        people: string;
        numPlaceholder: string;
    }
}

export const IncidentForm: React.FC<IncidentFormProps> = ({ 
    incidentType, 
    onTypePress,
    description,
    setDescription,
    peopleAffected,
    setPeopleAffected,
    labels
}) => {
    return (
        <View>
            <View className="mb-6">
                <Text className="text-xl font-bold text-gray-900 mb-3">{labels.type}</Text>
                <TouchableOpacity 
                    onPress={onTypePress}
                    activeOpacity={0.7}
                    className="bg-white border-2 border-primary rounded-3xl p-5 flex-row justify-between items-center"
                >
                    <Text className="text-gray-900 text-xl font-semibold">
                        {incidentType || labels.placeholder}
                    </Text>
                    <ChevronDown size={24} color="#1E3A8A" strokeWidth={3} />
                </TouchableOpacity>
            </View>

            <View className="mb-6">
                <Text className="text-xl font-bold text-gray-900 mb-3">{labels.desc}</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-3xl p-5 min-h-[160px]">
                    <TextInput 
                        placeholder={labels.placeholder}
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                        className="text-gray-900 text-lg leading-6"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>
                <View className="flex-row items-center mt-3 ml-1">
                    <Globe size={16} color="#6B7280" />
                    <Text className="text-gray-500 text-sm font-semibold ml-2">
                        {labels.autoDetect}
                    </Text>
                </View>
            </View>

            <View className="mb-8">
                <Text className="text-xl font-bold text-gray-900 mb-3">{labels.people}</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-3xl p-5">
                    <TextInput 
                        placeholder={labels.numPlaceholder}
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        className="text-gray-900 text-lg font-semibold"
                        value={peopleAffected}
                        onChangeText={setPeopleAffected}
                    />
                </View>
            </View>
        </View>
    );
};
