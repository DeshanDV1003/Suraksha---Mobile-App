import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, Modal, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { useOfflineSubmit } from '../hooks/useOfflineSubmit';
import { useToast } from '../context/ToastContext';
import {
    Heart, ShieldCheck, CheckCircle2, X, Utensils,
    BookOpen, Pill, Car, Plus, Clock, Sparkles,
} from 'lucide-react-native';

const HISTORY_KEY = 'donation_history';

interface Campaign {
    id: string;
    titleKey: string;
    descKey: string;
    defaultAmount: number;
    icon: any;
    iconColor: string;
    iconBg: string;
    type: string;
}

const CAMPAIGNS: Campaign[] = [
    {
        id: 'food',
        titleKey: 'donate.food_kit',
        descKey: 'donate.food_kit_desc',
        defaultAmount: 500,
        icon: Utensils,
        iconColor: '#F97316',
        iconBg: '#FFEDD5',
        type: 'Food Kit',
    },
    {
        id: 'school',
        titleKey: 'donate.school_kit',
        descKey: 'donate.school_kit_desc',
        defaultAmount: 750,
        icon: BookOpen,
        iconColor: '#EAB308',
        iconBg: '#FEF9C3',
        type: 'School Kit',
    },
    {
        id: 'medicine',
        titleKey: 'donate.medicine_pack',
        descKey: 'donate.medicine_desc',
        defaultAmount: 1200,
        icon: Pill,
        iconColor: '#EF4444',
        iconBg: '#FEE2E2',
        type: 'Medicine Pack',
    },
    {
        id: 'transport',
        titleKey: 'donate.transport',
        descKey: 'donate.transport_desc',
        defaultAmount: 2000,
        icon: Car,
        iconColor: '#7C3AED',
        iconBg: '#EDE9FE',
        type: 'Emergency Transport',
    },
];

interface DonationRecord {
    id: string;
    type: string;
    amount: number;
    date: string;
    queued?: boolean;
}

export default function DonateScreen() {
    const { t } = useTranslation();
    const toast = useToast();

    const [history, setHistory]             = useState<DonationRecord[]>([]);
    const [selected, setSelected]           = useState<Campaign | null>(null);
    const [customOpen, setCustomOpen]       = useState(false);
    const [customAmount, setCustomAmount]   = useState('');
    const [customCategory, setCustomCategory] = useState(CAMPAIGNS[0].id);
    const [submitting, setSubmitting]       = useState(false);
    const [confirmed, setConfirmed]         = useState<DonationRecord | null>(null);
    const [user, setUser]                   = useState<any>(null);

    const { submit } = useOfflineSubmit('DONATION_SUBMIT', '/donations');

    useFocusEffect(useCallback(() => {
        AsyncStorage.getItem(HISTORY_KEY).then(raw => {
            if (raw) setHistory(JSON.parse(raw));
        });
        AsyncStorage.getItem('user').then(raw => {
            if (raw) setUser(JSON.parse(raw));
        });
    }, []));

    const totalDonated = history.reduce((s, d) => s + d.amount, 0);
    const familiesHelped = history.length;

    const openModal = (campaign: Campaign) => {
        setSelected(campaign);
        setCustomOpen(false);
        setCustomAmount(String(campaign.defaultAmount));
        setConfirmed(null);
    };

    const openCustomModal = () => {
        setSelected(null);
        setCustomOpen(true);
        setCustomAmount('');
        setCustomCategory(CAMPAIGNS[0].id);
        setConfirmed(null);
    };

    const closeModal = () => {
        setSelected(null);
        setCustomOpen(false);
        setConfirmed(null);
    };

    const handleDonate = async () => {
        const amount = parseInt(customAmount);
        if (!amount || amount < 1) {
            toast.error(t('common.error') || 'Error', 'Please enter a valid amount.');
            return;
        }

        const activeCampaign = selected ?? CAMPAIGNS.find(c => c.id === customCategory) ?? CAMPAIGNS[0];

        setSubmitting(true);
        try {
            const payload = {
                donorName: user?.name || 'Anonymous',
                type: 'MONETARY',
                amount,
                itemsDescription: activeCampaign.type,
                transactionId: `TXN-${Date.now()}`,
                paymentGateway: 'MOBILE_APP',
                transactionDate: new Date().toISOString(),
            };

            const result = await submit(payload);

            const record: DonationRecord = {
                id: `d_${Date.now()}`,
                type: activeCampaign.type,
                amount,
                date: new Date().toISOString(),
                queued: !!result.queued,
            };

            const next = [record, ...history];
            setHistory(next);
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));

            setConfirmed(record);

            if (result.queued) {
                toast.warning(t('common.offline_queued') || 'Queued', 'Your donation will be recorded when you reconnect.');
            } else {
                toast.success(t('common.success') || 'Thank you!', 'Your donation has been submitted successfully.');
            }
        } catch (err) {
            console.error('Donation failed:', err);
            toast.error(t('common.error') || 'Error', 'Failed to process donation. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header title={t('donate.title')} subtitle={t('donate.subtitle')} showBack />

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats banner */}
                <View style={{
                    backgroundColor: '#F0FDF4',
                    borderWidth: 1,
                    borderColor: '#DCFCE7',
                    borderRadius: 24,
                    padding: 20,
                    marginBottom: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <View style={{ width: 56, height: 56, backgroundColor: '#10B981', borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 16, flexShrink: 0 }}>
                        <Heart size={28} color="white" fill="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#065F46', fontSize: 26, fontWeight: '900' }}>
                            LKR {totalDonated.toLocaleString()}
                        </Text>
                        <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                            {t('donate.total_label')}
                        </Text>
                        {familiesHelped > 0 && (
                            <Text style={{ color: '#047857', fontSize: 13, fontWeight: '600', marginTop: 6 }}>
                                {t('donate.helped_msg', { count: familiesHelped })}
                            </Text>
                        )}
                        {familiesHelped === 0 && (
                            <Text style={{ color: '#6EE7B7', fontSize: 13, marginTop: 4 }}>
                                Be the first to help a family today
                            </Text>
                        )}
                    </View>
                </View>

                {/* Campaign heading */}
                <Text style={{ color: '#1E3A8A', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                    {t('donate.verified_title')}
                </Text>

                {/* Campaign cards */}
                {CAMPAIGNS.map(campaign => (
                    <TouchableOpacity
                        key={campaign.id}
                        onPress={() => openModal(campaign)}
                        activeOpacity={0.85}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: 20,
                            padding: 18,
                            marginBottom: 12,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.06,
                            shadowRadius: 8,
                            elevation: 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        {/* Accent stripe */}
                        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, backgroundColor: campaign.iconColor, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }} />

                        <View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: campaign.iconBg, alignItems: 'center', justifyContent: 'center', marginLeft: 8, marginRight: 16, flexShrink: 0 }}>
                            <campaign.icon size={24} color={campaign.iconColor} strokeWidth={2} />
                        </View>

                        <View style={{ flex: 1, minWidth: 0 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: '800', marginRight: 6 }} numberOfLines={1}>
                                    {t(campaign.titleKey)}
                                </Text>
                                <ShieldCheck size={14} color="#10B981" strokeWidth={2.5} />
                            </View>
                            <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4 }}>
                                {t(campaign.descKey) || campaign.type}
                            </Text>
                            <Text style={{ color: campaign.iconColor, fontSize: 13, fontWeight: '800' }}>
                                LKR {campaign.defaultAmount.toLocaleString()} <Text style={{ color: '#94A3B8', fontWeight: '600', fontSize: 11 }}>{t('donate.per_kit')}</Text>
                            </Text>
                        </View>

                        <View style={{ backgroundColor: '#10B981', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, marginLeft: 10, flexShrink: 0 }}>
                            <Text style={{ color: 'white', fontSize: 12, fontWeight: '900' }}>{t('donate.donate_now')}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Custom donation card */}
                <TouchableOpacity
                    onPress={openCustomModal}
                    activeOpacity={0.85}
                    style={{
                        backgroundColor: '#1E3A8A',
                        borderRadius: 20,
                        padding: 18,
                        marginBottom: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        shadowColor: '#1E3A8A',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                        elevation: 6,
                    }}
                >
                    <View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 16, flexShrink: 0 }}>
                        <Sparkles size={24} color="white" strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontSize: 15, fontWeight: '800', marginBottom: 2 }}>Donate Custom Amount</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>Choose any amount and category you prefer</Text>
                    </View>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flexShrink: 0 }}>
                        <Plus size={18} color="white" strokeWidth={2.5} />
                    </View>
                </TouchableOpacity>

                {/* Donation history */}
                {history.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                        <Text style={{ color: '#1E3A8A', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                            {t('donate.history_title') || 'Your Donations'}
                        </Text>
                        {history.slice(0, 5).map(record => (
                            <View key={record.id} style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
                                <CheckCircle2 size={20} color={record.queued ? '#F59E0B' : '#10B981'} strokeWidth={2.5} style={{ marginRight: 12, flexShrink: 0 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '700' }}>{record.type}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                                        <Clock size={11} color="#94A3B8" strokeWidth={2} />
                                        <Text style={{ color: '#94A3B8', fontSize: 11, marginLeft: 4 }}>
                                            {new Date(record.date).toLocaleDateString()}
                                        </Text>
                                        {record.queued && (
                                            <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '700', marginLeft: 8 }}>⏳ Pending sync</Text>
                                        )}
                                    </View>
                                </View>
                                <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '900' }}>
                                    LKR {record.amount.toLocaleString()}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Custom donation modal */}
            <Modal
                visible={customOpen}
                animationType="slide"
                transparent
                onRequestClose={closeModal}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 }}>
                                <Sparkles size={22} color="#7C3AED" strokeWidth={2} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 17, fontWeight: '900', color: '#0F172A' }}>Custom Donation</Text>
                                <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>Choose a category and enter any amount</Text>
                            </View>
                            <TouchableOpacity onPress={closeModal} style={{ padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 }}>
                                <X size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        {confirmed ? (
                            <View style={{ padding: 24, alignItems: 'center' }}>
                                <CheckCircle2 size={56} color={confirmed.queued ? '#F59E0B' : '#10B981'} strokeWidth={1.5} />
                                <Text style={{ color: '#0F172A', fontSize: 20, fontWeight: '900', marginTop: 16, marginBottom: 6, textAlign: 'center' }}>
                                    {confirmed.queued ? 'Saved — Will Sync' : 'Donation Submitted!'}
                                </Text>
                                <Text style={{ color: '#64748B', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 6 }}>
                                    {confirmed.queued
                                        ? 'You are offline. Your donation will be recorded when you reconnect.'
                                        : 'Thank you for your generous contribution. Your donation helps families recover.'}
                                </Text>
                                <Text style={{ color: '#10B981', fontSize: 22, fontWeight: '900', marginTop: 8, marginBottom: 24 }}>
                                    LKR {confirmed.amount.toLocaleString()}
                                </Text>
                                <TouchableOpacity
                                    onPress={closeModal}
                                    style={{ backgroundColor: '#10B981', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 40 }}
                                >
                                    <Text style={{ color: 'white', fontSize: 15, fontWeight: '900' }}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={{ padding: 24 }}>
                                {/* Category picker */}
                                <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                                    Category
                                </Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
                                    {CAMPAIGNS.map(c => (
                                        <TouchableOpacity
                                            key={c.id}
                                            onPress={() => setCustomCategory(c.id)}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingHorizontal: 14,
                                                paddingVertical: 8,
                                                borderRadius: 50,
                                                borderWidth: 2,
                                                borderColor: customCategory === c.id ? c.iconColor : '#E2E8F0',
                                                backgroundColor: customCategory === c.id ? c.iconBg : 'white',
                                                marginRight: 8,
                                                marginBottom: 8,
                                            }}
                                        >
                                            <c.icon size={13} color={customCategory === c.id ? c.iconColor : '#94A3B8'} strokeWidth={2.5} />
                                            <Text style={{ color: customCategory === c.id ? c.iconColor : '#64748B', fontWeight: '700', fontSize: 12, marginLeft: 5 }}>
                                                {c.type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Amount */}
                                <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                                    {t('donate.amount_label') || 'Donation Amount (LKR)'}
                                </Text>
                                <TextInput
                                    value={customAmount}
                                    onChangeText={setCustomAmount}
                                    keyboardType="numeric"
                                    placeholder="Enter any amount"
                                    placeholderTextColor="#94A3B8"
                                    style={{
                                        backgroundColor: '#F8FAFC',
                                        borderWidth: 1,
                                        borderColor: '#E2E8F0',
                                        borderRadius: 16,
                                        padding: 16,
                                        fontSize: 20,
                                        fontWeight: '900',
                                        color: '#0F172A',
                                        marginBottom: 20,
                                        textAlign: 'center',
                                    }}
                                />

                                <TouchableOpacity
                                    onPress={handleDonate}
                                    disabled={submitting}
                                    activeOpacity={0.85}
                                    style={{ backgroundColor: '#7C3AED', borderRadius: 18, paddingVertical: 18, alignItems: 'center' }}
                                >
                                    {submitting
                                        ? <ActivityIndicator color="white" />
                                        : <Text style={{ color: 'white', fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                            Donate — LKR {parseInt(customAmount || '0').toLocaleString()}
                                          </Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Campaign donation modal */}
            <Modal
                visible={!!selected}
                animationType="slide"
                transparent
                onRequestClose={closeModal}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
                        {selected && (
                            <>
                                {/* Modal header */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                                    <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: selected.iconBg, alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 }}>
                                        <selected.icon size={22} color={selected.iconColor} strokeWidth={2} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 17, fontWeight: '900', color: '#0F172A' }}>{t(selected.titleKey)}</Text>
                                        <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{t(selected.descKey) || selected.type}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={closeModal}
                                        style={{ padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 }}
                                    >
                                        <X size={18} color="#64748B" />
                                    </TouchableOpacity>
                                </View>

                                {confirmed ? (
                                    /* Confirmation view */
                                    <View style={{ padding: 24, alignItems: 'center' }}>
                                        <CheckCircle2 size={56} color={confirmed.queued ? '#F59E0B' : '#10B981'} strokeWidth={1.5} />
                                        <Text style={{ color: '#0F172A', fontSize: 20, fontWeight: '900', marginTop: 16, marginBottom: 6, textAlign: 'center' }}>
                                            {confirmed.queued ? 'Saved — Will Sync' : 'Donation Submitted!'}
                                        </Text>
                                        <Text style={{ color: '#64748B', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 6 }}>
                                            {confirmed.queued
                                                ? 'You are offline. Your donation will be recorded when you reconnect.'
                                                : 'Thank you for your generous contribution. Your donation helps families recover.'}
                                        </Text>
                                        <Text style={{ color: '#10B981', fontSize: 22, fontWeight: '900', marginTop: 8, marginBottom: 24 }}>
                                            LKR {confirmed.amount.toLocaleString()}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={closeModal}
                                            style={{ backgroundColor: '#10B981', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 40 }}
                                        >
                                            <Text style={{ color: 'white', fontSize: 15, fontWeight: '900' }}>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    /* Amount entry view */
                                    <View style={{ padding: 24 }}>
                                        <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                                            {t('donate.amount_label') || 'Donation Amount (LKR)'}
                                        </Text>

                                        {/* Quick amounts */}
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                                            {[selected.defaultAmount, selected.defaultAmount * 2, selected.defaultAmount * 5].map(amt => (
                                                <TouchableOpacity
                                                    key={amt}
                                                    onPress={() => setCustomAmount(String(amt))}
                                                    style={{
                                                        paddingHorizontal: 16,
                                                        paddingVertical: 8,
                                                        borderRadius: 50,
                                                        borderWidth: 2,
                                                        borderColor: customAmount === String(amt) ? '#10B981' : '#E2E8F0',
                                                        backgroundColor: customAmount === String(amt) ? '#F0FDF4' : 'white',
                                                        marginRight: 8,
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    <Text style={{ color: customAmount === String(amt) ? '#10B981' : '#475569', fontWeight: '800', fontSize: 13 }}>
                                                        {amt.toLocaleString()}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                            <TouchableOpacity
                                                onPress={() => setCustomAmount('')}
                                                style={{
                                                    paddingHorizontal: 16,
                                                    paddingVertical: 8,
                                                    borderRadius: 50,
                                                    borderWidth: 2,
                                                    borderColor: '#E2E8F0',
                                                    backgroundColor: 'white',
                                                    marginRight: 8,
                                                    marginBottom: 8,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Plus size={13} color="#475569" />
                                                <Text style={{ color: '#475569', fontWeight: '700', fontSize: 13, marginLeft: 4 }}>Custom</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Amount input */}
                                        <TextInput
                                            value={customAmount}
                                            onChangeText={setCustomAmount}
                                            keyboardType="numeric"
                                            placeholder="Enter amount"
                                            placeholderTextColor="#94A3B8"
                                            style={{
                                                backgroundColor: '#F8FAFC',
                                                borderWidth: 1,
                                                borderColor: '#E2E8F0',
                                                borderRadius: 16,
                                                padding: 16,
                                                fontSize: 20,
                                                fontWeight: '900',
                                                color: '#0F172A',
                                                marginBottom: 20,
                                                textAlign: 'center',
                                            }}
                                        />

                                        <TouchableOpacity
                                            onPress={handleDonate}
                                            disabled={submitting}
                                            activeOpacity={0.85}
                                            style={{ backgroundColor: '#10B981', borderRadius: 18, paddingVertical: 18, alignItems: 'center' }}
                                        >
                                            {submitting
                                                ? <ActivityIndicator color="white" />
                                                : <Text style={{ color: 'white', fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                                    {t('donate.donate_now')} — LKR {parseInt(customAmount || '0').toLocaleString()}
                                                  </Text>
                                            }
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
