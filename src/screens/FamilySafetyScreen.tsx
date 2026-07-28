import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, ActivityIndicator,
    Modal, TextInput, TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '../components/common/Header';
import { StatusActionCard } from '../components/FamilySafetyScreen/StatusActionCard';
import { FamilyMemberCard } from '../components/FamilySafetyScreen/FamilyMemberCard';
import {
    CheckCircle2, AlertTriangle, User, Building2,
    Plus, X, Zap,
} from 'lucide-react-native';
import { familyService } from '../services/api';
import * as Location from 'expo-location';
import { useToast } from '../context/ToastContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    SAFE:       { bg: '#D1FAE5', text: '#065F46', label: 'Safe' },
    NEEDS_HELP: { bg: '#FEE2E2', text: '#991B1B', label: 'Needs Help' },
    SHELTERED:  { bg: '#DBEAFE', text: '#1E40AF', label: 'Sheltered' },
    UNKNOWN:    { bg: '#FEF3C7', text: '#92400E', label: 'Unknown' },
};

export default function FamilySafetyScreen() {
    const { t } = useTranslation();
    const toast = useToast();

    const [myStatus, setMyStatus] = useState<any>(null);
    const [familyMembers, setFamilyMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Add member modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [memberName, setMemberName] = useState('');
    const [memberRelation, setMemberRelation] = useState('');
    const [addingMember, setAddingMember] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await familyService.getMyStatus();
            if (res.data) {
                setMyStatus(res.data.myStatus || null);
                setFamilyMembers(res.data.familyMembers || []);
            }
        } catch {
            // silently fail — show empty state
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchData(); }, []));

    const handleStatusUpdate = async (newStatus: string) => {
        setSubmitting(true);
        try {
            let coords = null;
            const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
            if (locStatus === 'granted') {
                const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                coords = pos.coords;
            }

            await familyService.reportStatus({
                status: newStatus,
                latitude: coords?.latitude ?? null,
                longitude: coords?.longitude ?? null,
                message: `Status updated to ${newStatus}`,
            });

            toast.success(t('common.success'), t('safety.status_updated') || 'Your safety status has been updated.');
            fetchData();
        } catch {
            toast.error(t('common.error'), t('safety.status_failed') || 'Failed to update status. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddMember = async () => {
        if (!memberName.trim()) {
            toast.error(t('common.error'), 'Please enter the family member\'s name.');
            return;
        }
        setAddingMember(true);
        try {
            await familyService.addMember({
                name: memberName.trim(),
                relation: memberRelation.trim() || 'Family',
                status: 'UNKNOWN',
            });
            toast.success(t('common.success'), `${memberName} added to your family group.`);
            setMemberName('');
            setMemberRelation('');
            setShowAddModal(false);
            fetchData();
        } catch {
            toast.error(t('common.error'), 'Failed to add family member.');
        } finally {
            setAddingMember(false);
        }
    };

    const statusActions = [
        {
            title: t('safety.i_am_safe') || 'I Am Safe',
            description: t('safety.i_am_safe_desc') || 'Report that you are safe',
            icon: CheckCircle2,
            colors: ['#22C55E', '#10B981'] as [string, string],
            statusValue: 'SAFE',
        },
        {
            title: t('safety.i_need_help') || 'I Need Help',
            description: t('safety.i_need_help_desc') || 'Request immediate assistance',
            icon: AlertTriangle,
            colors: ['#EF4444', '#F97316'] as [string, string],
            statusValue: 'NEEDS_HELP',
        },
        {
            title: t('safety.member_missing') || 'Member Missing',
            description: t('safety.member_missing_desc') || 'Report a missing family member',
            icon: User,
            colors: ['#F97316', '#EAB308'] as [string, string],
            statusValue: 'UNKNOWN',
        },
        {
            title: t('safety.reached_shelter') || 'Reached Shelter',
            description: t('safety.reached_shelter_desc') || 'I am safe at a shelter',
            icon: Building2,
            colors: ['#3B82F6', '#0EA5E9'] as [string, string],
            statusValue: 'SHELTERED',
        },
    ];

    const myStatusConfig = myStatus ? STATUS_COLORS[myStatus.status] : null;

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header title={t('safety.title') || 'Family Safety'} subtitle={t('safety.subtitle') || 'Report and track your family\'s status'} showBack />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>

                {/* My current status banner */}
                {myStatusConfig && (
                    <View style={{ backgroundColor: myStatusConfig.bg, borderRadius: 16, padding: 14, marginTop: 16, marginBottom: 4, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: myStatusConfig.text, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                {t('safety.my_current_status') || 'My Current Status'}
                            </Text>
                            <Text style={{ color: myStatusConfig.text, fontSize: 18, fontWeight: '900', marginTop: 2 }}>
                                {myStatusConfig.label}
                            </Text>
                        </View>
                        <Text style={{ color: myStatusConfig.text + '99', fontSize: 11 }}>
                            {dayjs(myStatus.createdAt).fromNow()}
                        </Text>
                    </View>
                )}

                {/* Status action cards */}
                <Text style={{ color: '#0F172A', fontSize: 17, fontWeight: '800', marginTop: 20, marginBottom: 12 }}>
                    {t('safety.update_status') || 'Update Your Status'}
                </Text>

                {statusActions.map((action) => (
                    <StatusActionCard
                        key={action.statusValue}
                        title={action.title}
                        description={action.description}
                        icon={action.icon}
                        colors={action.colors}
                        onPress={() => !submitting && handleStatusUpdate(action.statusValue)}
                    />
                ))}

                {submitting && (
                    <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#10B981" />
                    </View>
                )}

                {/* Family members section */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 12 }}>
                    <Text style={{ color: '#0F172A', fontSize: 17, fontWeight: '800' }}>
                        {t('safety.family_members') || 'Family Members'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowAddModal(true)}
                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E3A8A', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}
                    >
                        <Plus size={14} color="white" strokeWidth={2.5} />
                        <Text style={{ color: 'white', fontSize: 13, fontWeight: '700', marginLeft: 5 }}>
                            {t('safety.add_member') || 'Add'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#1E3A8A" />
                    </View>
                ) : familyMembers.length === 0 ? (
                    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, alignItems: 'center' }}>
                        <Text style={{ color: '#64748B', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
                            {t('safety.no_members') || 'No family members added yet.\nTap Add to register your family.'}
                        </Text>
                    </View>
                ) : (
                    familyMembers.map((member: any) => (
                        <FamilyMemberCard
                            key={member.id}
                            name={member.name}
                            relation={member.relation}
                            status={member.status}
                            updatedAt={member.updatedAt}
                        />
                    ))
                )}

                {/* Auto-alert info box */}
                <View style={{ backgroundColor: '#FFF7F7', borderWidth: 1, borderColor: '#FECACA', borderRadius: 20, padding: 20, marginTop: 24, marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Zap size={20} color="#EF4444" fill="#EF4444" />
                        <Text style={{ color: '#1E3A8A', fontSize: 16, fontWeight: '800', marginLeft: 8 }}>
                            {t('safety.emergency_auto_alert') || 'Emergency Auto-Alert'}
                        </Text>
                    </View>
                    <Text style={{ color: '#64748B', fontSize: 13, lineHeight: 20 }}>
                        {t('safety.auto_alert_desc') || 'When you report NEEDS HELP, your registered contacts, nearby volunteers and DMC officers are automatically notified.'}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 }}>
                        {[
                            { label: t('safety.family_count') || 'Family', color: '#EF4444', bg: '#FEE2E2' },
                            { label: t('safety.volunteers_count') || 'Volunteers', color: '#2563EB', bg: '#DBEAFE' },
                            { label: t('safety.dmc_officers') || 'DMC Officers', color: '#7C3AED', bg: '#EDE9FE' },
                        ].map((tag) => (
                            <View key={tag.label} style={{ backgroundColor: tag.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                                <Text style={{ color: tag.color, fontSize: 12, fontWeight: '700' }}>{tag.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>

            {/* Add Member Modal */}
            <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <Text style={{ color: '#0F172A', fontSize: 20, fontWeight: '800' }}>
                                {t('safety.add_member') || 'Add Family Member'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <X size={22} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
                            {t('safety.member_name') || 'Full Name'} *
                        </Text>
                        <TextInput
                            value={memberName}
                            onChangeText={setMemberName}
                            placeholder="e.g. Kamali Perera"
                            style={{ backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0F172A', marginBottom: 16 }}
                            placeholderTextColor="#94A3B8"
                        />

                        <Text style={{ color: '#374151', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
                            {t('safety.member_relation') || 'Relation'}
                        </Text>
                        <TextInput
                            value={memberRelation}
                            onChangeText={setMemberRelation}
                            placeholder="e.g. Spouse, Child, Parent"
                            style={{ backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0F172A', marginBottom: 24 }}
                            placeholderTextColor="#94A3B8"
                        />

                        <TouchableOpacity
                            onPress={handleAddMember}
                            disabled={addingMember}
                            style={{ backgroundColor: '#1E3A8A', borderRadius: 16, padding: 16, alignItems: 'center' }}
                        >
                            {addingMember
                                ? <ActivityIndicator size="small" color="white" />
                                : <Text style={{ color: 'white', fontSize: 16, fontWeight: '800' }}>{t('common.save') || 'Add Member'}</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
