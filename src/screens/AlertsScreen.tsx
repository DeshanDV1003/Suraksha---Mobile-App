import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { AlertDetailCard } from '../components/AlertsScreen/AlertDetailCard';

export default function AlertsScreen() {
    const { t } = useTranslation();

    return (
        <View className="flex-1 bg-white">
            <Header title={t('alerts.title')} />
            
            <ScrollView className="flex-1 px-6 pt-4">
                <View className="flex-row items-center mb-6">
                    <View className="bg-pink-100 px-4 py-1.5 rounded-full">
                        <Text className="text-pink-600 font-extrabold tracking-widest text-sm">
                            {t('alerts.new_count', { count: 3 })}
                        </Text>
                    </View>
                </View>

                <AlertDetailCard 
                    title="Flash Flood Warning - Immediate Action Required"
                    time={t('alerts.min_ago', { count: 10 })}
                    location="Colombo 7, Bambalapitiya, Wellawatta"
                    description="Water levels rising rapidly. Evacuate to higher ground immediately. Emergency shelters open at Community Center."
                    officer={`${t('alerts.officer')} - Region 3`}
                    mapLabel={t('alerts.view_map')}
                    variant="danger"
                />

                <AlertDetailCard 
                    title="Landslide Risk Alert"
                    time={t('alerts.hour_ago', { count: 1 })}
                    location="Kandy District - Hill Areas"
                    description="Heavy rainfall has saturated slopes. Risk of landslides in next 6-12 hours. Avoid travel to hill areas."
                    officer={`${t('alerts.officer')} - Region 7`}
                    mapLabel={t('alerts.view_map')}
                    variant="warning"
                />

                <AlertDetailCard 
                    title="Severe Weather Advisory"
                    time={t('alerts.hour_ago', { count: 3 })}
                    location="Galle, Matara Districts"
                    description="Strong winds and heavy rain expected. Secure loose objects and stay indoors when possible."
                    officer={`${t('alerts.officer')} - Region 5`}
                    mapLabel={t('alerts.view_map')}
                    variant="info"
                    onMapPress={() => {}}
                />
                
                <View className="h-10" />
            </ScrollView>
        </View>
    );
}
