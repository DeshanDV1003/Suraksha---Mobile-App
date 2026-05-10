import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HandHelping, Plus, X, MapPin, Users, Clock, ShieldCheck, ChevronLeft } from 'lucide-react-native';
import { helpRequestService } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';

export default function HelpRequestsScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Rescue',
        description: '',
        location: '',
        peopleCount: '1',
        priority: 'MEDIUM',
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await helpRequestService.getRequests();
            setRequests(res.data);
        } catch (error) {
            console.error('Failed to fetch help requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async () => {
        if (!formData.description || !formData.location) {
            Alert.alert(t('common.error') || 'Error', t('common.fill_required') || 'Please fill all required fields');
            return;
        }

        const data = {
            ...formData,
            peopleCount: parseInt(formData.peopleCount),
        };

        try {
            setIsSubmitting(true);
            await helpRequestService.createRequest(data);
            Alert.alert(t('common.success') || 'Success', t('common.report_success') || 'Help request submitted successfully');
            setShowModal(false);
            setFormData({ type: 'Rescue', description: '', location: '', peopleCount: '1', priority: 'MEDIUM' });
            fetchData();
        } catch (error) {
            console.error('Failed to submit request:', error);
            Alert.alert(t('common.error') || 'Error', t('common.report_fail') || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F8FAFC]">
            <View className="px-6 py-4 flex-row items-center justify-between bg-white border-b border-slate-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 rounded-full bg-slate-50">
                        <ChevronLeft size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-2xl font-black text-slate-900">{t('help_requests.title')}</Text>
                        <Text className="text-slate-500 font-medium">{t('help_requests.subtitle')}</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={() => setShowModal(true)}
                    className="w-10 h-10 bg-[#2563EB] rounded-full items-center justify-center shadow-lg shadow-blue-500/25"
                >
                    <Plus size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View className="py-20 items-center justify-center">
                        <ActivityIndicator size="large" color="#2563EB" />
                        <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4">{t('help_requests.scanning')}</Text>
                    </View>
                ) : requests.length === 0 ? (
                    <View className="bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-12 items-center space-y-4">
                        <HandHelping size={64} color="#E2E8F0" />
                        <Text className="text-xl font-bold text-slate-700">{t('help_requests.no_requests')}</Text>
                        <Text className="text-slate-400 text-center">{t('help_requests.no_requests_desc')}</Text>
                    </View>
                ) : (
                    <View className="space-y-6 pb-10">
                        {requests.map((request) => (
                            <View key={request.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
                                <View className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl ${request.priority === 'CRITICAL' ? 'bg-[#EF4444]' : 'bg-[#2563EB]'}`}>
                                    <Text className="text-white text-[10px] font-black uppercase tracking-widest">{request.priority}</Text>
                                </View>

                                <View className="space-y-6">
                                    <View className="flex-row items-center space-x-4">
                                        <View className="w-12 h-12 rounded-2xl bg-slate-50 items-center justify-center">
                                            <HandHelping size={24} color="#2563EB" />
                                        </View>
                                        <View>
                                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('help_requests.category')}</Text>
                                            <Text className="text-lg font-bold text-slate-900">{request.type}</Text>
                                        </View>
                                    </View>

                                    <Text className="text-slate-500 text-sm leading-relaxed" numberOfLines={3}>
                                        {request.description}
                                    </Text>

                                    <View className="flex-row justify-between">
                                        <View className="flex-row items-center space-x-2">
                                            <MapPin size={16} color="#CBD5E1" />
                                            <Text className="text-xs font-bold text-slate-600 w-24" numberOfLines={1}>{request.location}</Text>
                                        </View>
                                        <View className="flex-row items-center space-x-2">
                                            <Users size={16} color="#CBD5E1" />
                                            <Text className="text-xs font-bold text-slate-600">{request.peopleCount} {t('common.people') || 'People'}</Text>
                                        </View>
                                    </View>

                                    <View className="pt-6 border-t border-slate-50 flex-row items-center justify-between">
                                        <View className="flex-row items-center space-x-2">
                                            <Clock size={16} color="#94A3B8" />
                                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {dayjs(request.createdAt).fromNow()}
                                            </Text>
                                        </View>
                                        <View className={`px-3 py-1 rounded-full flex-row items-center space-x-1.5 ${request.verifierActions?.length > 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
                                            {request.verifierActions?.length > 0 ? (
                                                <>
                                                    <ShieldCheck size={14} color="#059669" />
                                                    <Text className="text-[10px] font-black text-green-600 uppercase">{t('help_requests.verified')}</Text>
                                                </>
                                            ) : (
                                                <>
                                                    <Clock size={14} color="#D97706" />
                                                    <Text className="text-[10px] font-black text-orange-500 uppercase">{t('help_requests.pending')}</Text>
                                                </>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Modal */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <View className="flex-1 bg-black/40 justify-end">
                    <View className="bg-white rounded-t-[2.5rem] p-8 space-y-6">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-2xl font-black text-slate-900">{t('help_requests.form_title')}</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)} className="p-2 bg-slate-100 rounded-full">
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="space-y-4 max-h-[500px]">
                            <View className="flex-row space-x-4">
                                <View className="flex-1 space-y-2">
                                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('help_requests.category')}</Text>
                                    <View className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
                                        <Picker
                                            selectedValue={formData.type}
                                            onValueChange={(itemValue) => setFormData({...formData, type: itemValue})}
                                        >
                                            <Picker.Item label={t('help_requests.cat_rescue') || "Rescue"} value="Rescue" />
                                            <Picker.Item label={t('help_requests.cat_medical') || "Medical"} value="Medical" />
                                            <Picker.Item label={t('help_requests.cat_food') || "Food/Water"} value="Food/Water" />
                                            <Picker.Item label={t('help_requests.cat_shelter') || "Shelter"} value="Shelter" />
                                            <Picker.Item label={t('help_requests.cat_supplies') || "Supplies"} value="Supplies" />
                                        </Picker>
                                    </View>
                                </View>
                                <View className="flex-1 space-y-2">
                                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('help_requests.priority')}</Text>
                                    <View className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
                                        <Picker
                                            selectedValue={formData.priority}
                                            onValueChange={(itemValue) => setFormData({...formData, priority: itemValue})}
                                        >
                                            <Picker.Item label={t('common.priority_medium') || "Medium"} value="MEDIUM" />
                                            <Picker.Item label={t('common.priority_high') || "High"} value="HIGH" />
                                            <Picker.Item label={t('common.priority_critical') || "Critical"} value="CRITICAL" />
                                        </Picker>
                                    </View>
                                </View>
                            </View>

                            <View className="space-y-2">
                                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('help_requests.location_details') || "Location Details"}</Text>
                                <TextInput 
                                    className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-slate-900"
                                    placeholder={t('help_requests.location_placeholder') || "Building, street, or GPS"}
                                    value={formData.location}
                                    onChangeText={(text) => setFormData({...formData, location: text})}
                                />
                            </View>

                            <View className="space-y-2">
                                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('help_requests.affected_persons') || "Affected Persons"}</Text>
                                <TextInput 
                                    className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-slate-900"
                                    keyboardType="numeric"
                                    placeholder={t('help_requests.people_placeholder') || "Number of people"}
                                    value={formData.peopleCount}
                                    onChangeText={(text) => setFormData({...formData, peopleCount: text})}
                                />
                            </View>

                            <View className="space-y-2">
                                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('help_requests.description')}</Text>
                                <TextInput 
                                    className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-slate-900 h-24 text-top"
                                    multiline
                                    numberOfLines={3}
                                    placeholder={t('help_requests.desc_placeholder') || "What kind of help is needed immediately?"}
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({...formData, description: text})}
                                />
                            </View>

                            <TouchableOpacity 
                                disabled={isSubmitting}
                                onPress={handleSubmit}
                                className="bg-[#2563EB] py-5 rounded-2xl items-center shadow-xl shadow-blue-500/25 mt-4"
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-black text-lg">{t('help_requests.submit')}</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

