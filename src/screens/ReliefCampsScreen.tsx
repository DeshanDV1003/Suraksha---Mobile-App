import React from 'react';
import { View, ScrollView, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { ReliefCampCard } from '../components/ReliefCampsScreen/ReliefCampCard';
import { campService } from '../services/api';

export default function ReliefCampsScreen() {
    const { t } = useTranslation();
    const [camps, setCamps] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchCamps = async () => {
        try {
            const res = await campService.getCamps();
            setCamps(res.data);
        } catch (error) {
            console.error('Failed to fetch camps:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => {
        fetchCamps();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCamps();
    };

    const campLabels = {
        occupancy: t('camps.occupancy'),
        services: t('camps.services'),
        waitTime: t('camps.wait_time'),
        getDirections: t('camps.get_directions'),
        allServices: {
            food: t('camps.food'),
            water: t('camps.water'),
            medical: t('camps.medical'),
            charging: t('camps.charging'),
            toilets: t('camps.toilets'),
            'child-care': t('camps.child_care'),
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header 
                title={t('camps.title')} 
                subtitle={t('camps.subtitle')} 
                showBack 
            />

            <ScrollView 
                className="flex-1 px-6 pt-4" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading && !refreshing ? (
                    <View className="py-20 items-center">
                        <ActivityIndicator size="large" color="#A855F7" />
                    </View>
                ) : camps.length === 0 ? (
                    <View className="py-20 items-center">
                        <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Relief Camps Found</Text>
                    </View>
                ) : (
                    camps.map((camp, index) => (
                        <ReliefCampCard 
                            key={camp.id}
                            name={camp.name}
                            distance={camp.distance || "Location Unknown"}
                            currentOccupancy={camp.currentOccupancy}
                            maxOccupancy={camp.totalCapacity}
                            services={camp.services as any}
                            waitTime={camp.waitTime || "N/A"}
                            labels={campLabels}
                        />
                    ))
                )}
            </ScrollView>
        </View>
    );
}
