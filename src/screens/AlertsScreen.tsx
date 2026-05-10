import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { AlertDetailCard } from '../components/AlertsScreen/AlertDetailCard';
import { alertService } from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function AlertsScreen() {
    const { t } = useTranslation();
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAlerts = async () => {
        try {
            const res = await alertService.getAlerts();
            setAlerts(res.data);
        } catch (err) {
            console.error('Failed to fetch alerts', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAlerts();
    };

    return (
        <View className="flex-1 bg-white">
            <Header title={t('alerts.title') || "Alerts"} />
            
            <ScrollView 
                className="flex-1 px-6 pt-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading && !refreshing ? (
                    <View className="py-20 items-center">
                        <ActivityIndicator size="large" color="#F43F5E" />
                        <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4">Fetching live alerts...</Text>
                    </View>
                ) : alerts.length === 0 ? (
                    <View className="py-20 items-center">
                        <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Active Alerts</Text>
                    </View>
                ) : (
                    <>
                        <View className="flex-row items-center mb-6">
                            <View className="bg-pink-100 px-4 py-1.5 rounded-full">
                                <Text className="text-pink-600 font-extrabold tracking-widest text-sm">
                                    {t('alerts.new_count', { count: alerts.length })}
                                </Text>
                            </View>
                        </View>

                        {alerts.map((alert) => (
                            <AlertDetailCard 
                                key={alert.id}
                                title={alert.title}
                                time={dayjs(alert.createdAt).fromNow()}
                                location={alert.location}
                                description={alert.message}
                                officer={alert.type}
                                mapLabel={t('alerts.view_map') || "View Map"}
                                variant={alert.type === 'EMERGENCY' ? 'danger' : alert.type === 'WARNING' ? 'warning' : 'info'}
                            />
                        ))}
                    </>
                )}
                
                <View className="h-10" />
            </ScrollView>
        </View>
    );
}

