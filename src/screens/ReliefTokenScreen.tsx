import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { VerifiedTokenCard } from '../components/ReliefTokenScreen/VerifiedTokenCard';
import { CollectionHistoryItem } from '../components/ReliefTokenScreen/CollectionHistoryItem';
import { reliefTokenService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ShieldAlert, Info } from 'lucide-react-native';
dayjs.extend(relativeTime);

export default function ReliefTokenScreen() {
    const { t } = useTranslation();
    const [token, setToken] = useState<any>(null);
    const [tokenLoading, setTokenLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const stored = await AsyncStorage.getItem('user');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setUserName(parsed?.name || '');
                    setUserId(parsed?.id || null);
                }

                // GET /relief-tokens/my — returns only this user's relief tokens
                const res = await reliefTokenService.getMyTokens();
                const myTokens: any[] = res.data || [];

                // Prefer ACTIVE token, fall back to most recent
                const active =
                    myTokens.find((tk: any) => tk.status === 'ACTIVE') ||
                    myTokens[0] ||
                    null;
                setToken(active);
            } catch {
                // offline or server error — token stays null
            } finally {
                setTokenLoading(false);
            }
        };
        loadToken();
    }, []);

    // History = individual claim records on this token (each = one camp visit)
    const historyItems: any[] = token?.claims || [];

    const tokenExpiry = token?.expiresAt
        ? dayjs(token.expiresAt).format('DD MMM YYYY')
        : null;

    const familyInfo = token
        ? token.status === 'ACTIVE' && tokenExpiry
            ? `Expires ${tokenExpiry}`
            : token.status
        : 'No active token';

    const verifiedLabel = token
        ? token.status === 'ACTIVE' ? 'Verified' : token.status
        : 'Not Issued';

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header
                title={t('token.title') || 'Relief Token'}
                subtitle={t('token.subtitle') || 'Your official disaster relief access pass'}
                showBack
            />

            <ScrollView
                style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {tokenLoading ? (
                    <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#2563EB" />
                        <Text style={{ color: '#94A3B8', marginTop: 12, fontSize: 14 }}>Loading your token…</Text>
                    </View>
                ) : token ? (
                    <VerifiedTokenCard
                        id={token.code}
                        userName={userName || 'Token Holder'}
                        familyInfo={familyInfo}
                        verifiedLabel={verifiedLabel}
                        qrCodeData={token.qrCodeData || null}
                        tokenType={token.type || null}
                    />
                ) : (
                    /* No token state */
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 24,
                        padding: 32,
                        alignItems: 'center',
                        marginBottom: 24,
                        borderWidth: 2,
                        borderColor: '#E2E8F0',
                        borderStyle: 'dashed',
                    }}>
                        <ShieldAlert size={56} color="#94A3B8" strokeWidth={1.5} />
                        <Text style={{ color: '#1E3A8A', fontSize: 18, fontWeight: '800', marginTop: 16, marginBottom: 8 }}>
                            No Token Assigned
                        </Text>
                        <Text style={{ color: '#64748B', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
                            You don't have an active relief token yet. Tokens are issued by DMC officers at your local disaster management centre.
                        </Text>
                    </View>
                )}

                {/* How officers issue tokens — info card */}
                <View style={{
                    backgroundColor: '#EFF6FF',
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: '#BFDBFE',
                    padding: 20,
                    marginBottom: 24,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                }}>
                    <Info size={20} color="#2563EB" strokeWidth={2} style={{ marginTop: 2, marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#1E3A8A', fontSize: 14, fontWeight: '700', marginBottom: 6 }}>
                            How Relief Tokens Work
                        </Text>
                        {[
                            'A DMC officer registers you and issues a digital token.',
                            'Your token contains a unique code and QR code.',
                            'Show your token at relief camps to collect supplies.',
                            'Each token tracks how many times it has been used.',
                        ].map((step, i) => (
                            <View key={i} style={{ flexDirection: 'row', marginTop: 4 }}>
                                <Text style={{ color: '#2563EB', fontWeight: '900', marginRight: 8 }}>•</Text>
                                <Text style={{ color: '#2563EB', fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 20 }}>{step}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Collection history */}
                <Text style={{ color: '#1E3A8A', fontSize: 18, fontWeight: '800', marginBottom: 12 }}>
                    {t('token.history_title') || 'Collection History'}
                </Text>

                {historyItems.length > 0 ? (
                    historyItems.map((item: any, index: number) => (
                        <CollectionHistoryItem
                            key={item.id || index}
                            title={item.itemType || 'Relief Supplies'}
                            location={item.campId ? `Camp #${item.campId.slice(0, 8)}` : 'Relief Camp'}
                            timeLabel={dayjs(item.claimedAt || item.createdAt).fromNow()}
                            statusLabel="Collected"
                        />
                    ))
                ) : (
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 16,
                        padding: 24,
                        alignItems: 'center',
                    }}>
                        <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '600' }}>
                            No collection history yet
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
