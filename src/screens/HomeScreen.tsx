import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { EmergencyCard } from '../components/HomeScreen/EmergencyCard';
import { StatsCard } from '../components/common/StatsCard';
import { RecentAlertItem } from '../components/HomeScreen/RecentAlertItem';
import { ReportSummaryItem } from '../components/HomeScreen/ReportSummaryItem';
import { 
    AlertCircle, 
    Users, 
    CheckCircle2, 
    ChevronRight,
    Heart,
    Package,
    Building2,
    QrCode,
    CheckSquare,
    BookOpen,
    ClipboardList,
    Banknote
} from 'lucide-react-native';
import { ActionGridCard } from '../components/common/ActionGridCard';

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();

    return (
        <View className="flex-1 bg-[#F8FAFC]">
            <Header 
                title={t('home.welcome') || "Welcome Back"} 
                subtitle={t('home.subtitle') || "Stay safe, stay informed"} 
                onGlobePress={() => navigation.navigate('Language')}
            />
            
            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                <EmergencyCard onReportPress={() => navigation.navigate('Report')} />

                <View className="flex-row justify-between mb-10">
                    <StatsCard 
                        label={t('common.active') || "Active"} 
                        count={12} 
                        variant="danger" 
                        icon={AlertCircle}
                    />
                    <StatsCard 
                        label={t('common.volunteers') || "Volunteers"} 
                        count={84} 
                        variant="success" 
                        icon={Users}
                    />
                    <StatsCard 
                        label={t('common.resolved') || "Resolved"} 
                        count={156} 
                        variant="info" 
                        icon={CheckCircle2}
                    />
                </View>

                {/* Recent Alerts Section */}
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-3xl font-extrabold text-[#1E3A8A]">
                        {t('home.recent_alerts') || "Recent Alerts"}
                    </Text>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Alerts')}
                        className="flex-row items-center"
                    >
                        <Text className="text-[#2563EB] font-bold text-xl mr-1">
                            {t('common.view_all') || "View All"}
                        </Text>
                        <ChevronRight size={24} color="#2563EB" strokeWidth={2.5} />
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
                <View className="mb-6 mt-6">
                    <Text className="text-3xl font-extrabold text-[#1E3A8A]">
                        {t('home.your_reports') || "Your Reports"}
                    </Text>
                </View>

                <ReportSummaryItem 
                    title="Flooding" 
                    location="Galle Road" 
                    statusLabel={t('home.under_review') || "Under Review"} 
                    statusVariant="pending"
                    reportId="#SR-1234"
                />
                <ReportSummaryItem 
                    title="Medical Emergency" 
                    location="Dehiwala" 
                    statusLabel={t('home.assigned') || "Assigned"} 
                    statusVariant="assigned"
                    reportId="#SR-1235"
                />

                {/* Safety & Resources Section */}
                <View className="mb-6 mt-12">
                    <Text className="text-[26px] font-bold text-[#111827]">
                        {t('home.safety_resources') || "Safety & Resources"}
                    </Text>
                </View>

                <View className="flex-row mb-2">
                    <ActionGridCard 
                        label={t('home.family_safety') || "Family Safety"} 
                        icon={Heart} 
                        onPress={() => navigation.navigate('FamilySafety')} 
                        bgColor="#F43F5E" 
                    />
                    <ActionGridCard 
                        label={t('home.resources') || "Resources"} 
                        icon={Package} 
                        onPress={() => {}} 
                        bgColor="#3B82F6" 
                    />
                </View>
                <View className="flex-row mb-6">
                    <ActionGridCard 
                        label={t('home.relief_camps') || "Relief Camps"} 
                        icon={Building2} 
                        onPress={() => navigation.navigate('ReliefCamps')} 
                        bgColor="#A855F7" 
                    />
                    <ActionGridCard 
                        label={t('home.my_token') || "My Token"} 
                        icon={QrCode} 
                        onPress={() => navigation.navigate('ReliefToken')} 
                        bgColor="#10B981" 
                    />
                </View>

                {/* Information & Support Section */}
                <View className="mb-6 mt-8">
                    <Text className="text-[26px] font-bold text-[#111827]">
                        {t('home.info_support') || "Information & Support"}
                    </Text>
                </View>

                <View className="flex-row mb-2">
                    <ActionGridCard 
                        label={t('home.preparedness') || "Preparedness"} 
                        icon={CheckSquare} 
                        onPress={() => navigation.navigate('Preparedness')} 
                        bgColor="#0D9488" 
                    />
                    <ActionGridCard 
                        label={t('home.education') || "Education"} 
                        icon={BookOpen} 
                        onPress={() => navigation.navigate('Education')} 
                        bgColor="#6366F1" 
                    />
                </View>
                <View className="flex-row mb-12">
                    <ActionGridCard 
                        label={t('home.damage_report') || "Damage Report"} 
                        icon={ClipboardList} 
                        onPress={() => navigation.navigate('DamageReport')} 
                        bgColor="#FB923C" 
                    />
                    <ActionGridCard 
                        label={t('home.donate') || "Donate"} 
                        icon={Banknote} 
                        onPress={() => navigation.navigate('Donate')} 
                        bgColor="#10B981" 
                    />
                </View>
                
                <View className="h-10" />
            </ScrollView>
        </View>
    );
}
