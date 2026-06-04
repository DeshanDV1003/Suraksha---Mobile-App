import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeartPulse, Plus, X, Shield, Users, Clock, MessageSquare, Heart, Sparkles, ChevronLeft } from 'lucide-react-native';
import { supportService } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { useOfflineSubmit } from '../hooks/useOfflineSubmit';
import { useToast } from '../context/ToastContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function SupportScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: 'TRAUMA_CARE',
        description: '',
        urgency: 'MEDIUM',
        anonymous: false,
        location: '',
        affectedCount: '1'
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await supportService.getRequests();
            setRequests(res.data);
        } catch (error) {
            console.error('Failed to fetch support requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const { submit } = useOfflineSubmit('PSYCHOLOGICAL_SUPPORT', '/api/support');
    const toast = useToast();

    const handleSubmit = async () => {
        if (!formData.description) {
            toast.error(t('common.error') || 'Error', t('support.fill_desc') || 'Please share how we can help');
            return;
        }

        const data = {
            ...formData,
            affectedCount: parseInt(formData.affectedCount),
        };

        try {
            setIsSubmitting(true);
            const result = await submit(data);
            
            if (result.queued) {
                toast.warning(t('common.offline_queued') || 'Queued', 'You are offline. Your request will be submitted when you reconnect.');
            } else {
                toast.success(t('common.success') || 'Request Submitted', t('support.request_success') || 'A counselor will contact you soon.');
            }
            
            setShowModal(false);
            setFormData({ type: 'TRAUMA_CARE', description: '', urgency: 'MEDIUM', anonymous: false, location: '', affectedCount: '1' });
            fetchData();
        } catch (error) {
            console.error('Failed to submit support request:', error);
            toast.error(t('common.error') || 'Error', t('common.report_fail') || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F8FAFC]">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <LinearGradient
                    colors={['#4F46E5', '#7C3AED', '#EC4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-8 pt-12 rounded-b-[3rem] space-y-6"
                >
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-white/10 rounded-full border border-white/10">
                            <ChevronLeft size={24} color="white" />
                        </TouchableOpacity>
                        <View className="flex-row items-center space-x-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                            <Sparkles size={14} color="#FDE047" />
                            <Text className="text-white text-[10px] font-black uppercase tracking-widest">{t('support.wellbeing') || 'Mental Well-being'}</Text>
                        </View>
                    </View>

                    <View className="space-y-4">
                        <Text className="text-4xl font-black text-white leading-tight">{t('support.header_title') || 'You are not alone in this.'}</Text>
                        <Text className="text-white/80 font-medium text-base">
                            {t('support.header_desc') || "Disasters are overwhelming. Our certified trauma counselors are available 24/7 to help you."}
                        </Text>
                    </View>

                    <View className="flex-row space-x-4 pt-2">
                        <TouchableOpacity 
                            onPress={() => setShowModal(true)}
                            className="bg-white px-6 py-4 rounded-2xl flex-1 items-center shadow-lg"
                        >
                            <Text className="text-indigo-600 font-black">{t('support.talk_now') || 'Talk to a Counselor'}</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <View className="px-6 py-8 space-y-8">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-2xl font-black text-slate-900 tracking-tight">{t('support.active_sessions') || 'Active Sessions'}</Text>
                        <View className="flex-row items-center space-x-2">
                            <View className="w-2 h-2 bg-green-500 rounded-full" />
                            <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest">{t('support.online') || 'Counselors Online'}</Text>
                        </View>
                    </View>

                    {loading ? (
                        <View className="py-12 items-center">
                            <ActivityIndicator size="large" color="#4F46E5" />
                            <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4">{t('support.scanning')}</Text>
                        </View>
                    ) : requests.length === 0 ? (
                        <View className="bg-white border border-slate-100 rounded-[3rem] p-12 items-center space-y-6 shadow-sm">
                            <View className="w-20 h-20 bg-indigo-50 rounded-full items-center justify-center">
                                <HeartPulse size={40} color="#818CF8" />
                            </View>
                            <View className="items-center">
                                <Text className="text-xl font-black text-slate-900">{t('support.no_requests')}</Text>
                                <Text className="text-slate-400 text-center font-medium mt-1">{t('support.no_requests_desc') || "Don't hesitate to reach out if you need someone to talk to."}</Text>
                            </View>
                        </View>
                    ) : (
                        <View className="space-y-6">
                            {requests.map((request) => (
                                <View key={request.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                                    <View className="flex-row items-center space-x-3 mb-4">
                                        <View className={`px-4 py-1.5 rounded-full ${request.urgency === 'CRITICAL' ? 'bg-red-50' : 'bg-blue-50'}`}>
                                            <Text className={`text-[10px] font-black uppercase tracking-widest ${request.urgency === 'CRITICAL' ? 'text-red-600' : 'text-blue-600'}`}>
                                                {request.urgency} {t('support.priority_suffix') || 'Priority'}
                                            </Text>
                                        </View>
                                        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{request.type}</Text>
                                    </View>

                                    <Text className="text-xl font-black text-slate-900 leading-tight mb-2">
                                        {request.anonymous ? t('support.anonymous_req') || 'Anonymous Support Request' : `${t('support.session_for') || 'Session for'} ${request.user?.name || 'User'}`}
                                    </Text>
                                    <Text className="text-slate-500 font-medium leading-relaxed mb-6" numberOfLines={3}>
                                        {request.description}
                                    </Text>
                                    
                                    <View className="flex-row items-center space-x-6 pt-6 border-t border-slate-50">
                                        <View className="flex-row items-center space-x-2">
                                            <Clock size={16} color="#94A3B8" />
                                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {dayjs(request.createdAt).fromNow()}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center space-x-2">
                                            <Users size={16} color="#94A3B8" />
                                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{request.affectedCount} {t('common.affected') || 'Affected'}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Why speak up section */}
                    <View className="bg-white border border-slate-100 rounded-[3rem] p-10 space-y-8 shadow-sm">
                        <Text className="text-2xl font-black text-slate-900">{t('support.why_speak') || 'Why Speak Up?'}</Text>
                        <View className="space-y-6">
                            <View className="flex-row space-x-5">
                                <View className="w-14 h-14 rounded-2xl bg-indigo-50 items-center justify-center">
                                    <Shield size={28} color="#6366F1" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-black text-slate-900">{t('support.confidential') || '100% Confidential'}</Text>
                                    <Text className="text-sm text-slate-500 font-medium leading-relaxed mt-1">{t('support.confidential_desc') || "Your identity can remain anonymous throughout the process."}</Text>
                                </View>
                            </View>
                            <View className="flex-row space-x-5">
                                <View className="w-14 h-14 rounded-2xl bg-pink-50 items-center justify-center">
                                    <Heart size={28} color="#EC4899" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-black text-slate-900">{t('support.expert_care') || 'Expert Care'}</Text>
                                    <Text className="text-sm text-slate-500 font-medium leading-relaxed mt-1">{t('support.expert_desc') || "Certified trauma specialists with emergency experience."}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Modal */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <View className="flex-1 bg-indigo-950/40 justify-end">
                    <View className="bg-white rounded-t-[3.5rem] p-10 space-y-8">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-2xl font-black text-slate-900">{t('support.form_title')}</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)} className="p-2 bg-slate-100 rounded-full">
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="space-y-6 max-h-[500px]">
                            <View className="flex-row space-x-4">
                                <View className="flex-1 space-y-2">
                                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('support.topic')}</Text>
                                    <View className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden">
                                        <Picker
                                            selectedValue={formData.type}
                                            onValueChange={(itemValue) => setFormData({...formData, type: itemValue})}
                                        >
                                            <Picker.Item label={t('support.cat_trauma') || "Trauma Care"} value="TRAUMA_CARE" />
                                            <Picker.Item label={t('support.cat_grief') || "Grief Support"} value="GRIEF_SUPPORT" />
                                            <Picker.Item label={t('support.cat_counseling') || "Counseling"} value="COUNSELING" />
                                            <Picker.Item label={t('support.cat_child') || "Child Support"} value="CHILD_SUPPORT" />
                                        </Picker>
                                    </View>
                                </View>
                                <View className="flex-1 space-y-2">
                                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('support.urgency')}</Text>
                                    <View className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden">
                                        <Picker
                                            selectedValue={formData.urgency}
                                            onValueChange={(itemValue) => setFormData({...formData, urgency: itemValue})}
                                        >
                                            <Picker.Item label={t('common.urgency_low') || "Routine"} value="LOW" />
                                            <Picker.Item label={t('common.urgency_medium') || "Immediate"} value="MEDIUM" />
                                            <Picker.Item label={t('common.urgency_high') || "Urgent"} value="HIGH" />
                                            <Picker.Item label={t('common.urgency_critical') || "Crisis"} value="CRITICAL" />
                                        </Picker>
                                    </View>
                                </View>
                            </View>

                            <View className="space-y-2">
                                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('support.how_help') || "How can we help?"}</Text>
                                <TextInput 
                                    className="bg-slate-50 border border-slate-100 px-6 py-5 rounded-[2rem] font-bold text-slate-900 h-32 text-top"
                                    multiline
                                    numberOfLines={4}
                                    placeholder={t('support.desc_placeholder') || "Feel free to share what's on your mind..."}
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({...formData, description: text})}
                                />
                            </View>

                            <View className="flex-row items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <View className="flex-1 mr-4">
                                    <Text className="text-sm font-black text-slate-900 uppercase tracking-tight">{t('support.anonymous') || 'Stay Anonymous'}</Text>
                                    <Text className="text-xs text-slate-400 font-medium">{t('support.anonymous_desc') || 'Identify only by a secure ID'}</Text>
                                </View>
                                <Switch 
                                    value={formData.anonymous}
                                    onValueChange={(value) => setFormData({...formData, anonymous: value})}
                                    trackColor={{ false: '#CBD5E1', true: '#6366F1' }}
                                    thumbColor={formData.anonymous ? '#FFFFFF' : '#F1F5F9'}
                                />
                            </View>

                            <TouchableOpacity 
                                disabled={isSubmitting}
                                onPress={handleSubmit}
                                className="bg-indigo-600 py-6 rounded-[2rem] items-center shadow-xl shadow-indigo-500/30"
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-black text-lg">{t('support.submit')}</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
