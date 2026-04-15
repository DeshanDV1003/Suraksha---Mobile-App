import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { StatusActionCard } from '../components/FamilySafetyScreen/StatusActionCard';
import { FamilyMemberCard } from '../components/FamilySafetyScreen/FamilyMemberCard';
import { AutoAlertSection } from '../components/FamilySafetyScreen/AutoAlertSection';
import { 
    CheckCircle2, 
    AlertTriangle, 
    User, 
    Building2 
} from 'lucide-react-native';

export default function FamilySafetyScreen() {
    const { t } = useTranslation();

    const statusActions = [
        {
            title: t('safety.i_am_safe'),
            description: t('safety.i_am_safe_desc'),
            icon: CheckCircle2,
            colors: ['#22C55E', '#10B981'] as [string, string, ...string[]]
        },
        {
            title: t('safety.i_need_help'),
            description: t('safety.i_need_help_desc'),
            icon: AlertTriangle,
            colors: ['#EF4444', '#F97316'] as [string, string, ...string[]]
        },
        {
            title: t('safety.member_missing'),
            description: t('safety.member_missing_desc'),
            icon: User,
            colors: ['#F97316', '#EAB308'] as [string, string, ...string[]]
        },
        {
            title: t('safety.reached_shelter'),
            description: t('safety.reached_shelter_desc'),
            icon: Building2,
            colors: ['#3B82F6', '#0EA5E9'] as [string, string, ...string[]]
        }
    ];

    const familyMembers = [
        { name: t('safety.mother'), update: '5 min ago', status: 'safe' as const },
        { name: t('safety.father'), update: '10 min ago', status: 'safe' as const },
        { name: t('safety.brother'), update: 'No update', status: 'none' as const }
    ];

    return (
        <View className="flex-1 bg-white">
            <Header 
                title={t('safety.title')} 
                subtitle={t('safety.subtitle')} 
                showBack 
            />

            <ScrollView 
                className="flex-1 px-6 pt-4" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {statusActions.map((action, index) => (
                    <StatusActionCard 
                        key={index}
                        title={action.title}
                        description={action.description}
                        icon={action.icon}
                        colors={action.colors}
                    />
                ))}

                <View className="mt-8 mb-6">
                    <Text className="text-3xl font-extrabold text-[#1E3A8A]">
                        {t('safety.family_members')}
                    </Text>
                </View>

                {familyMembers.map((member, index) => (
                    <FamilyMemberCard 
                        key={index}
                        name={member.name}
                        lastUpdate={member.update}
                        status={member.status}
                        safeLabel={t('safety.safe')}
                        noneLabel={t('safety.no_update')}
                    />
                ))}

                <View className="mt-6">
                    <AutoAlertSection 
                        title={t('safety.emergency_auto_alert')}
                        description={t('safety.auto_alert_desc')}
                        tags={[
                            t('safety.family_count'),
                            t('safety.volunteers_count'),
                            t('safety.dmc_officers')
                        ]}
                    />
                </View>
            </ScrollView>
        </View>
    );
}
