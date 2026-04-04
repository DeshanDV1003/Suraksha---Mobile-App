import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { TaskStatsRow } from '../components/TasksScreen/TaskStatsRow';
import { TaskItemCard } from '../components/TasksScreen/TaskItemCard';

export default function TasksScreen() {
    const { t } = useTranslation();

    return (
        <View className="flex-1 bg-white">
            <Header title={t('tasks.title')} />
            
            <ScrollView className="flex-1 px-6 pt-4">
                <View className="flex-row justify-between items-center mb-6">
                    <View className="bg-[#D1FAE5] px-4 py-1.5 rounded-full">
                        <Text className="text-[#059669] font-extrabold tracking-widest text-sm">
                            {t('tasks.role')}
                        </Text>
                    </View>
                </View>

                <TaskStatsRow 
                    pending={2} 
                    active={1} 
                    completed={8} 
                    labels={{
                        pending: t('common.pending'),
                        active: t('common.in_progress'),
                        completed: t('common.completed')
                    }}
                />

                <TaskItemCard 
                    title="Flood Relief"
                    location="Kollupitiya Area"
                    description="Distribute emergency supplies to affected families"
                    time={t('alerts.min_ago', { count: 15 })}
                    status="pending"
                    labels={{
                        decline: t('common.decline'),
                        accept: t('common.accept'),
                        pending: t('common.pending'),
                        inProgress: t('common.in_progress'),
                        completed: t('common.completed')
                    }}
                    onAccept={() => {}}
                    onDecline={() => {}}
                />

                <TaskItemCard 
                    title="Medical Assistance"
                    location="Dehiwala"
                    description="First aid support needed for 3 affected individuals"
                    time={t('alerts.min_ago', { count: 30 })}
                    status="pending"
                    labels={{
                        decline: t('common.decline'),
                        accept: t('common.accept'),
                        pending: t('common.pending'),
                        inProgress: t('common.in_progress'),
                        completed: t('common.completed')
                    }}
                />

                <TaskItemCard 
                    title="Evacuation Support"
                    location="Wellawatta"
                    description="Assist elderly residents in evacuation to safe zones"
                    time={t('alerts.hour_ago', { count: 2 })}
                    status="in-progress"
                    labels={{
                        decline: t('common.decline'),
                        accept: t('common.accept'),
                        pending: t('common.pending'),
                        inProgress: t('common.in_progress'),
                        completed: t('common.completed')
                    }}
                />
            </ScrollView>
        </View>
    );
}
