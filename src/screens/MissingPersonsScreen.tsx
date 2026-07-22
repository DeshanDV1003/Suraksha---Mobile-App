import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserSearch, Plus, X, MapPin, Clock, User, Phone, ChevronLeft, Calendar, FileText } from 'lucide-react-native';
import { missingPersonService } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { useOfflineSubmit } from '../hooks/useOfflineSubmit';
import { useToast } from '../context/ToastContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { useTranslation } from 'react-i18next';

export default function MissingPersonsScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [persons, setPersons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        description: '',
        lastSeen: '',
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await missingPersonService.getMissing();
            setPersons(res.data);
        } catch (error) {
            console.error('Failed to fetch missing persons:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const { submit } = useOfflineSubmit('MISSING_PERSON_REPORT', '/api/missing-persons');
    const toast = useToast();

    const handleSubmit = async () => {
        if (!formData.name || !formData.age || !formData.description || !formData.lastSeen) {
            toast.error(t('common.error') || 'Error', t('common.fill_all') || 'Please fill all fields');
            return;
        }

        const data = {
            ...formData,
            age: parseInt(formData.age),
            photo: ''
        };

        try {
            setIsSubmitting(true);
            const result = await submit(data);
            
            if (result.queued) {
                toast.warning(t('common.offline_queued') || 'Queued', 'You are offline. Report will be submitted when you reconnect.');
            } else {
                toast.success(t('common.success') || 'Success', t('common.report_success') || 'Missing person reported successfully');
            }
            
            setShowModal(false);
            setFormData({ name: '', age: '', description: '', lastSeen: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to report missing person:', error);
            toast.error(t('common.error') || 'Error', t('common.report_fail') || 'Failed to report missing person');
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
                        <Text className="text-2xl font-black text-slate-900">{t('missing_persons.title')}</Text>
                        <Text className="text-slate-500 font-medium">{t('missing_persons.subtitle')}</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={() => setShowModal(true)}
                    className="w-10 h-10 bg-[#E11D48] rounded-full items-center justify-center shadow-lg shadow-red-500/25"
                >
                    <Plus size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View className="py-20 items-center justify-center">
                        <ActivityIndicator size="large" color="#E11D48" />
                        <Text className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4">{t('missing_persons.scanning')}</Text>
                    </View>
                ) : persons.length === 0 ? (
                    <View className="bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-12 items-center space-y-4">
                        <UserSearch size={64} color="#E2E8F0" />
                        <Text className="text-xl font-bold text-slate-700">{t('missing_persons.no_reports')}</Text>
                        <Text className="text-slate-400 text-center">{t('missing_persons.no_reports_desc')}</Text>
                    </View>
                ) : (
                    <View className="space-y-6 pb-10">
                        {persons.map((person) => (
                            <View key={person.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm overflow-hidden">
                                <View className="h-48 -mx-6 -mt-6 mb-6 bg-slate-50 items-center justify-center relative">
                                    <User size={64} color="#E2E8F0" />
                                    {person.status === 'FOUND' && (
                                        <View className="absolute top-4 right-4 bg-[#10B981] px-4 py-1.5 rounded-full shadow-lg">
                                            <Text className="text-white text-[10px] font-black uppercase tracking-widest">{t('missing_persons.found')}</Text>
                                        </View>
                                    )}
                                </View>

                                <View className="space-y-4">
                                    <View className="flex-row justify-between items-start">
                                        <View>
                                            <Text className="text-lg font-black text-slate-900">{person.name}</Text>
                                            <Text className="text-xs font-bold text-slate-400">{person.age} {t('missing_persons.age_suffix') || 'Years Old'}</Text>
                                        </View>
                                    </View>

                                    <View className="space-y-2">
                                        <View className="flex-row items-center">
                                            <MapPin size={16} color="#F43F5E" />
                                            <Text className="text-slate-500 text-xs font-bold ml-2 flex-1" numberOfLines={1}>
                                                {t('missing_persons.last_seen')}: {person.lastSeen}
                                            </Text>
                                        </View>
                                        <Text className="text-slate-400 text-xs leading-relaxed" numberOfLines={2}>
                                            {person.description}
                                        </Text>
                                    </View>

                                    <View className="pt-4 border-t border-slate-50 flex-row items-center justify-between">
                                        <View className="flex-row items-center">
                                            <Clock size={14} color="#94A3B8" />
                                            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-2">
                                                {dayjs(person.createdAt).fromNow()}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setSelectedPerson(person)}>
                                            <Text className="text-[10px] font-black text-[#E11D48] uppercase tracking-widest">{t('missing_persons.view_details')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Emergency Card */}
                <View className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8 mb-10 items-center space-y-4">
                    <View className="w-16 h-16 rounded-2xl bg-[#3B82F6] items-center justify-center">
                        <Phone size={32} color="white" />
                    </View>
                    <View className="items-center">
                        <Text className="text-xl font-black text-blue-900">{t('missing_persons.emergency_hotline')}</Text>
                        <Text className="text-blue-700 font-medium mt-1 text-center">
                            {t('missing_persons.emergency_desc') || "If you have immediate information, call 119 or our rescue center at +94 112 345 678"}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => Linking.openURL('tel:119')}
                        className="px-8 py-4 bg-white rounded-2xl border border-blue-100 shadow-sm w-full items-center"
                    >
                        <Text className="text-[#3B82F6] font-bold">{t('missing_persons.call_now')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* View Details Modal */}
            <Modal
                visible={!!selectedPerson}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedPerson(null)}
            >
                <View className="flex-1 bg-black/40 justify-end">
                    <View className="bg-white rounded-t-[2.5rem] p-8">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-2xl font-black text-slate-900">{t('missing_persons.details') || 'Person Details'}</Text>
                            <TouchableOpacity onPress={() => setSelectedPerson(null)} className="p-2 bg-slate-100 rounded-full">
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        {selectedPerson && (
                            <View className="space-y-4">
                                <View className="bg-slate-50 rounded-2xl p-4 items-center">
                                    <User size={64} color="#CBD5E1" />
                                    {selectedPerson.status === 'FOUND' && (
                                        <View className="mt-2 bg-[#10B981] px-4 py-1 rounded-full">
                                            <Text className="text-white text-xs font-black uppercase">{t('missing_persons.found')}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text className="text-2xl font-black text-slate-900">{selectedPerson.name}</Text>
                                <Text className="text-slate-500 font-bold">{selectedPerson.age} {t('missing_persons.age_suffix') || 'Years Old'} • {selectedPerson.gender || ''}</Text>
                                <View className="flex-row items-center">
                                    <MapPin size={16} color="#F43F5E" />
                                    <Text className="text-slate-600 font-bold ml-2 flex-1">{t('missing_persons.last_seen')}: {selectedPerson.lastSeen}</Text>
                                </View>
                                <View className="flex-row items-start">
                                    <FileText size={16} color="#94A3B8" />
                                    <Text className="text-slate-500 ml-2 flex-1 leading-relaxed">{selectedPerson.description}</Text>
                                </View>
                                {selectedPerson.contactPhone && (
                                    <TouchableOpacity
                                        onPress={() => Linking.openURL(`tel:${selectedPerson.contactPhone}`)}
                                        className="flex-row items-center bg-blue-50 p-4 rounded-2xl"
                                    >
                                        <Phone size={20} color="#3B82F6" />
                                        <Text className="text-[#3B82F6] font-bold ml-3">{selectedPerson.contactName}: {selectedPerson.contactPhone}</Text>
                                    </TouchableOpacity>
                                )}
                                <View className="flex-row items-center">
                                    <Clock size={14} color="#94A3B8" />
                                    <Text className="text-slate-400 text-xs font-bold ml-2">{t('missing_persons.reported')}: {dayjs(selectedPerson.createdAt).fromNow()}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Report Modal */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <View className="flex-1 bg-black/40 justify-end">
                    <View className="bg-white rounded-t-[2.5rem] p-8 space-y-6">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-2xl font-black text-slate-900">{t('missing_persons.report_new')}</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)} className="p-2 bg-slate-100 rounded-full">
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View className="space-y-4">
                            <View className="flex-row space-x-4">
                                <View className="flex-1 space-y-2">
                                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('missing_persons.full_name')}</Text>
                                    <TextInput 
                                        className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-slate-900"
                                        placeholder={t('missing_persons.name_placeholder') || "Legal name"}
                                        value={formData.name}
                                        onChangeText={(text) => setFormData({...formData, name: text})}
                                    />
                                </View>
                                <View className="w-24 space-y-2">
                                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('missing_persons.age')}</Text>
                                    <TextInput 
                                        className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-slate-900"
                                        keyboardType="numeric"
                                        placeholder={t('missing_persons.age_placeholder') || "Age"}
                                        value={formData.age}
                                        onChangeText={(text) => setFormData({...formData, age: text})}
                                    />
                                </View>
                            </View>

                            <View className="space-y-2">
                                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('missing_persons.last_seen')}</Text>
                                <TextInput 
                                    className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-slate-900"
                                    placeholder={t('missing_persons.last_seen_placeholder') || "City, Street, or Landmark"}
                                    value={formData.lastSeen}
                                    onChangeText={(text) => setFormData({...formData, lastSeen: text})}
                                />
                            </View>

                            <View className="space-y-2">
                                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('missing_persons.description')}</Text>
                                <TextInput 
                                    className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-slate-900 h-24 text-top"
                                    multiline
                                    numberOfLines={3}
                                    placeholder={t('missing_persons.desc_placeholder') || "Appearance, Clothes, etc."}
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({...formData, description: text})}
                                />
                            </View>

                            <TouchableOpacity 
                                disabled={isSubmitting}
                                onPress={handleSubmit}
                                className="bg-[#E11D48] py-5 rounded-2xl items-center shadow-xl shadow-red-500/25 mt-4"
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-black text-lg">{t('missing_persons.submit')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

