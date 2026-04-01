import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, CustomButton } from '../components/common';
import { useSettingsStore } from '../store';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { setLanguage, language } = useSettingsStore();

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="mt-10 mb-6">
        <Text className="text-3xl font-bold text-primary">{t('welcome')}</Text>
        <Text className="text-gray-500 mt-1">Suraksha Disaster Management System</Text>
      </View>

      <Card title={t('select_language')}>
        <View className="flex-row justify-between mt-2">
          <CustomButton 
            label="English" 
            onPress={() => setLanguage('en')} 
            variant={language === 'en' ? 'primary' : 'secondary'}
          />
          <CustomButton 
            label="සිංහල" 
            onPress={() => setLanguage('si')} 
            variant={language === 'si' ? 'primary' : 'secondary'}
          />
          <CustomButton 
            label="தமிழ்" 
            onPress={() => setLanguage('ta')} 
            variant={language === 'ta' ? 'primary' : 'secondary'}
          />
        </View>
      </Card>

      <View className="mt-4">
        <CustomButton 
          label={t('report_incident')} 
          onPress={() => {}} 
          variant="danger" 
        />
      </View>

      <Card title="Recent Alerts" className="mt-6">
        <Text className="text-gray-600 italic">No active alerts in your area.</Text>
      </Card>
      
      <View className="h-20" />
    </ScrollView>
  );
}
