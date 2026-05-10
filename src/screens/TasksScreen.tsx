import React from 'react';
import { ScrollView, View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { TaskStatsRow } from '../components/TasksScreen/TaskStatsRow';
import { TaskItemCard } from '../components/TasksScreen/TaskItemCard';
import { volunteerService } from '../services/api';

export default function TasksScreen() {
    const { t } = useTranslation();
    const [tasks, setTasks] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchTasks = async () => {
        try {
            const res = await volunteerService.getMyTasks();
            setTasks(res.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => {
        fetchTasks();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTasks();
    };

    const handleUpdateStatus = async (taskId: string, status: string) => {
        try {
            await volunteerService.updateTaskStatus(taskId, status);
            fetchTasks();
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <Header title={t('tasks.title')} />
            
            <ScrollView 
                className="flex-1 px-6 pt-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View className="flex-row justify-between items-center mb-6">
                    <View className="bg-[#D1FAE5] px-4 py-1.5 rounded-full">
                        <Text className="text-[#059669] font-extrabold tracking-widest text-sm">
                            {t('tasks.role')}
                        </Text>
                    </View>
                </View>

                <TaskStatsRow 
                    pending={tasks.filter(t => t.status === 'PENDING').length} 
                    active={tasks.filter(t => t.status === 'IN_PROGRESS').length} 
                    completed={tasks.filter(t => t.status === 'RESOLVED').length} 
                    labels={{
                        pending: t('common.pending'),
                        active: t('common.in_progress'),
                        completed: t('common.completed')
                    }}
                />

                {loading && !refreshing ? (
                    <View className="py-20 items-center">
                        <ActivityIndicator size="large" color="#059669" />
                    </View>
                ) : tasks.length === 0 ? (
                    <View className="py-20 items-center">
                        <Text className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Tasks Assigned</Text>
                    </View>
                ) : (
                    tasks.map((task) => (
                        <TaskItemCard 
                            key={task.id}
                            title={task.title}
                            location={task.incident?.location || "N/A"}
                            description={task.description}
                            time={t('alerts.min_ago', { count: 15 })} // Placeholder or use createdAt
                            status={task.status.toLowerCase()}
                            labels={{
                                decline: t('common.decline'),
                                accept: t('common.accept'),
                                pending: t('common.pending'),
                                inProgress: t('common.in_progress'),
                                completed: t('common.completed')
                            }}
                            onAccept={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                            onDecline={() => handleUpdateStatus(task.id, 'PENDING')}
                        />
                    ))
                )}
            </ScrollView>
        </View>
    );
}
