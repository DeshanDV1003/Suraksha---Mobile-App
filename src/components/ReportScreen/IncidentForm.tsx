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
                <Text className="text-xl font-bold text-[#1E3A8A] mb-3">{labels.type}</Text>
                <TouchableOpacity 
                    onPress={onTypePress}
                    activeOpacity={0.7}
                    className="bg-white border border-gray-200 rounded-[20px] px-6 py-4 flex-row justify-between items-center"
                >
                    <Text className="text-gray-900 text-xl font-medium">
                        {incidentType || labels.placeholder}
                    </Text>
                    <ChevronDown size={24} color="#000000" strokeWidth={2} />
                </TouchableOpacity>
            </View>

            <View className="mb-6">
                <Text className="text-xl font-bold text-[#1E3A8A] mb-3">{labels.desc}</Text>
                <View className="bg-white border border-gray-200 rounded-[28px] p-6 min-h-[160px]">
                    <TextInput 
                        placeholder={labels.placeholder}
                        placeholderTextColor="#94A3B8"
                        multiline
                        textAlignVertical="top"
                        className="text-gray-900 text-xl leading-8 font-medium"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>
                <View className="flex-row items-center mt-4 ml-1">
                    <Globe size={18} color="#64748B" strokeWidth={1.5} />
                    <Text className="text-[#64748B] text-base font-medium ml-2">
                        {labels.autoDetect}
                    </Text>
                </View>
            </View>

            <View className="mb-8">
                <Text className="text-xl font-bold text-[#1E3A8A] mb-3">{labels.people}</Text>
                <View className="bg-white border border-gray-200 rounded-[20px] px-6 py-4">
                    <TextInput 
                        placeholder={labels.numPlaceholder}
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        className="text-gray-900 text-xl font-medium"
                        value={peopleAffected}
                        onChangeText={setPeopleAffected}
                    />
                </View>
            </View>
        </View>
    );
};
