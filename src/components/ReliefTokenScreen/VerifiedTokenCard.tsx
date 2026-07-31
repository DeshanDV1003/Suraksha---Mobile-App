import React from 'react';
import { View, Text, Image } from 'react-native';
import { ShieldCheck, QrCode } from 'lucide-react-native';

interface VerifiedTokenCardProps {
    id: string;
    userName: string;
    familyInfo: string;
    verifiedLabel: string;
    qrCodeData?: string | null;
    tokenType?: string;
}

export const VerifiedTokenCard: React.FC<VerifiedTokenCardProps> = ({
    id,
    userName,
    familyInfo,
    verifiedLabel,
    qrCodeData,
    tokenType,
}) => {
    return (
        <View style={{
            backgroundColor: 'white',
            borderRadius: 32,
            borderWidth: 3,
            borderColor: '#2563EB',
            padding: 32,
            marginBottom: 24,
            alignItems: 'center',
        }}>
            {/* Verified Badge */}
            <View style={{
                backgroundColor: '#EFF6FF',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 50,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 28,
            }}>
                <ShieldCheck size={20} color="#2563EB" strokeWidth={2.5} />
                <Text style={{ color: '#2563EB', fontSize: 12, fontWeight: '800', marginLeft: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {verifiedLabel}
                </Text>
            </View>

            {/* QR Code — real image if available, placeholder otherwise */}
            <View style={{
                backgroundColor: '#F1F5F9',
                borderRadius: 20,
                width: 220,
                height: 220,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 28,
                overflow: 'hidden',
            }}>
                {qrCodeData ? (
                    <Image
                        source={{ uri: qrCodeData }}
                        style={{ width: 200, height: 200 }}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={{ alignItems: 'center' }}>
                        <QrCode size={100, 100} color="#94A3B8" strokeWidth={1.5} />
                        <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 8, fontWeight: '600' }}>
                            Show code at camp
                        </Text>
                    </View>
                )}
            </View>

            {/* Token code */}
            <Text style={{ color: '#1E3A8A', fontSize: 28, fontWeight: '900', marginBottom: 8, letterSpacing: -0.5 }}>
                {id}
            </Text>

            {tokenType ? (
                <View style={{ backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 8 }}>
                    <Text style={{ color: '#1D4ED8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{tokenType}</Text>
                </View>
            ) : null}

            <Text style={{ color: '#1E3A8A', fontSize: 18, fontWeight: '700', marginBottom: 4 }}>
                {userName}
            </Text>

            <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {familyInfo}
            </Text>
        </View>
    );
};
