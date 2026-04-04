import React from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { UserProfileCard } from '../components/ProfileScreen/UserProfileCard';
import { StatsCard } from '../components/common/StatsCard';
import { SettingsList } from '../components/ProfileScreen/SettingsList';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();

    return (
        <View className="flex-1 bg-white">
            <Header title={t('profile.title')} />
            
            <ScrollView className="flex-1 px-6 pt-4">
                <UserProfileCard 
                    name="Deshan Silva" 
                    role={t('tasks.role')} 
                    location="Colombo" 
                    verifiedLabel={t('profile.verified')}
                />

                <View className="flex-row justify-between mb-8">
                    <StatsCard 
                        label={t('profile.reports_submitted')} 
                        count={23} 
                        variant="white"
                        className="mr-2"
                        customCountColor="text-[#2563EB]"
                    />
                    <StatsCard 
                        label={t('profile.tasks_completed')} 
                        count={15} 
                        variant="white"
                        className="ml-2"
                        customCountColor="text-[#10B981]"
                    />
                </View>

                <SettingsList 
                    onLanguagePress={() => navigation.navigate('Language')}
                    onLogoutPress={() => {}}
                    labels={{
                        settings: t('profile.settings'),
                        language: t('profile.language'),
                        notifications: t('profile.notifications'),
                        location: t('profile.location_services'),
                        privacy: t('profile.privacy'),
                        terms: t('profile.terms'),
                        emergency: t('profile.emergency_contacts'),
                        logout: t('profile.logout'),
                        currentLanguage: i18n.language === 'en' ? 'English' : i18n.language === 'si' ? 'සිංහල' : 'தமிழ்'
                    }}
                />
            </ScrollView>
        </View>
    );
}
