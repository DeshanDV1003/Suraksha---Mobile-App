import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { VerifiedTokenCard } from '../components/ReliefTokenScreen/VerifiedTokenCard';
import { CollectionHistoryItem } from '../components/ReliefTokenScreen/CollectionHistoryItem';
import { ChevronRight } from 'lucide-react-native';
import { useOfflineSubmit } from '../hooks/useOfflineSubmit';
import { ActivityIndicator } from 'react-native';
import { useToast } from '../context/ToastContext';
import { tokenService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function ReliefTokenScreen() {
    const { t } = useTranslation();
    const [token, setToken] = useState<any>(null);
    const [tokenLoading, setTokenLoading] = useState(true);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const loadToken = async () => {
            try {
                const stored = await AsyncStorage.getItem('user');
                if (stored) setUserName(JSON.parse(stored)?.name || '');
                const res = await tokenService.getTokens();
                const tokens = res.data || [];
                const active = tokens.find((t: any) => t.status === 'ACTIVE') || tokens[0] || null;
                setToken(active);
            } catch {
                // no token yet
            } finally {
                setTokenLoading(false);
            }
        };
        loadToken();
    }, []);

    const historyItems: any[] = [];

    const { submit, status } = useOfflineSubmit('RELIEF_TOKEN_CLAIM', '/relief-tokens/claim');
    const toast = useToast();

    const handleClaimToken = async () => {
        try {
            const result = await submit({ reason: "Emergency request for family" });
            if (result.queued) {
                toast.warning(t('common.offline_queued') || 'Queued', 'You are offline. Token request will be submitted when you reconnect.');
            } else {
                toast.success(t('common.success') || 'Success', 'Relief token request submitted successfully.');
            }
        } catch (error) {
            console.error('Failed to claim token:', error);
            toast.error(t('common.error') || 'Error', 'Failed to request token.');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#F0F4FF" }}>
            <Header
                title={t('token.title')}
                subtitle={t('token.subtitle')}
                showBack
            />

            <ScrollView
                className="flex-1 px-6 pt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {tokenLoading ? (
                    <View className="py-10 items-center">
                        <ActivityIndicator size="large" color="#2563EB" />
                    </View>
                ) : (
                    <VerifiedTokenCard
                        id={token ? token.code : t('token.id_label')}
                        userName={userName || t('token.user_name')}
                        familyInfo={token
                            ? (token.status === 'ACTIVE'
                                ? `${t('token.expires') || 'Expires'}: ${dayjs(token.expiresAt).format('DD MMM YYYY')}`
                                : token.status)
                            : t('token.family_info')}
                        verifiedLabel={token ? (t('token.verified') || 'Verified') : (t('token.no_token') || 'No Active Token')}
                    />
                )}

                <TouchableOpacity 
                    onPress={handleClaimToken}
                    disabled={status === 'submitting'}
                    className="bg-[#2563EB] rounded-2xl p-4 mt-4 items-center shadow-lg"
                >
                    {status === 'submitting' ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">{t('token.claim_new') || 'Request New Token'}</Text>
                    )}
                </TouchableOpacity>

                <View className="mt-4 mb-6">
                    <Text className="text-3xl font-extrabold text-[#1E3A8A]">
                        {t('token.history_title')}
                    </Text>
                </View>

                {historyItems.map((item, index) => (
                    <CollectionHistoryItem
                        key={index}
                        title={item.title}
                        location={item.location}
                        timeLabel={item.time}
                        statusLabel={item.status}
                    />
                ))}

                {/* How it works Information Card */}
                <View
                    style={{ borderRadius: 32 }}
                    className="bg-[#EFF6FF] border border-[#BFDBFE] p-8 mt-8 mb-10"
                >
                    <Text className="text-[#1E3A8A] text-2xl font-extrabold mb-6">
                        {t('token.how_it_works')}
                    </Text>

                    {[1, 2, 3, 4].map((num) => (
                        <View key={num} className="flex-row items-start mb-4">
                            <Text className="text-[#2563EB] text-xl font-black mr-3">•</Text>
                            <Text className="text-[#2563EB] text-base font-bold flex-1 leading-6">
                                {t(`token.how_it_works_${num}`)}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
