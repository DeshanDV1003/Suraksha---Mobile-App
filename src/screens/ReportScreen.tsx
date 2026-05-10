import React, { useState } from 'react';
import { ScrollView, View, Text, Modal, TouchableOpacity as RNTouchableOpacity, FlatList, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { IncidentForm } from '../components/ReportScreen/IncidentForm';
import { LocationPicker } from '../components/ReportScreen/LocationPicker';
import { EvidenceUpload } from '../components/ReportScreen/EvidenceUpload';
import { CustomButton } from '../components/common/CustomButton';
import { VoiceReport } from '../components/ReportScreen/VoiceReport';
import { NeedsSelection } from '../components/ReportScreen/NeedsSelection';
import { SendHorizonal, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { incidentService } from '../services/api';

export default function ReportScreen() {
    const { t } = useTranslation();
    const [description, setDescription] = useState('');
    const [peopleAffected, setPeopleAffected] = useState('');
    const [incidentType, setIncidentType] = useState('');
    const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    const incidentTypes = [
        { id: 'flood', label: t('report.flood') || 'Flood' },
        { id: 'landslide', label: t('report.landslide') || 'Landslide' },
        { id: 'fire', label: t('report.fire') || 'Fire' },
        { id: 'building_collapse', label: t('report.building_collapse') || 'Building Collapse' },
        { id: 'medical_emergency', label: t('report.medical_emergency') || 'Medical Emergency' },
        { id: 'other', label: t('report.other') || 'Other' },
    ];

    const handleSelectType = (label: string) => {
        setIncidentType(label);
        setIsTypeModalVisible(false);
    };

    const handleSubmit = async () => {
        if (!incidentType || !description) {
            Alert.alert(t('common.error'), "Please select an incident type and provide a description.");
            return;
        }

        setLoading(true);
        try {
            const data = {
                title: incidentType,
                description: description,
                location: "Colombo 7, Sri Lanka", // This could be dynamic from LocationPicker
                latitude: 6.9271,
                longitude: 79.8612,
                category: incidentType,
                peopleAffected: parseInt(peopleAffected) || 0,
            };

            await incidentService.report(data);
            
            Alert.alert(
                t('common.success'), 
                "Your report has been submitted and is being processed by our system.",
                [{ text: "OK", onPress: () => navigation.navigate('Home') }]
            );
        } catch (error) {
            console.error('Failed to submit report:', error);
            Alert.alert(t('common.error'), "Failed to submit report. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <Header title={t('report.title') || "Report Incident"} showBack />
            
            <ScrollView 
                className="flex-1 px-6 pt-2" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <IncidentForm 
                    incidentType={incidentType} 
                    onTypePress={() => setIsTypeModalVisible(true)} 
                    description={description}
                    setDescription={setDescription}
                    peopleAffected={peopleAffected}
                    setPeopleAffected={setPeopleAffected}
                    labels={{
                        type: t('report.incident_type') || "Incident Type",
                        desc: t('report.description') || "Description",
                        placeholder: t('report.desc_placeholder') || "Describe the incident...",
                        autoDetect: t('report.auto_detect') || "Auto-detected: English",
                        people: t('report.people_affected') || "Estimated People Affected",
                        numPlaceholder: t('report.num_placeholder') || "Enter number..."
                    }}
                />

                <LocationPicker 
                    location="Colombo 7, Sri Lanka" 
                    label={t('report.location') || "Location"}
                    gpsLabel={t('report.gps_location') || "Using GPS Location"}
                />

                <EvidenceUpload 
                    label={t('report.add_evidence') || "Add Evidence (Optional)"}
                    photoLabel={t('report.take_photo') || "Take Photo"}
                    videoLabel={t('report.record_video') || "Record Video"}
                />

                <VoiceReport 
                    label={t('report.voice_report') || "Voice Report (Optional)"}
                    actionLabel={t('report.record_voice') || "Record Voice Message"}
                    subtitle={t('report.stt_enabled') || "Speech-to-text enabled"}
                />

                <NeedsSelection 
                    label={t('report.special_needs') || "Special Needs at Location"} 
                />
                
                <CustomButton 
                    label={loading ? "Submitting..." : (t('common.submit') || "Submit Report")} 
                    onPress={handleSubmit} 
                    disabled={loading}
                    variant="primary"
                    icon={SendHorizonal}
                    className="mb-4 h-20 rounded-[20px] shadow-lg"
                    textClassName="text-white text-2xl font-extrabold"
                    iconColor="white"
                />

                <Text className="text-[#64748B] text-center text-base font-semibold px-10">
                    {t('report.ml_disclaimer') || "Your report will be processed with ML priority classification"}
                </Text>
            </ScrollView>

            <Modal
                visible={isTypeModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsTypeModalVisible(false)}
            >
                <RNTouchableOpacity 
                    activeOpacity={1} 
                    onPress={() => setIsTypeModalVisible(false)}
                    className="flex-1 bg-black/50 justify-center items-center px-10"
                >
                    <View className="bg-white w-full rounded-[28px] overflow-hidden shadow-2xl">
                        <View className="p-6 border-b border-gray-100">
                            <Text className="text-2xl font-extrabold text-[#1E3A8A]">Select Incident Type</Text>
                        </View>
                        <FlatList
                            data={incidentTypes}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <RNTouchableOpacity
                                    onPress={() => handleSelectType(item.label)}
                                    className={`p-6 border-b border-gray-50 flex-row justify-between items-center ${
                                        incidentType === item.label ? 'bg-[#EFF6FF]' : ''
                                    }`}
                                >
                                    <Text className={`text-xl font-bold ${
                                        incidentType === item.label ? 'text-[#2563EB]' : 'text-gray-700'
                                    }`}>
                                        {item.label}
                                    </Text>
                                    {incidentType === item.label && (
                                        <View className="w-3 h-3 rounded-full bg-[#2563EB]" />
                                    )}
                                </RNTouchableOpacity>
                            )}
                        />
                    </View>
                </RNTouchableOpacity>
            </Modal>
        </View>
    );
}
