import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Modal,
    Linking, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import {
    Package, AlertTriangle, CornerUpRight, Heart, Phone,
    CheckCircle2, Circle, X, ChevronRight, ExternalLink,
} from 'lucide-react-native';

const STORAGE_KEY = 'preparedness_checked';

interface CheckItem {
    id: string;
    label: string;
    tip?: string;
}

interface Category {
    id: string;
    title: string;
    icon: any;
    color: string;
    bg: string;
    items: CheckItem[];
}

const CATEGORIES: Category[] = [
    {
        id: 'bag',
        title: 'Emergency Bag',
        icon: Package,
        color: '#2563EB',
        bg: '#EFF6FF',
        items: [
            { id: 'bag_water',    label: 'Water (2L per person × 3 days)',   tip: 'Replace stored water every 6 months.' },
            { id: 'bag_food',     label: 'Non-perishable food (3-day supply)', tip: 'Choose items your family already eats.' },
            { id: 'bag_radio',    label: 'Battery-powered or hand-crank radio' },
            { id: 'bag_torch',    label: 'Flashlight + extra batteries' },
            { id: 'bag_firstaid', label: 'First aid kit' },
            { id: 'bag_whistle',  label: 'Whistle (to signal for help)' },
            { id: 'bag_mask',     label: 'Dust masks / N95 masks' },
            { id: 'bag_plastic',  label: 'Plastic sheeting + duct tape' },
            { id: 'bag_wipes',    label: 'Moist towelettes & hand sanitiser' },
            { id: 'bag_tools',    label: 'Wrench or pliers (to shut off utilities)' },
            { id: 'bag_opener',   label: 'Manual can opener' },
            { id: 'bag_docs',     label: 'Copies of important documents',    tip: 'NIC, passport, insurance, bank info in a waterproof bag.' },
        ],
    },
    {
        id: 'flood',
        title: 'Flood Preparedness',
        icon: AlertTriangle,
        color: '#0EA5E9',
        bg: '#E0F2FE',
        items: [
            { id: 'flood_routes',    label: 'Know your evacuation routes',      tip: 'Identify at least two routes out of your area.' },
            { id: 'flood_alerts',    label: 'Registered for local DMC alerts',  tip: 'Enable push notifications in this app.' },
            { id: 'flood_valuables', label: 'Move valuables to higher ground or floors' },
            { id: 'flood_electrics', label: 'Know how to disconnect electrical appliances' },
            { id: 'flood_sandbags',  label: 'Sandbags or flood barriers ready' },
            { id: 'flood_water',     label: 'Drinking water stored (flood may contaminate supply)' },
            { id: 'flood_utilities', label: 'Know how to shut off gas / water mains' },
            { id: 'flood_contacts',  label: 'Emergency contacts saved offline' },
        ],
    },
    {
        id: 'evacuation',
        title: 'Evacuation Plan',
        icon: CornerUpRight,
        color: '#7C3AED',
        bg: '#EDE9FE',
        items: [
            { id: 'evac_exits',    label: 'Two exit routes identified from home' },
            { id: 'evac_meetup',   label: 'Family meeting point agreed',       tip: 'Choose a place everyone knows — a school, temple, or landmark.' },
            { id: 'evac_numbers',  label: 'Emergency numbers memorised',       tip: 'DMC 1989 · Police 119 · Ambulance 110 · Fire 111' },
            { id: 'evac_pets',     label: 'Pet evacuation plan in place' },
            { id: 'evac_shelter',  label: 'Nearest relief camp location known' },
            { id: 'evac_practice', label: 'Plan practised with all family members' },
        ],
    },
    {
        id: 'firstaid',
        title: 'First Aid Readiness',
        icon: Heart,
        color: '#DC2626',
        bg: '#FEE2E2',
        items: [
            { id: 'fa_bandages',    label: 'Bandages and sterile gauze pads' },
            { id: 'fa_antiseptic',  label: 'Antiseptic wipes and solution' },
            { id: 'fa_plasters',    label: 'Adhesive plasters (various sizes)' },
            { id: 'fa_tape',        label: 'Medical / surgical tape' },
            { id: 'fa_scissors',    label: 'Scissors and tweezers' },
            { id: 'fa_painkillers', label: 'Pain relievers and fever reducers' },
            { id: 'fa_ointment',    label: 'Antibiotic ointment' },
            { id: 'fa_ors',         label: 'ORS sachets (rehydration salts)' },
            { id: 'fa_cpr',         label: 'CPR / basic first aid training completed', tip: 'Contact Red Cross Sri Lanka for free sessions.' },
            { id: 'fa_card',        label: 'Emergency first aid reference card in kit' },
        ],
    },
    {
        id: 'helplines',
        title: 'Emergency Helplines',
        icon: Phone,
        color: '#16A34A',
        bg: '#DCFCE7',
        items: [
            { id: 'hl_dmc',      label: 'DMC Hotline — 1989',            tip: 'Disaster Management Centre, available 24/7.' },
            { id: 'hl_police',   label: 'Police Emergency — 119' },
            { id: 'hl_ambulance',label: 'Ambulance — 110' },
            { id: 'hl_fire',     label: 'Fire & Rescue — 111' },
            { id: 'hl_hospital', label: 'Nearest hospital number saved',  tip: 'Save the number of the closest government hospital.' },
        ],
    },
];

// Phone numbers that can be dialled directly
const DIALABLE: Record<string, string> = {
    hl_dmc: '1989',
    hl_police: '119',
    hl_ambulance: '110',
    hl_fire: '111',
};

export default function PreparednessScreen() {
    const { t } = useTranslation();
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [openCategory, setOpenCategory] = useState<Category | null>(null);

    // Load saved state
    useFocusEffect(useCallback(() => {
        AsyncStorage.getItem(STORAGE_KEY).then(raw => {
            if (raw) setChecked(JSON.parse(raw));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []));

    const toggle = async (itemId: string) => {
        const next = { ...checked, [itemId]: !checked[itemId] };
        setChecked(next);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    // Compute totals
    const totalItems = CATEGORIES.reduce((s, c) => s + c.items.length, 0);
    const totalChecked = CATEGORIES.reduce((s, c) => s + c.items.filter(i => checked[i.id]).length, 0);
    const overallPct = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;

    const progressColor = overallPct >= 80 ? '#10B981' : overallPct >= 40 ? '#F59E0B' : '#EF4444';
    const progressLabel = overallPct >= 80 ? 'Well Prepared' : overallPct >= 40 ? 'In Progress' : 'Just Getting Started';

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header title={t('prep.title')} subtitle={t('prep.subtitle')} showBack />

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Overall progress card */}
                    <View style={{ backgroundColor: '#1E3A8A', borderRadius: 24, padding: 22, marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                                    {t('prep.progress')}
                                </Text>
                                <Text style={{ color: 'white', fontSize: 22, fontWeight: '900' }}>
                                    {progressLabel}
                                </Text>
                            </View>
                            <Text style={{ color: progressColor, fontSize: 38, fontWeight: '900' }}>{overallPct}%</Text>
                        </View>

                        <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', height: 10, borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                            <View style={{ width: `${overallPct}%`, backgroundColor: progressColor, height: '100%', borderRadius: 10 }} />
                        </View>

                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                            {totalChecked} of {totalItems} items completed across all categories
                        </Text>
                    </View>

                    {/* Category cards */}
                    {CATEGORIES.map(cat => {
                        const catChecked = cat.items.filter(i => checked[i.id]).length;
                        const catPct = Math.round((catChecked / cat.items.length) * 100);
                        const catColor = catPct === 100 ? '#10B981' : cat.color;

                        return (
                            <TouchableOpacity
                                key={cat.id}
                                activeOpacity={0.8}
                                onPress={() => setOpenCategory(cat)}
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
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                                    <View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: catPct === 100 ? '#D1FAE5' : cat.bg, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                        <cat.icon size={24} color={catColor} strokeWidth={2} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: '800' }}>{cat.title}</Text>
                                        <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>
                                            {catChecked}/{cat.items.length} items · tap to review
                                        </Text>
                                    </View>
                                    {catPct === 100
                                        ? <CheckCircle2 size={22} color="#10B981" strokeWidth={2.5} />
                                        : <ChevronRight size={20} color="#CBD5E1" strokeWidth={2.5} />
                                    }
                                </View>

                                {/* Progress bar */}
                                <View style={{ backgroundColor: '#F1F5F9', height: 8, borderRadius: 8, overflow: 'hidden' }}>
                                    <View style={{ width: `${catPct}%`, backgroundColor: catColor, height: '100%', borderRadius: 8 }} />
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                                    <Text style={{ color: '#94A3B8', fontSize: 11 }}>{catPct}% complete</Text>
                                    {catPct === 100 && (
                                        <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700' }}>✓ Done</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}

            {/* Checklist detail modal */}
            <Modal
                visible={!!openCategory}
                animationType="slide"
                transparent
                onRequestClose={() => setOpenCategory(null)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%' }}>
                        {openCategory && (() => {
                            const cat = openCategory;
                            const catChecked = cat.items.filter(i => checked[i.id]).length;
                            const catPct = Math.round((catChecked / cat.items.length) * 100);

                            return (
                                <>
                                    {/* Modal header */}
                                    <View style={{ padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: cat.bg, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                                <cat.icon size={22} color={cat.color} strokeWidth={2} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>{cat.title}</Text>
                                                <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>
                                                    {catChecked}/{cat.items.length} completed · {catPct}%
                                                </Text>
                                            </View>
                                            <TouchableOpacity onPress={() => setOpenCategory(null)} style={{ padding: 6, backgroundColor: '#F1F5F9', borderRadius: 20 }}>
                                                <X size={18} color="#64748B" />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Mini progress bar */}
                                        <View style={{ backgroundColor: '#F1F5F9', height: 6, borderRadius: 6, overflow: 'hidden', marginTop: 14 }}>
                                            <View style={{ width: `${catPct}%`, backgroundColor: cat.color, height: '100%', borderRadius: 6 }} />
                                        </View>
                                    </View>

                                    <ScrollView
                                        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {cat.items.map((item, idx) => {
                                            const isChecked = !!checked[item.id];
                                            const dialNumber = DIALABLE[item.id];

                                            return (
                                                <View key={item.id}>
                                                    <TouchableOpacity
                                                        onPress={() => toggle(item.id)}
                                                        activeOpacity={0.7}
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'flex-start',
                                                            paddingVertical: 14,
                                                            borderBottomWidth: idx < cat.items.length - 1 ? 1 : 0,
                                                            borderBottomColor: '#F8FAFC',
                                                        }}
                                                    >
                                                        {isChecked
                                                            ? <CheckCircle2 size={22} color={cat.color} strokeWidth={2.5} style={{ marginTop: 1, flexShrink: 0 }} />
                                                            : <Circle size={22} color="#CBD5E1" strokeWidth={2} style={{ marginTop: 1, flexShrink: 0 }} />
                                                        }
                                                        <View style={{ flex: 1, marginLeft: 14 }}>
                                                            <Text style={{
                                                                fontSize: 14,
                                                                fontWeight: '600',
                                                                color: isChecked ? '#94A3B8' : '#0F172A',
                                                                textDecorationLine: isChecked ? 'line-through' : 'none',
                                                                lineHeight: 20,
                                                            }}>
                                                                {item.label}
                                                            </Text>
                                                            {item.tip && !isChecked ? (
                                                                <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, lineHeight: 17 }}>
                                                                    {item.tip}
                                                                </Text>
                                                            ) : null}
                                                        </View>

                                                        {/* Dial button for helpline items */}
                                                        {dialNumber ? (
                                                            <TouchableOpacity
                                                                onPress={() => Linking.openURL(`tel:${dialNumber}`)}
                                                                style={{ marginLeft: 10, backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}
                                                            >
                                                                <Phone size={13} color="#16A34A" strokeWidth={2.5} />
                                                                <Text style={{ color: '#16A34A', fontSize: 12, fontWeight: '700', marginLeft: 4 }}>{dialNumber}</Text>
                                                            </TouchableOpacity>
                                                        ) : null}
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })}

                                        {/* Completion celebration */}
                                        {catPct === 100 && (
                                            <View style={{ backgroundColor: '#D1FAE5', borderRadius: 16, padding: 16, marginTop: 8, alignItems: 'center' }}>
                                                <Text style={{ fontSize: 24, marginBottom: 4 }}>🎉</Text>
                                                <Text style={{ color: '#065F46', fontSize: 14, fontWeight: '800', textAlign: 'center' }}>
                                                    {cat.title} — fully prepared!
                                                </Text>
                                            </View>
                                        )}

                                        {/* Mark all done shortcut */}
                                        {catPct < 100 && (
                                            <TouchableOpacity
                                                onPress={async () => {
                                                    const next = { ...checked };
                                                    cat.items.forEach(i => { next[i.id] = true; });
                                                    setChecked(next);
                                                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                                                }}
                                                style={{ marginTop: 16, borderWidth: 1.5, borderColor: cat.color, borderRadius: 14, padding: 14, alignItems: 'center' }}
                                            >
                                                <Text style={{ color: cat.color, fontSize: 14, fontWeight: '800' }}>
                                                    Mark all as done
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                        {catPct === 100 && (
                                            <TouchableOpacity
                                                onPress={async () => {
                                                    const next = { ...checked };
                                                    cat.items.forEach(i => { next[i.id] = false; });
                                                    setChecked(next);
                                                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                                                }}
                                                style={{ marginTop: 8, padding: 12, alignItems: 'center' }}
                                            >
                                                <Text style={{ color: '#94A3B8', fontSize: 13 }}>Reset checklist</Text>
                                            </TouchableOpacity>
                                        )}
                                    </ScrollView>
                                </>
                            );
                        })()}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
