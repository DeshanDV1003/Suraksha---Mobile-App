import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { ReliefCampCard } from '../components/ReliefCampsScreen/ReliefCampCard';

export default function ReliefCampsScreen() {
    const { t } = useTranslation();

    const campLabels = {
        occupancy: t('camps.occupancy'),
        services: t('camps.services'),
        waitTime: t('camps.wait_time'),
        getDirections: t('camps.get_directions'),
        allServices: {
            food: t('camps.food'),
            water: t('camps.water'),
            medical: t('camps.medical'),
            charging: t('camps.charging'),
            toilets: t('camps.toilets'),
            'child-care': t('camps.child_care'),
        }
    };

    const reliefCamps = [
        {
            name: "Colombo Community Center",
            distance: "1.2 km",
            currentOccupancy: 65,
            maxOccupancy: 100,
            services: ["food", "water", "medical", "charging"] as const,
            waitTime: "15 min"
        },
        {
            name: "Dehiwala School Hall",
            distance: "2.8 km",
            currentOccupancy: 92,
            maxOccupancy: 120,
            services: ["food", "water", "toilets", "child-care"] as const,
            waitTime: "30 min"
        },
        {
            name: "Wellawatta Temple",
            distance: "3.5 km",
            currentOccupancy: 120,
            maxOccupancy: 120,
            services: ["food", "water"] as const,
            waitTime: t('camps.full')
        }
    ];

    return (
        <View className="flex-1 bg-white">
            <Header 
                title={t('camps.title')} 
                subtitle={t('camps.subtitle')} 
                showBack 
            />

            <ScrollView 
                className="flex-1 px-6 pt-4" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {reliefCamps.map((camp, index) => (
                    <ReliefCampCard 
                        key={index}
                        name={camp.name}
                        distance={camp.distance}
                        currentOccupancy={camp.currentOccupancy}
                        maxOccupancy={camp.maxOccupancy}
                        services={camp.services}
                        waitTime={camp.waitTime}
                        labels={campLabels}
                    />
                ))}
            </ScrollView>
        </View>
    );
}
