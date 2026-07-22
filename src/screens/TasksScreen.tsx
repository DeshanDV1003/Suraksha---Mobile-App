import React from 'react';
import { ScrollView, View, Text, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { TaskItemCard } from '../components/TasksScreen/TaskItemCard';
import { volunteerService } from '../services/api';
import { ClipboardX, Clock, Play, CheckCircle2 } from 'lucide-react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

type TabFilter = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export default function TasksScreen() {
    const { t } = useTranslation();
    const [tasks, setTasks] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<TabFilter>('ALL');

    const fetchTasks = async () => {
        try {
            const res = await volunteerService.getMyTasks();
            setTasks(res.data || []);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => { fetchTasks(); }, []);

    const onRefresh = () => { setRefreshing(true); fetchTasks(); };

    const handleUpdateStatus = async (taskId: string, status: string) => {
        try {
            await volunteerService.updateTaskStatus(taskId, status);
            fetchTasks();
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };

    const pending    = tasks.filter(t => t.status === 'PENDING').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const completed  = tasks.filter(t => t.status === 'RESOLVED' || t.status === 'COMPLETED').length;

    const filtered = activeTab === 'ALL' ? tasks
        : activeTab === 'PENDING'     ? tasks.filter(t => t.status === 'PENDING')
        : activeTab === 'IN_PROGRESS' ? tasks.filter(t => t.status === 'IN_PROGRESS')
        : tasks.filter(t => t.status === 'RESOLVED' || t.status === 'COMPLETED');

    const tabs: { key: TabFilter; label: string; count: number; color: string }[] = [
        { key: 'ALL',         label: 'All',        count: tasks.length, color: '#0F172A' },
        { key: 'PENDING',     label: 'Pending',    count: pending,      color: '#D97706' },
        { key: 'IN_PROGRESS', label: 'Active',     count: inProgress,   color: '#2563EB' },
        { key: 'COMPLETED',   label: 'Done',       count: completed,    color: '#059669' },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header
                title={t('tasks.title') || 'My Tasks'}
                subtitle="Volunteer assignments"
            />

            {/* Stats row */}
            <View style={{ backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', gap: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                {[
                    { label: 'Pending', count: pending, color: '#F59E0B', icon: Clock },
                    { label: 'Active', count: inProgress, color: '#2563EB', icon: Play },
                    { label: 'Done', count: completed, color: '#10B981', icon: CheckCircle2 },
                ].map(({ label, count, color, icon: Icon }) => (
                    <View key={label} style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
                        <Icon size={18} color={color} strokeWidth={2} />
                        <Text style={{ color: '#0F172A', fontSize: 20, fontWeight: '900', marginTop: 4 }}>{count}</Text>
                        <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '600' }}>{label}</Text>
                    </View>
                ))}
            </View>

            {/* Filter tabs */}
            <View style={{ backgroundColor: 'white', paddingHorizontal: 16, paddingBottom: 12, paddingTop: 10 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key)}
                            activeOpacity={0.7}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 7,
                                borderRadius: 20,
                                backgroundColor: activeTab === tab.key ? tab.color : '#F8FAFC',
                                borderWidth: 1.5,
                                borderColor: activeTab === tab.key ? tab.color : '#E2E8F0',
                            }}
                        >
                            <Text style={{ color: activeTab === tab.key ? 'white' : '#64748B', fontSize: 12, fontWeight: '700' }}>
                                {tab.label} {tab.count > 0 ? `(${tab.count})` : ''}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
                showsVerticalScrollIndicator={false}
            >
                {loading && !refreshing ? (
                    <View style={{ paddingVertical: 80, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#059669" />
                    </View>
                ) : filtered.length === 0 ? (
                    <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                        <View style={{ width: 72, height: 72, backgroundColor: '#F1F5F9', borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <ClipboardX size={32} color="#CBD5E1" strokeWidth={1.5} />
                        </View>
                        <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '700', marginBottom: 6 }}>No tasks here</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center' }}>Check back soon for new assignments.</Text>
                    </View>
                ) : (
                    filtered.map((task) => (
                        <TaskItemCard
                            key={task.id}
                            title={task.title}
                            location={task.incident?.location || 'Location not set'}
                            description={task.description || ''}
                            time={dayjs(task.createdAt).fromNow()}
                            status={task.status?.toLowerCase().replace('_', '-') || 'pending'}
                            labels={{
                                decline: t('common.decline') || 'Decline',
                                accept: t('common.accept') || 'Accept',
                                pending: t('common.pending') || 'Pending',
                                inProgress: t('common.in_progress') || 'In Progress',
                                completed: t('common.completed') || 'Completed',
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
