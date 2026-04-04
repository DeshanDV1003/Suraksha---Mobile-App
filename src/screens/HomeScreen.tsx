import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { EmergencyCard } from '../components/HomeScreen/EmergencyCard';
import { StatsCard } from '../components/common/StatsCard';
import { RecentAlertItem } from '../components/HomeScreen/RecentAlertItem';
import { ReportSummaryItem } from '../components/HomeScreen/ReportSummaryItem';
import { AlertCircle, Users, CheckCircle2, ChevronRight } from 'lucide-react-native';

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();

    return (
        <View className="flex-1 bg-white">
            <Header 
                title={t('home.welcome')} 
                subtitle={t('home.subtitle')} 
                onGlobePress={() => navigation.navigate('Language')}
            />
            
            <ScrollView className="flex-1 px-6">
                <EmergencyCard onReportPress={() => navigation.navigate('Report')} />

                <View className="flex-row justify-between mb-8">
                    <StatsCard 
                        label={t('common.active')} 
                        count={12} 
                        variant="danger" 
                        icon={AlertCircle}
                    />
                    <StatsCard 
                        label={t('common.volunteers')} 
                        count={84} 
                        variant="success" 
                        icon={Users}
                    />
                    <StatsCard 
                        label={t('common.resolved')} 
                        count={156} 
                        variant="info" 
                        icon={CheckCircle2}
                    />
                </View>

                {/* Recent Alerts Section */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-3xl font-extrabold text-[#1E3A8A]">{t('home.recent_alerts')}</Text>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Alerts')}
                        className="flex-row items-center"
                    >
                        <Text className="text-[#2563EB] font-bold text-lg mr-1">{t('common.view_all')}</Text>
                        <ChevronRight size={20} color="#2563EB" />
                    </TouchableOpacity>
                </View>

                <RecentAlertItem 
                    title="Flash Flood Warning" 
                    location="Colombo 7" 
                    time="10 min ago" 
                    variant="danger"
                />
                <RecentAlertItem 
                    title="Landslide Risk" 
                    location="Kandy District" 
                    time="1 hour ago" 
                    variant="warning"
                />

                {/* Your Reports Section */}
                <View className="mb-4 mt-4">
                    <Text className="text-3xl font-extrabold text-[#1E3A8A]">{t('home.your_reports')}</Text>
                </View>

                <ReportSummaryItem 
                    title="Flooding" 
                    location="Galle Road" 
                    statusLabel={t('home.under_review')} 
                    statusVariant="pending"
                    reportId="#SR-1234"
                />
                <ReportSummaryItem 
                    title="Medical Emergency" 
                    location="Dehiwala" 
                    statusLabel={t('home.assigned')} 
                    statusVariant="assigned"
                    reportId="#SR-1235"
                />
                
                <View className="h-10" />
            </ScrollView>
        </View>
    );
}
