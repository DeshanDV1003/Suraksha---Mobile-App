import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Eye, Phone, Plus, X, Search, ChevronLeft } from 'lucide-react-native';
import { resourceService } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { useOfflineSubmit } from '../hooks/useOfflineSubmit';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';

export default function ResourcesScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: '',
        owner: '',
        location: '',
        capacity: '',
        contact: '',
    });

    const fetchResources = async () => {
        try {
            setLoading(true);
            const res = await resourceService.getResources();
            setResources(res.data);
        } catch (error) {
            console.error('Failed to fetch resources:', error);
            Alert.alert(t('common.error') || 'Error', t('resources.load_fail') || 'Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const { submit } = useOfflineSubmit('RESOURCE_SUBMISSION', '/api/resources');
    const toast = useToast();

    const handleSubmit = async () => {
        if (!formData.type || !formData.owner || !formData.location || !formData.contact) {
            toast.error(t('common.error') || 'Error', t('common.fill_all') || 'Please fill all fields');
            return;
        }

        try {
            setIsSubmitting(true);
            const result = await submit(formData);
            
            if (result.queued) {
                toast.warning(t('common.offline_queued') || 'Queued', 'You are offline. Resource will be submitted when you reconnect.');
            } else {
                toast.success(t('common.success') || 'Success', t('resources.add_success') || 'Resource added successfully');
            }
            
            setShowModal(false);
            setFormData({ type: '', owner: '', location: '', capacity: '', contact: '' });
            fetchResources();
        } catch (error) {
            console.error('Failed to add resource:', error);
            toast.error(t('common.error') || 'Error', t('resources.add_fail') || 'Failed to add resource');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredResources = resources.filter(r => 
        r.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: t('resources.cat_boats') || 'Boats', value: resources.filter(r => r.type.toLowerCase().includes('boat') && r.status === 'AVAILABLE').length, color: 'text-blue-600' },
        { label: t('resources.cat_vehicles') || 'Vehicles', value: resources.filter(r => r.type.toLowerCase().includes('vehicle') || r.type.toLowerCase().includes('truck')).length, color: 'text-green-600' },
        { label: t('resources.cat_generators') || 'Generators', value: resources.filter(r => r.type.toLowerCase().includes('generator')).length, color: 'text-purple-600' },
        { label: t('resources.cat_shelter') || 'Shelter', value: resources.filter(r => r.type.toLowerCase().includes('room') || r.type.toLowerCase().includes('shelter')).length, color: 'text-orange-600' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-[#F8FAFC]">
            <View className="px-6 py-4 flex-row items-center justify-between bg-white border-b border-slate-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 rounded-full bg-slate-50">
                        <ChevronLeft size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-2xl font-black text-slate-900">{t('resources.title')}</Text>
                        <Text className="text-slate-500 font-medium">{t('resources.subtitle')}</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={() => setShowModal(true)}
                    className="w-10 h-10 bg-[#0061ff] rounded-full items-center justify-center shadow-lg shadow-blue-500/25"
                >
                    <Plus size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View className="px-6 py-4 bg-white">
                <View className="flex-row items-center bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl">
                    <Search size={20} color="#94A3B8" />
                    <TextInput 
                        className="flex-1 ml-3 font-bold text-slate-900"
                        placeholder={t('resources.search_placeholder') || "Search resources..."}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                {/* Stats Grid */}
                <View className="flex-row flex-wrap -mx-2 mb-6">
                    {stats.map((stat, i) => (
                        <View key={i} className="w-1/2 px-2 mb-4">
                            <View className="bg-white p-6 rounded-[1.5rem] items-center justify-center shadow-sm border border-slate-50">
                                <Text className={`text-2xl font-black ${stat.color}`}>{stat.value}</Text>
                                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {loading ? (
                    <View className="py-20 items-center justify-center">
                        <ActivityIndicator size="large" color="#0061ff" />
                        <Text className="text-slate-400 font-medium mt-4">{t('common.loading') || "Loading..."}</Text>
                    </View>
                ) : filteredResources.length === 0 ? (
                    <View className="py-20 items-center">
                        <Package size={64} color="#E2E8F0" />
                        <Text className="text-slate-400 font-bold mt-4 text-center">
                            {searchQuery ? `${t('resources.no_match') || "No matching resources found for"} "${searchQuery}"` : t('resources.no_resources') || 'No resources found. Add one to get started!'}
                        </Text>
                    </View>
                ) : (
                    <View className="space-y-4 pb-10">
                        {filteredResources.map((resource) => (
                            <View key={resource.id} className="bg-white border border-slate-50 rounded-3xl p-6 shadow-sm">
                                <View className="flex-row justify-between items-start mb-4">
                                    <View className="flex-1">
                                        <Text className="text-lg font-black text-[#1e293b]">{resource.type}</Text>
                                        <Text className="text-sm font-semibold text-slate-400">{resource.owner}</Text>
                                    </View>
                                    <View className={`px-3 py-1 rounded-full ${resource.status === 'AVAILABLE' ? 'bg-green-50' : 'bg-slate-100'}`}>
                                        <Text className={`text-[10px] font-bold uppercase tracking-wide ${resource.status === 'AVAILABLE' ? 'text-green-600' : 'text-slate-500'}`}>
                                            {resource.status}
                                        </Text>
                                    </View>
                                </View>

                                <View className="space-y-2 mb-6">
                                    <View className="flex-row items-center">
                                        <View className="w-1 h-1 rounded-full bg-slate-300 mr-3" />
                                        <Text className="text-sm font-semibold text-slate-400 flex-1">{resource.location}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <View className="w-1 h-1 rounded-full bg-slate-300 mr-3" />
                                        <Text className="text-sm font-semibold text-slate-400 flex-1">{t('resources.capacity') || 'Capacity'}: {resource.capacity}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between pt-4 border-t border-slate-50">
                                    <Text className="text-xs font-bold text-slate-400">{resource.contact}</Text>
                                    <View className="flex-row space-x-4">
                                        <TouchableOpacity 
                                            onPress={() => Alert.alert(t('common.details') || 'Details', `Type: ${resource.type}\nOwner: ${resource.owner}\nLocation: ${resource.location}\nCapacity: ${resource.capacity}\nContact: ${resource.contact}`)}
                                            className="p-2 bg-blue-50 rounded-full"
                                        >
                                            <Eye size={20} color="#2563EB" />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            onPress={() => Linking.openURL(`tel:${resource.contact}`)}
                                            className="p-2 bg-blue-50 rounded-full"
                                        >
                                            <Phone size={20} color="#00AEEF" />
                                        </TouchableOpacity>
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
                            <Text className="text-2xl font-black text-slate-900">{t('resources.form_title')}</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)} className="p-2 bg-slate-100 rounded-full">
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View className="space-y-4">
                            <View className="space-y-2">
                                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{t('resources.type')}</Text>
                                <TextInput 
                                    className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-slate-900"
                                    placeholder={t('resources.type_placeholder') || "e.g. Boat, Pickup Truck"}
                                    value={formData.type}
                                    onChangeText={(text) => setFormData({...formData, type: text})}
                                />
                            </View>

                            <View className="flex-row space-x-4">
                                <View className="flex-1 space-y-2">
                                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{t('resources.owner') || "Owner Name"}</Text>
                                    <TextInput 
                                        className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-slate-900"
                                        placeholder={t('resources.owner_placeholder') || "Full name"}
                                        value={formData.owner}
                                        onChangeText={(text) => setFormData({...formData, owner: text})}
                                    />
                                </View>
                                <View className="flex-1 space-y-2">
                                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{t('resources.location')}</Text>
                                    <TextInput 
                                        className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-slate-900"
                                        placeholder={t('resources.location_placeholder') || "City/Area"}
                                        value={formData.location}
                                        onChangeText={(text) => setFormData({...formData, location: text})}
                                    />
                                </View>
                            </View>

                            <View className="flex-row space-x-4">
                                <View className="flex-1 space-y-2">
                                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{t('resources.capacity')}</Text>
                                    <TextInput 
                                        className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-slate-900"
                                        placeholder={t('resources.capacity_placeholder') || "e.g. 6 people, 5kW"}
                                        value={formData.capacity}
                                        onChangeText={(text) => setFormData({...formData, capacity: text})}
                                    />
                                </View>
                                <View className="flex-1 space-y-2">
                                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{t('resources.contact') || "Contact Number"}</Text>
                                    <TextInput 
                                        className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-slate-900"
                                        placeholder={t('resources.contact_placeholder') || "Phone number"}
                                        keyboardType="phone-pad"
                                        value={formData.contact}
                                        onChangeText={(text) => setFormData({...formData, contact: text})}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity 
                                disabled={isSubmitting}
                                onPress={handleSubmit}
                                className="bg-[#0061ff] py-5 rounded-2xl items-center shadow-xl shadow-blue-500/25 mt-4"
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-black text-lg">{t('resources.submit')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

