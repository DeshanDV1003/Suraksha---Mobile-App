import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { IncidentForm } from '../components/ReportScreen/IncidentForm';
import { LocationPicker } from '../components/ReportScreen/LocationPicker';
import { EvidenceUpload } from '../components/ReportScreen/EvidenceUpload';
import { CustomButton } from '../components/common/CustomButton';

export default function ReportScreen() {
    const { t } = useTranslation();
    const [description, setDescription] = useState('');
    const [peopleAffected, setPeopleAffected] = useState('');

    return (
        <View className="flex-1 bg-white">
            <Header title={t('report.title')} showBack />
            <ScrollView className="flex-1 px-6 pt-4">
                <IncidentForm 
                    incidentType="Flood" 
                    onTypePress={() => {}} 
                    description={description}
                    setDescription={setDescription}
                    peopleAffected={peopleAffected}
                    setPeopleAffected={setPeopleAffected}
                    labels={{
                        type: t('report.incident_type'),
                        desc: t('report.description'),
                        placeholder: t('report.desc_placeholder'),
                        autoDetect: t('report.auto_detect'),
                        people: t('report.people_affected'),
                        numPlaceholder: t('report.num_placeholder')
                    }}
                />
                <LocationPicker 
                    location="Colombo 7, Sri Lanka" 
                    label={t('report.location')}
                    gpsLabel={t('report.gps_location')}
                />
                <EvidenceUpload 
                    label={t('report.add_evidence')}
                    photoLabel={t('report.take_photo')}
                    videoLabel={t('report.record_video')}
                />
                
                <CustomButton 
                    label={t('common.submit')} 
                    onPress={() => {}} 
                    variant="primary"
                    className="mb-10 py-4"
                />
            </ScrollView>
        </View>
    );
}
