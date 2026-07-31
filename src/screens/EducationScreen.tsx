import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import {
    AlertTriangle, Droplets, ShieldCheck, Users, Heart, MapPin,
    Clock, CheckCircle2, ChevronRight, X, BookOpen,
} from 'lucide-react-native';

const educationKey = (userId: string) => `education_read_${userId}`;

interface Section {
    heading: string;
    body: string;
}

interface Article {
    id: string;
    title: string;
    readTime: string;
    icon: any;
    iconColor: string;
    iconBg: string;
    sections: Section[];
}

const ARTICLES: Article[] = [
    {
        id: 'flood',
        title: 'What to Do During Floods',
        readTime: '5',
        icon: AlertTriangle,
        iconColor: '#2563EB',
        iconBg: '#EFF6FF',
        sections: [
            {
                heading: 'Before the Flood Arrives',
                body: '• Move to higher ground immediately if you are in a flood-prone area.\n• Turn off electricity at the main switch if flooding is imminent — never touch electrical equipment while standing in water.\n• Move valuables, important documents, and medicines to upper floors.\n• Fill clean containers with drinking water in case the supply becomes contaminated.\n• Charge your phone and keep a battery bank ready.',
            },
            {
                heading: 'During the Flood',
                body: '• Stay away from floodwater — it may be electrically charged from underground lines.\n• Never try to walk through moving water. Even 15 cm of fast-moving water can knock you off your feet.\n• Avoid driving into flooded roads — most flood-related deaths occur in vehicles.\n• If trapped, move to the highest point and signal for help with a torch or bright cloth.\n• Do not use a generator, grill, or camp stove indoors — carbon monoxide poisoning risk.',
            },
            {
                heading: 'After the Flood',
                body: '• Return home only when authorities say it is safe.\n• Document all damage with photos before cleaning up — needed for insurance and government relief.\n• Wear rubber boots and gloves when cleaning floodwater.\n• Do not use tap water until authorities confirm it is safe. Boil water for drinking.\n• Watch for damaged gas lines, structural damage, and hazardous materials.',
            },
            {
                heading: 'Who to Call',
                body: 'DMC Emergency Hotline: 1989\nPolice Emergency: 119\nAmbulance: 110\nReport flood damage via the Suraksha app → Report Incident.',
            },
        ],
    },
    {
        id: 'water',
        title: 'Avoiding Contaminated Water',
        readTime: '4',
        icon: Droplets,
        iconColor: '#0EA5E9',
        iconBg: '#E0F2FE',
        sections: [
            {
                heading: 'Why Water Becomes Unsafe After Disasters',
                body: 'Floods mix sewage, chemicals, and pathogens into the water supply. Even tap water may be unsafe if pipes are damaged. Contaminated water causes cholera, typhoid, dysentery, and hepatitis A.',
            },
            {
                heading: 'How to Make Water Safe',
                body: '1. Boiling: Bring water to a rolling boil for at least 1 minute. Let it cool before drinking. This kills bacteria, viruses, and parasites.\n\n2. Chemical treatment: Add 2 drops of household bleach (5% sodium hypochlorite) per litre of water, stir, and wait 30 minutes before drinking.\n\n3. Filtration + treatment: Filter through a clean cloth first, then boil or treat chemically.\n\n4. Use bottled water if available — inspect the seal carefully.',
            },
            {
                heading: 'Signs of Contaminated Water',
                body: '• Unusual colour (brown, yellow, or cloudy)\n• Strange smell or taste\n• Visible particles or sediment\n• Located near flood debris or sewage overflow',
            },
            {
                heading: 'Protecting Children',
                body: 'Children are most vulnerable to waterborne diseases. Never give untreated water to children under 5. ORS (oral rehydration salts) sachets are essential if diarrhoea occurs — available at all government hospitals.',
            },
        ],
    },
    {
        id: 'report',
        title: 'How to Report Safely',
        readTime: '3',
        icon: ShieldCheck,
        iconColor: '#10B981',
        iconBg: '#D1FAE5',
        sections: [
            {
                heading: 'When to Report an Incident',
                body: 'Report immediately if you witness:\n• Flooding, landslide, or building collapse\n• Fire or structural damage\n• Medical emergency with no help arriving\n• Missing persons\n• Damage to roads, bridges, or utilities',
            },
            {
                heading: 'How to Report Using This App',
                body: '1. Tap "Report Incident" on the Home screen.\n2. Select the incident type (Flood, Landslide, Fire, etc.).\n3. Your GPS location is automatically attached — verify it is correct.\n4. Describe what you see clearly and specifically.\n5. Add a photo if it is safe to do so.\n6. Submit — your report is immediately sent to the nearest response team.\n\nOffline? Your report is saved and sent automatically when you reconnect.',
            },
            {
                heading: 'Reporting Safely',
                body: '• Never enter a dangerous area just to report — your safety comes first.\n• Report from a safe distance.\n• Do not share unverified information on social media — it can cause panic and delay real help.\n• If you see someone injured, call 110 (Ambulance) first, then report via the app.',
            },
            {
                heading: 'What Happens After You Report',
                body: 'Your report is received by DMC officers who assess severity and dispatch response teams. You will receive a status update in the app. High-priority reports trigger automatic alerts to nearby volunteers.',
            },
        ],
    },
    {
        id: 'rescue',
        title: 'Helping Rescue Teams',
        readTime: '6',
        icon: Users,
        iconColor: '#7C3AED',
        iconBg: '#EDE9FE',
        sections: [
            {
                heading: 'How Civilians Can Help Without Getting in the Way',
                body: '• Stay out of active rescue zones — you can block access routes for emergency vehicles.\n• Follow instructions from uniformed responders at all times.\n• Provide information (location, number of trapped people, injuries) clearly and calmly.\n• Offer to help with crowd management or directing people away from danger.',
            },
            {
                heading: 'Becoming a Registered Volunteer',
                body: 'The Suraksha app supports a volunteer network coordinated with the DMC. As a registered volunteer you can:\n• Receive task assignments (rescue support, supply distribution, welfare checks)\n• Be dispatched to nearby help requests\n• Coordinate with DMC officers directly\n\nRegister: Go to Profile → Role → Volunteer Registration.',
            },
            {
                heading: 'Basic Rescue Knowledge',
                body: '• If someone is trapped under debris, do not attempt to move heavy structures without equipment — you could cause further collapse.\n• Reassure trapped persons verbally and keep them calm.\n• Mark the location clearly (tie a cloth, draw an arrow on the ground) and report it immediately.\n• If someone is unconscious but breathing, place them in the recovery position (on their side).\n• For bleeding, apply firm direct pressure with a clean cloth — do not remove once applied.',
            },
            {
                heading: 'Signalling for Help',
                body: '• Use a whistle — three blasts is the universal distress signal.\n• At night, use a torch — SOS is three short, three long, three short flashes.\n• Bright coloured cloth on a rooftop or high point is visible to helicopters.\n• Stay in open areas whenever safe — easier to spot from air.',
            },
        ],
    },
    {
        id: 'hygiene',
        title: 'Post-Disaster Hygiene',
        readTime: '7',
        icon: Heart,
        iconColor: '#EC4899',
        iconBg: '#FCE7F3',
        sections: [
            {
                heading: 'Why Hygiene Is Critical After Disasters',
                body: 'Disasters destroy sanitation infrastructure. Overcrowded shelters, contaminated water, and lack of waste disposal create conditions for rapid disease outbreak. Common post-disaster diseases include cholera, typhoid, hepatitis A, dengue, and skin infections.',
            },
            {
                heading: 'Personal Hygiene Essentials',
                body: '• Wash hands with soap and clean water for at least 20 seconds before eating, after using the toilet, and after contact with floodwater.\n• If soap and water are unavailable, use hand sanitiser with at least 60% alcohol.\n• Keep wounds covered and clean — floodwater contains bacteria that can cause serious infections.\n• Change into dry clothes as soon as possible — wet clothing causes skin infections and hypothermia.',
            },
            {
                heading: 'Food Safety',
                body: '• Discard any food that has come in contact with floodwater — even canned food with dented, swollen, or corroded cans.\n• Do not eat food from flooded fields or gardens without proper washing and cooking.\n• Cook food thoroughly — heat kills most pathogens.\n• Store food in sealed containers off the ground.',
            },
            {
                heading: 'Sanitation at Relief Camps',
                body: '• Use designated toilet facilities only — open defecation spreads disease rapidly.\n• Wash hands after every toilet visit — facilities will have handwashing stations.\n• Report any broken or overflowing toilet facilities to camp officials immediately.\n• Keep your sleeping and eating areas clean — dispose of waste in provided bins.',
            },
            {
                heading: 'Protecting Vulnerable People',
                body: 'Infants, the elderly, pregnant women, and people with chronic illness are at highest risk. Ensure they have access to clean water, food, and any regular medications. Report health deterioration to the camp medical team immediately.',
            },
        ],
    },
    {
        id: 'landslide',
        title: 'Landslide Warning Signs',
        readTime: '5',
        icon: MapPin,
        iconColor: '#F97316',
        iconBg: '#FFEDD5',
        sections: [
            {
                heading: 'Early Warning Signs',
                body: '• New cracks or bulges in the ground, road, or hillside\n• Doors and windows that suddenly stick or jam (ground shifting)\n• Tilting trees, telephone poles, or fences\n• Unusual sounds — cracking trees, rumbling, or boulders knocking together\n• Water springs suddenly appearing on slopes\n• Rapid increase in creek water level or muddy water colour change',
            },
            {
                heading: 'High-Risk Conditions',
                body: 'Landslide risk is highest when:\n• Heavy rainfall continues for more than 3–4 hours\n• The area has experienced a landslide before\n• Slopes have been disturbed by construction or deforestation\n• An earthquake has recently occurred in the region\n• The ground is already saturated from previous rain',
            },
            {
                heading: 'What to Do Immediately',
                body: '• Evacuate the area quickly — move uphill and away from the slope direction.\n• Do not stop to collect belongings.\n• Avoid river valleys and low-lying areas during heavy rain.\n• If you cannot escape, curl into a tight ball and protect your head.\n• Once safe, call DMC: 1989 and report the landslide location.',
            },
            {
                heading: 'After a Landslide',
                body: '• Do not re-enter the area — secondary slides are common in the hours after.\n• Stay away from damaged buildings — structural integrity may be compromised.\n• Check on neighbours, especially elderly people who may not have been able to evacuate.\n• Report the incident via the Suraksha app so rescue teams can be dispatched.\n• Watch for flooding downstream — landslides can block rivers and cause sudden flooding.',
            },
        ],
    },
];

export default function EducationScreen() {
    const { t } = useTranslation();
    const [readMap, setReadMap] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [openArticle, setOpenArticle] = useState<Article | null>(null);

    useFocusEffect(useCallback(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem('user');
                const uid = stored ? JSON.parse(stored).id : null;
                if (!uid) { setLoading(false); return; }
                const raw = await AsyncStorage.getItem(educationKey(uid));
                setReadMap(raw ? JSON.parse(raw) : {});
            } catch {}
            setLoading(false);
        })();
    }, []));

    const markRead = async (id: string) => {
        const next = { ...readMap, [id]: true };
        setReadMap(next);
        const stored = await AsyncStorage.getItem('user');
        const uid = stored ? JSON.parse(stored).id : null;
        if (uid) await AsyncStorage.setItem(educationKey(uid), JSON.stringify(next));
    };

    const totalRead = ARTICLES.filter(a => readMap[a.id]).length;
    const pct = Math.round((totalRead / ARTICLES.length) * 100);

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header title={t('edu.title')} subtitle={t('edu.subtitle')} showBack />

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#7C3AED" />
                </View>
            ) : (
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Progress banner */}
                    <View style={{ backgroundColor: '#4C1D95', borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                                {t('edu.title')}
                            </Text>
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '900', marginBottom: 10 }}>
                                {totalRead === ARTICLES.length
                                    ? 'All articles read!'
                                    : `${totalRead} of ${ARTICLES.length} articles read`}
                            </Text>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', height: 8, borderRadius: 8, overflow: 'hidden' }}>
                                <View style={{ width: `${pct}%`, backgroundColor: '#A78BFA', height: '100%', borderRadius: 8 }} />
                            </View>
                        </View>
                        <Text style={{ color: '#A78BFA', fontSize: 36, fontWeight: '900', marginLeft: 20 }}>{pct}%</Text>
                    </View>

                    {/* Article cards */}
                    {ARTICLES.map(article => {
                        const isRead = !!readMap[article.id];
                        return (
                            <TouchableOpacity
                                key={article.id}
                                activeOpacity={0.8}
                                onPress={() => { setOpenArticle(article); markRead(article.id); }}
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
                                    opacity: isRead ? 0.85 : 1,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: isRead ? '#F0FDF4' : article.iconBg, alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 }}>
                                        {isRead
                                            ? <CheckCircle2 size={24} color="#10B981" strokeWidth={2.5} />
                                            : <article.icon size={24} color={article.iconColor} strokeWidth={2} />
                                        }
                                    </View>
                                    <View style={{ flex: 1, minWidth: 0 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '800', color: isRead ? '#64748B' : '#0F172A', lineHeight: 20 }} numberOfLines={2}>
                                            {article.title}
                                        </Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                                            <Clock size={12} color="#94A3B8" strokeWidth={2} />
                                            <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '600', marginLeft: 4 }}>
                                                {article.readTime} {t('edu.min_read')}
                                            </Text>
                                            {isRead && (
                                                <>
                                                    <Text style={{ color: '#CBD5E1', marginHorizontal: 6 }}>·</Text>
                                                    <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '800' }}>
                                                        {t('edu.completed')}
                                                    </Text>
                                                </>
                                            )}
                                        </View>
                                    </View>
                                    <ChevronRight size={18} color="#CBD5E1" strokeWidth={2.5} style={{ marginLeft: 8, flexShrink: 0 }} />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}

            {/* Article reader modal */}
            <Modal
                visible={!!openArticle}
                animationType="slide"
                transparent
                onRequestClose={() => setOpenArticle(null)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, flex: 1, marginTop: 60 }}>
                        {openArticle && (() => {
                            const art = openArticle;
                            return (
                                <>
                                    {/* Reader header */}
                                    <View style={{ padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: art.iconBg, alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 }}>
                                                <art.icon size={22} color={art.iconColor} strokeWidth={2} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 17, fontWeight: '900', color: '#0F172A', lineHeight: 24 }}>
                                                    {art.title}
                                                </Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                    <Clock size={12} color="#94A3B8" strokeWidth={2} />
                                                    <Text style={{ color: '#94A3B8', fontSize: 12, marginLeft: 4 }}>
                                                        {art.readTime} {t('edu.min_read')}
                                                    </Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                                                        <CheckCircle2 size={12} color="#10B981" strokeWidth={2.5} />
                                                        <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '700', marginLeft: 4 }}>Read</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => setOpenArticle(null)}
                                                style={{ padding: 6, backgroundColor: '#F1F5F9', borderRadius: 20, marginLeft: 8, flexShrink: 0 }}
                                            >
                                                <X size={18} color="#64748B" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Article content */}
                                    <ScrollView
                                        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {art.sections.map((section, idx) => (
                                            <View key={idx} style={{ marginBottom: 24 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                                    <View style={{ width: 4, height: 18, backgroundColor: art.iconColor, borderRadius: 2, marginRight: 10 }} />
                                                    <Text style={{ fontSize: 15, fontWeight: '900', color: '#0F172A', flex: 1 }}>
                                                        {section.heading}
                                                    </Text>
                                                </View>
                                                <Text style={{ fontSize: 14, color: '#475569', lineHeight: 24 }}>
                                                    {section.body}
                                                </Text>
                                            </View>
                                        ))}

                                        {/* Done button */}
                                        <TouchableOpacity
                                            onPress={() => setOpenArticle(null)}
                                            style={{ backgroundColor: art.iconColor, borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8, flexDirection: 'row', justifyContent: 'center' }}
                                        >
                                            <BookOpen size={18} color="white" strokeWidth={2.5} />
                                            <Text style={{ color: 'white', fontSize: 15, fontWeight: '900', marginLeft: 8 }}>Done Reading</Text>
                                        </TouchableOpacity>
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
