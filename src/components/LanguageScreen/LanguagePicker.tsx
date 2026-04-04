import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Globe, CheckCircle2 } from 'lucide-react-native';

interface LanguageOptionProps {
    id: string;
    label: string;
    nativeLabel: string;
    isSelected: boolean;
    onPress: () => void;
}

const LanguageOption: React.FC<LanguageOptionProps> = ({ 
    label, 
    nativeLabel, 
    isSelected, 
    onPress 
}) => (
    <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.7}
        className={`p-6 rounded-3xl mb-5 flex-row items-center justify-between border-2 ${
            isSelected ? 'border-[#3B82F6] bg-white' : 'border-transparent bg-white shadow-sm'
        }`}
    >
        <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-2xl bg-gray-50 items-center justify-center">
                <Globe size={24} color={isSelected ? '#2563EB' : '#4B5563'} />
            </View>
            <View className="ml-5">
                <Text className={`text-xl font-bold ${isSelected ? 'text-[#1E40AF]' : 'text-gray-900'}`}>
                    {label}
                </Text>
                <Text className="text-gray-500 font-bold text-lg mt-1">{nativeLabel}</Text>
            </View>
        </View>
        
        {isSelected && (
            <CheckCircle2 size={32} color="#2563EB" strokeWidth={2.5} />
        )}
    </TouchableOpacity>
);

interface LanguagePickerProps {
    selectedLanguage: string;
    onLanguageChange: (id: string) => void;
}

export const LanguagePicker: React.FC<LanguagePickerProps> = ({ 
    selectedLanguage, 
    onLanguageChange 
}) => {
    const languages = [
        { id: 'en', label: 'English', nativeLabel: 'English' },
        { id: 'si', label: 'Sinhala', nativeLabel: 'සිංහල' },
        { id: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
    ];

    return (
        <View className="mt-8">
            <Text className="text-gray-600 font-bold text-xl mb-8 leading-6">
                Choose your preferred language for the app
            </Text>
            
            {languages.map((lang) => (
                <LanguageOption 
                    key={lang.id}
                    id={lang.id}
                    label={lang.label}
                    nativeLabel={lang.nativeLabel}
                    isSelected={selectedLanguage === lang.id}
                    onPress={() => onLanguageChange(lang.id)}
                />
            ))}
        </View>
    );
};
