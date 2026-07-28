import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header } from '../components/common/Header';
import { LanguagePicker } from '../components/LanguageScreen/LanguagePicker';

export default function LanguageScreen() {
    const { i18n } = useTranslation();
    const navigation = useNavigation();

    const handleLanguageChange = async (id: string) => {
        await AsyncStorage.setItem('app_language', id);
        i18n.changeLanguage(id);
        navigation.goBack();
    };

    return (
        <View className="flex-1 bg-white">
            <Header title={i18n.t('common.select_language')} showBack />
            
            <View className="flex-1 px-6 pt-4">
                <LanguagePicker 
                    selectedLanguage={i18n.language} 
                    onLanguageChange={handleLanguageChange} 
                />
            </View>
        </View>
    );
}
