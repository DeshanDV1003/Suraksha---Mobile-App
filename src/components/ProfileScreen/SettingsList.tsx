import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { 
    Globe, 
    Bell, 
    MapPin, 
    Shield, 
    FileText, 
    Phone, 
    LogOut,
    ChevronRight 
} from 'lucide-react-native';

interface SettingItemProps {
    icon: any;
    label: string;
    value?: string;
    onPress: () => void;
    showChevron?: boolean;
    isLogout?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
    icon: Icon, 
    label, 
    value, 
    onPress, 
    showChevron = true,
    isLogout = false 
}) => (
    <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.7}
        className={`bg-white p-5 rounded-3xl mb-3 shadow-sm border border-gray-100 flex-row items-center justify-between ${
            isLogout ? 'border-red-100 mt-4' : ''
        }`}
    >
        <View className="flex-row items-center flex-1">
            <View className={`w-10 h-10 rounded-2xl items-center justify-center ${
                isLogout ? 'bg-red-50' : 'bg-gray-50'
            }`}>
                <Icon size={22} color={isLogout ? '#EF4444' : '#4B5563'} />
            </View>
            <Text className={`text-xl font-bold ml-4 ${
                isLogout ? 'text-red-500' : 'text-gray-900'
            }`}>
                {label}
            </Text>
        </View>
        
        <View className="flex-row items-center">
            {value && (
                <Text className="text-gray-500 font-bold text-base mr-3">{value}</Text>
            )}
            {showChevron && (
                <ChevronRight size={20} color="#9CA3AF" />
            )}
        </View>
    </TouchableOpacity>
);

interface SettingsListProps {
    onLanguagePress: () => void;
    onLogoutPress: () => void;
    onNotificationsPress: () => void;
    onLocationPress: () => void;
    onPrivacyPress: () => void;
    onTermsPress: () => void;
    onEmergencyPress: () => void;
    labels: {
        settings: string;
        language: string;
        notifications: string;
        location: string;
        privacy: string;
        terms: string;
        emergency: string;
        logout: string;
        currentLanguage: string;
    }
}

export const SettingsList: React.FC<SettingsListProps> = ({ 
    onLanguagePress, 
    onLogoutPress,
    onNotificationsPress,
    onLocationPress,
    onPrivacyPress,
    onTermsPress,
    onEmergencyPress,
    labels 
}) => {
    return (
        <View className="mb-10">
            <Text className="text-xl font-extrabold text-gray-500 mb-4 tracking-widest uppercase">
                {labels.settings}
            </Text>
            
            <SettingItem 
                icon={Globe} 
                label={labels.language} 
                value={labels.currentLanguage} 
                onPress={onLanguagePress} 
            />
            <SettingItem 
                icon={Bell} 
                label={labels.notifications} 
                onPress={onNotificationsPress} 
            />
            <SettingItem 
                icon={MapPin} 
                label={labels.location} 
                onPress={onLocationPress} 
            />
            <SettingItem 
                icon={Shield} 
                label={labels.privacy} 
                onPress={onPrivacyPress} 
            />
            <SettingItem 
                icon={FileText} 
                label={labels.terms} 
                onPress={onTermsPress} 
            />
            <SettingItem 
                icon={Phone} 
                label={labels.emergency} 
                onPress={onEmergencyPress} 
            />

            <SettingItem 
                icon={LogOut} 
                label={labels.logout} 
                onPress={onLogoutPress} 
                showChevron={false}
                isLogout
            />
        </View>
    );
};
