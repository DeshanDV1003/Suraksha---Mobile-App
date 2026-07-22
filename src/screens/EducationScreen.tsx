import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { ArticleCard } from '../components/EducationScreen/ArticleCard';
import { 
    AlertTriangle, 
    Droplets, 
    ShieldCheck, 
    Users, 
    Heart, 
    MapPin 
} from 'lucide-react-native';

export default function EducationScreen() {
    const { t } = useTranslation();

    const eduLabels = {
        minRead: t('edu.min_read'),
        completed: t('edu.completed')
    };

    const articles = [
        {
            title: t('edu.flood_title'),
            readTime: "5",
            completed: true,
            icon: AlertTriangle,
            iconColor: "#3B82F6" // Blue
        },
        {
            title: t('edu.water_title'),
            readTime: "4",
            completed: false,
            icon: Droplets,
            iconColor: "#06B6D4" // Cyan
        },
        {
            title: t('edu.report_title'),
            readTime: "3",
            completed: true,
            icon: ShieldCheck,
            iconColor: "#10B981" // Green
        },
        {
            title: t('edu.rescue_title'),
            readTime: "6",
            completed: false,
            icon: Users,
            iconColor: "#8B5CF6" // Purple
        },
        {
            title: t('edu.hygiene_title'),
            readTime: "7",
            completed: false,
            icon: Heart,
            iconColor: "#EC4899" // Pink
        },
        {
            title: t('edu.landslide_title'),
            readTime: "5",
            completed: false,
            icon: MapPin,
            iconColor: "#F97316" // Orange
        }
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <Header 
                title={t('edu.title')} 
                subtitle={t('edu.subtitle')} 
                showBack 
            />

            <ScrollView 
                className="flex-1 px-6 pt-6" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {articles.map((article, index) => (
                    <ArticleCard 
                        key={index}
                        title={article.title}
                        readTime={article.readTime}
                        completed={article.completed}
                        icon={article.icon}
                        iconColor={article.iconColor}
                        labels={eduLabels}
                        onPress={() => {}}
                    />
                ))}
            </ScrollView>
        </View>
    );
}
