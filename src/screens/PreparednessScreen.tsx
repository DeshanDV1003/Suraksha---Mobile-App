import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { GlobalProgressCard } from '../components/PreparednessScreen/GlobalProgressCard';
import { CategoryCard } from '../components/PreparednessScreen/CategoryCard';
import { 
    Package, 
    AlertTriangle, 
    CornerUpRight, 
    Heart, 
    Phone 
} from 'lucide-react-native';

export default function PreparednessScreen() {
    const { t } = useTranslation();

    const categories = [
        {
            title: t('prep.emergency_bag'),
            current: 5,
            total: 12,
            icon: Package
        },
        {
            title: t('prep.flood'),
            current: 4,
            total: 8,
            icon: AlertTriangle
        },
        {
            title: t('prep.evacuation'),
            current: 2,
            total: 6,
            icon: CornerUpRight
        },
        {
            title: t('prep.first_aid'),
            current: 0,
            total: 10,
            icon: Heart
        },
        {
            title: t('prep.helplines'),
            current: 5,
            total: 5,
            icon: Phone
        }
    ];

    return (
        <View className="flex-1 bg-white">
            <Header 
                title={t('prep.title')} 
                subtitle={t('prep.subtitle')} 
                showBack 
            />

            <ScrollView 
                className="flex-1 px-6 pt-6" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <GlobalProgressCard 
                    progress={45} 
                    label={t('prep.progress')} 
                />

                {categories.map((category, index) => (
                    <CategoryCard 
                        key={index}
                        title={category.title}
                        current={category.current}
                        total={category.total}
                        icon={category.icon}
                        onPress={() => {}}
                    />
                ))}
            </ScrollView>
        </View>
    );
}
