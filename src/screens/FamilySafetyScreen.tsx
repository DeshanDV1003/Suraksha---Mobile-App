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
import { familyService } from '../services/api';
import { useOfflineSubmit } from '../hooks/useOfflineSubmit';
import { ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useToast } from '../context/ToastContext';

export default function FamilySafetyScreen() {
    const { t } = useTranslation();

    const [familyMembers, setFamilyMembers] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { submit, status } = useOfflineSubmit('FAMILY_SAFETY_UPDATE', '/api/family/status');
    const toast = useToast();

    React.useEffect(() => {
        fetchFamilyData();
    }, []);

    const fetchFamilyData = async () => {
        try {
            setLoading(true);
            const res = await familyService.getMyStatus();
            if (res.data && res.data.familyMembers) {
                setFamilyMembers(res.data.familyMembers);
            }
        } catch (error) {
            console.error('Failed to fetch family status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            let userLocation = null;
            const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
            if (locStatus === 'granted') {
                userLocation = await Location.getCurrentPositionAsync({});
            }

            const payload = {
                status: newStatus,
                latitude: userLocation?.coords.latitude,
                longitude: userLocation?.coords.longitude,
                message: `User reported status as ${newStatus}`
            };

            const result = await submit(payload);
            if (result.queued) {
                toast.warning(t('common.offline_queued') || 'Queued', 'You are offline. Your status will be updated when you reconnect.');
            } else {
                toast.success(t('common.success') || 'Success', 'Your safety status has been updated.');
                fetchFamilyData();
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error(t('common.error') || 'Error', 'Failed to update safety status.');
        }
    };

    const statusActions = [
        {
            title: t('safety.i_am_safe'),
            description: t('safety.i_am_safe_desc'),
            icon: CheckCircle2,
            colors: ['#22C55E', '#10B981'] as [string, string, ...string[]],
            statusValue: 'SAFE'
        },
        {
            title: t('safety.i_need_help'),
            description: t('safety.i_need_help_desc'),
            icon: AlertTriangle,
            colors: ['#EF4444', '#F97316'] as [string, string, ...string[]],
            statusValue: 'NEEDS_HELP'
        },
        {
            title: t('safety.member_missing'),
            description: t('safety.member_missing_desc'),
            icon: User,
            colors: ['#F97316', '#EAB308'] as [string, string, ...string[]],
            statusValue: 'UNKNOWN'
        },
        {
            title: t('safety.reached_shelter'),
            description: t('safety.reached_shelter_desc'),
            icon: Building2,
            colors: ['#3B82F6', '#0EA5E9'] as [string, string, ...string[]],
            statusValue: 'SHELTERED'
        }
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
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
                        onPress={() => handleStatusUpdate(action.statusValue)}
                    />
                ))}

                {status === 'submitting' && (
                    <View className="py-4 items-center">
                        <ActivityIndicator size="large" color="#10B981" />
                    </View>
                )}

                <View className="mt-8 mb-6">
                    <Text className="text-3xl font-extrabold text-[#1E3A8A]">
                        {t('safety.family_members')}
                    </Text>
                </View>

                {loading ? (
                    <View className="py-10 items-center">
                        <ActivityIndicator size="large" color="#1E3A8A" />
                    </View>
                ) : familyMembers.length === 0 ? (
                    <View className="py-10 items-center bg-gray-50 rounded-2xl">
                        <Text className="text-gray-500 font-medium">No family members registered yet.</Text>
                    </View>
                ) : (
                    familyMembers.map((member: any, index) => (
                        <FamilyMemberCard 
                            key={index}
                            name={member.name}
                            lastUpdate={member.notes || 'Recently updated'}
                            status={member.status?.toLowerCase() === 'safe' ? 'safe' : 'none'}
                            safeLabel={t('safety.safe')}
                            noneLabel={t('safety.no_update')}
                        />
                    ))
                )}

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
