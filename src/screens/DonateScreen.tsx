import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { ContributionStatsCard } from '../components/DonateScreen/ContributionStatsCard';
import { DonationRequestCard } from '../components/DonateScreen/DonationRequestCard';
import { useOfflineSubmit } from '../hooks/useOfflineSubmit';
import { ActivityIndicator } from 'react-native';
import { useToast } from '../context/ToastContext';

export default function DonateScreen() {
    const { t } = useTranslation();

    const requests = [
        {
            title: t('donate.food_kit'),
            recipient: "Silva Family - Colombo",
            amount: "LKR 500",
            numericAmount: 500,
            accentColor: "#F97316" // Orange
        },
        {
            title: t('donate.school_kit'),
            recipient: "3 Children - Galle",
            amount: "LKR 750",
            numericAmount: 750,
            accentColor: "#EAB308" // Yellow
        },
        {
            title: t('donate.medicine_pack'),
            recipient: "Elderly Couple - Kandy",
            amount: "LKR 1200",
            numericAmount: 1200,
            accentColor: "#EF4444" // Red
        },
        {
            title: t('donate.transport'),
            recipient: "Pregnant Mother - Matara",
            amount: "LKR 2000",
            numericAmount: 2000,
            accentColor: "#EF4444" // Red
        }
    ];

    const { submit, status } = useOfflineSubmit('DONATION_SUBMIT', '/api/donations');
    const toast = useToast();

    const handleDonate = async (item: any) => {
        const payload = {
            type: "MONETARY",
            amount: item.numericAmount,
            transactionId: `txn_${Math.floor(Math.random() * 1000000000)}`,
            paymentGateway: "STRIPE",
            transactionDate: new Date().toISOString(),
            itemsDescription: `Donation for ${item.title}`
        };

        try {
            const result = await submit(payload);
            if (result.queued) {
                toast.warning(t('common.offline_queued') || 'Queued', 'You are offline. Your donation will be processed when you reconnect.');
            } else {
                toast.success(t('common.success') || 'Success', 'Thank you for your generous donation!');
            }
        } catch (error) {
            console.error('Donation failed:', error);
            toast.error(t('common.error') || 'Error', 'Failed to process donation.');
        }
    };

    return (
        <View className="flex-1 bg-white">
            <Header 
                title={t('donate.title')} 
                subtitle={t('donate.subtitle')} 
                showBack 
            />

            <ScrollView 
                className="flex-1 px-6 pt-6" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <ContributionStatsCard 
                    amount="LKR 12,450" 
                    totalLabel={t('donate.total_label')} 
                    helpedMsg={t('donate.helped_msg', { count: 23 })} 
                />

                <Text className="text-[#1E3A8A] text-xl font-extrabold mb-6 uppercase tracking-tight">
                    {t('donate.verified_title')}
                </Text>

                {requests.map((request, index) => (
                    <DonationRequestCard 
                        key={index}
                        title={request.title}
                        recipient={request.recipient}
                        amount={request.amount}
                        perKitLabel={t('donate.per_kit')}
                        donateNowLabel={t('donate.donate_now')}
                        accentColor={request.accentColor}
                        onPress={() => handleDonate(request)}
                    />
                ))}
                {status === 'submitting' && (
                    <View className="py-4 items-center">
                        <ActivityIndicator size="large" color="#4F46E5" />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
