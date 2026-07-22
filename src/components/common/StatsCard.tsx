import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StatsCardProps {
    label: string;
    count: string | number;
    variant?: 'danger' | 'success' | 'info' | 'warning' | 'white';
    icon?: LucideIcon;
    onPress?: () => void;
    size?: 'small' | 'large';
    layout?: 'vertical' | 'horizontal';
    className?: string;
    customCountColor?: string;
}

const gradients: Record<string, [string, string]> = {
    danger:  ['#EF4444', '#F97316'],
    success: ['#059669', '#10B981'],
    info:    ['#2563EB', '#3B82F6'],
    warning: ['#F59E0B', '#FBBF24'],
    white:   ['#FFFFFF', '#F8FAFC'],
};

const textColors: Record<string, string> = {
    danger:  '#FFF',
    success: '#FFF',
    info:    '#FFF',
    warning: '#FFF',
    white:   '#0F172A',
};

const subTextColors: Record<string, string> = {
    danger:  'rgba(255,255,255,0.8)',
    success: 'rgba(255,255,255,0.8)',
    info:    'rgba(255,255,255,0.8)',
    warning: 'rgba(255,255,255,0.8)',
    white:   '#64748B',
};

export const StatsCard: React.FC<StatsCardProps> = ({
    label,
    count,
    variant = 'white',
    icon: Icon,
    onPress,
    className = '',
    customCountColor,
}) => {
    const [c1, c2] = gradients[variant];
    const isColored = variant !== 'white';

    return (
        <TouchableOpacity
            disabled={!onPress}
            onPress={onPress}
            activeOpacity={0.8}
            style={{
                flex: 1,
                marginHorizontal: 4,
                borderRadius: 18,
                overflow: 'hidden',
                shadowColor: isColored ? c1 : '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: isColored ? 0.25 : 0.06,
                shadowRadius: 8,
                elevation: 4,
            }}
        >
            <LinearGradient
                colors={[c1, c2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 16, minHeight: 90 }}
            >
                {Icon && (
                    <Icon
                        size={22}
                        color={isColored ? 'rgba(255,255,255,0.85)' : '#64748B'}
                        strokeWidth={2}
                        style={{ marginBottom: 8 }}
                    />
                )}
                <Text style={{
                    fontSize: 28,
                    fontWeight: '900',
                    color: customCountColor || textColors[variant],
                    letterSpacing: -1,
                    lineHeight: 32,
                }}>
                    {count}
                </Text>
                <Text style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: subTextColors[variant],
                    marginTop: 3,
                }}>
                    {label}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};
