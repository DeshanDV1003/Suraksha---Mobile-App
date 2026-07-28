import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, ActivityIndicator,
    StatusBar, Linking, Platform, Alert
} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, AlertTriangle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
    onGranted: () => void;
}

export default function LocationGateScreen({ onGranted }: Props) {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [denied, setDenied] = useState(false);

    const requestPermission = async () => {
        setLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                onGranted();
            } else {
                setDenied(true);
            }
        } catch {
            setDenied(true);
        } finally {
            setLoading(false);
        }
    };

    const openSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else {
            Linking.openSettings();
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <LinearGradient
                colors={['#0F172A', '#1E3A8A', '#1D4ED8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center' }}
            >
                {/* Icon */}
                <View style={{
                    width: 100, height: 100, borderRadius: 32,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
                    alignItems: 'center', justifyContent: 'center',
                    marginBottom: 32,
                }}>
                    {denied
                        ? <AlertTriangle size={48} color="#FBBF24" strokeWidth={2} />
                        : <MapPin size={48} color="white" strokeWidth={2} />
                    }
                </View>

                {/* Title */}
                <Text style={{
                    color: 'white', fontSize: 26, fontWeight: '900',
                    letterSpacing: -0.5, textAlign: 'center', marginBottom: 16,
                }}>
                    {denied ? 'Location Access Required' : 'Enable Location'}
                </Text>

                {/* Description */}
                <Text style={{
                    color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '500',
                    textAlign: 'center', lineHeight: 24, marginBottom: 12,
                }}>
                    {denied
                        ? 'You have denied location access. Suraksha needs your location to show nearby alerts, safe zones, and relief camps.'
                        : 'Suraksha needs your location to show nearby disaster alerts, safe zones, and relief camps in your area.'
                    }
                </Text>

                {denied && (
                    <Text style={{
                        color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500',
                        textAlign: 'center', lineHeight: 20, marginBottom: 12,
                    }}>
                        Please go to your phone Settings → Apps → Suraksha → Permissions → Location and enable it.
                    </Text>
                )}

                {/* Bullet points */}
                {!denied && (
                    <View style={{ alignSelf: 'stretch', marginBottom: 40, gap: 10 }}>
                        {[
                            'Show alerts near your location',
                            'Find the nearest relief camps',
                            'Enable safe route navigation',
                            'Verify your area during disasters',
                        ].map(item => (
                            <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#60A5FA' }} />
                                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '500' }}>{item}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {denied && <View style={{ height: 32 }} />}

                {/* Primary button */}
                <TouchableOpacity
                    onPress={denied ? openSettings : requestPermission}
                    disabled={loading}
                    activeOpacity={0.85}
                    style={{
                        width: '100%', backgroundColor: 'white',
                        borderRadius: 18, paddingVertical: 18,
                        alignItems: 'center', justifyContent: 'center',
                        marginBottom: 16,
                        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
                    }}
                >
                    {loading
                        ? <ActivityIndicator color="#1E3A8A" />
                        : <Text style={{ color: '#1E3A8A', fontSize: 16, fontWeight: '900', letterSpacing: 0.3 }}>
                            {denied ? 'Open Settings' : 'Allow Location Access'}
                        </Text>
                    }
                </TouchableOpacity>

                {/* Try again button when denied */}
                {denied && (
                    <TouchableOpacity
                        onPress={requestPermission}
                        disabled={loading}
                        activeOpacity={0.7}
                        style={{ paddingVertical: 12 }}
                    >
                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' }}>
                            Try again
                        </Text>
                    </TouchableOpacity>
                )}

                <Text style={{
                    color: 'rgba(255,255,255,0.4)', fontSize: 12,
                    textAlign: 'center', marginTop: 20, lineHeight: 18,
                }}>
                    Location data is only used within the app and is never shared without your consent.
                </Text>
            </LinearGradient>
        </View>
    );
}
