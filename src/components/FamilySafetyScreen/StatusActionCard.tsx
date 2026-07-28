import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';

interface StatusActionCardProps {
    title: string;
    description: string;
    icon: any;
    colors: [string, string, ...string[]];
    onPress?: () => void;
}

export const StatusActionCard: React.FC<StatusActionCardProps> = ({ title, description, icon: Icon, colors, onPress }) => (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ marginBottom: 12 }}>
        <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.3 }}
            style={{ borderRadius: 20, flexDirection: 'row', alignItems: 'center', padding: 18, overflow: 'hidden' }}
        >
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Icon size={28} color="white" strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '800', marginBottom: 2 }}>{title}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '500' }}>{description}</Text>
            </View>
            <ChevronRight size={20} color="white" strokeWidth={2.5} />
        </LinearGradient>
    </TouchableOpacity>
);
