import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { VerifiedTokenCard } from '../components/ReliefTokenScreen/VerifiedTokenCard';
import { CollectionHistoryItem } from '../components/ReliefTokenScreen/CollectionHistoryItem';
import { ChevronRight } from 'lucide-react-native';

export default function ReliefTokenScreen() {
    const { t } = useTranslation();

    const historyItems = [
        {
            title: t('token.food_package'),
            location: "Colombo CC",
            time: "2 hours ago",
            status: t('token.collected')
        },
        {
            title: t('token.water_20l'),
            location: "Colombo CC",
            time: "5 hours ago",
            status: t('token.collected')
        },
        {
            title: t('token.medicine'),
            location: "Dehiwala Camp",
            time: "1 day ago",
            status: t('token.collected')
        }
    ];

    return (
        <View className="flex-1 bg-white">
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
                <VerifiedTokenCard
                    id={t('token.id_label')}
                    userName={t('token.user_name')}
                    familyInfo={t('token.family_info')}
                    verifiedLabel={t('token.verified')}
                />

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
