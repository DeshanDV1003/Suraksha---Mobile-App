import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ActionGridCardProps {
    label: string;
    icon: LucideIcon;
    onPress: () => void;
    bgColor: string;
    iconSize?: number;
}

// Slightly lighten a hex color to create a gradient pair
function lightenColor(hex: string): string {
    const map: Record<string, string> = {
        '#F43F5E': '#FB7185',
        '#E11D48': '#F43F5E',
        '#2563EB': '#60A5FA',
        '#3B82F6': '#93C5FD',
        '#A855F7': '#C084FC',
        '#10B981': '#34D399',
        '#0D9488': '#2DD4BF',
        '#6366F1': '#818CF8',
        '#FB923C': '#FDBA74',
        '#7C3AED': '#A78BFA',
    };
    return map[hex] || hex + 'CC';
}

export const ActionGridCard: React.FC<ActionGridCardProps> = ({
    label,
    icon: Icon,
    onPress,
    bgColor,
    iconSize = 32,
}) => {
    const lightColor = lightenColor(bgColor);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.82}
            style={{
                flex: 1,
                margin: 6,
                borderRadius: 20,
                overflow: 'hidden',
                shadowColor: bgColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
                minHeight: 120,
            }}
        >
            <LinearGradient
                colors={[bgColor, lightColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, padding: 18, justifyContent: 'space-between' }}
            >
                <View style={{
                    width: 46,
                    height: 46,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Icon size={iconSize} color="white" strokeWidth={1.8} />
                </View>
                <Text style={{
                    color: 'white',
                    fontSize: 13,
                    fontWeight: '700',
                    marginTop: 12,
                    lineHeight: 17,
                }}>
                    {label}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};
