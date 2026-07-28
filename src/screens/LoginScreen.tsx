import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    Alert, ActivityIndicator, KeyboardAvoidingView,
    Platform, ScrollView, StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react-native';
import { registerForPushNotificationsAsync } from '../services/notificationService';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import Constants, { ExecutionEnvironment } from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

const IS_EXPO_GO =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    (Constants as any).appOwnership === 'expo';

// ── Validation helpers ─────────────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const passwordRef = useRef<TextInput>(null);


    const handleGoogleToken = async (idToken: string) => {
        try {
            const res = await authService.googleLogin(idToken);
            const { token, user } = res.data;
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            registerForPushNotificationsAsync().catch(() => {});
            navigation.replace('MainTabs');
        } catch (err: any) {
            const msg = err.response?.data?.error || err.response?.data?.message || 'Google sign-in failed. Please try again.';
            Alert.alert('Sign-In Failed', msg);
        } finally {
            setGoogleLoading(false);
        }
    };

    // ── Field validation ───────────────────────────────────────────────────────
    const validate = () => {
        const e: Record<string, string> = {};
        if (!email.trim()) e.email = 'Email address is required.';
        else if (!isValidEmail(email)) e.email = 'Enter a valid email address.';
        if (!password) e.password = 'Password is required.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const clearError = (field: string) => {
        if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    };

    // ── Login ──────────────────────────────────────────────────────────────────
    const handleLogin = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await authService.login({ email: email.trim().toLowerCase(), password });
            const { token, user } = res.data;
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            registerForPushNotificationsAsync().catch(() => {});
            navigation.replace('MainTabs');
        } catch (error: any) {
            const isNetwork = !error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error';
            Alert.alert(
                'Login Failed',
                isNetwork
                    ? 'Cannot reach the server. Make sure your phone and PC are on the same Wi-Fi and the backend is running.'
                    : error.response?.data?.error || error.response?.data?.message || 'Invalid email or password.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGooglePress = () => {
        if (IS_EXPO_GO) {
            Alert.alert(
                'Google Sign-In',
                'Google Sign-In is not supported in Expo Go. Please use your email and password, or install the full app build.',
                [{ text: 'OK' }]
            );
            return;
        }
        // Full Google OAuth flow — works in APK/development build
        Alert.alert('Google Sign-In', 'Coming soon in the app build.');
    };

    // ── UI ─────────────────────────────────────────────────────────────────────
    const fieldStyle = (key: string) => ({
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        backgroundColor: errors[key] ? '#FFF5F5' : focusedField === key ? '#EFF6FF' : '#F8FAFC',
        borderWidth: 1.5,
        borderColor: errors[key] ? '#EF4444' : focusedField === key ? '#2563EB' : '#E2E8F0',
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 4,
    });

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <LinearGradient colors={['#0F172A', '#1E3A8A', '#1D4ED8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* Branding */}
                    <View style={{ paddingTop: insets.top + 40, paddingHorizontal: 32, paddingBottom: 40, alignItems: 'center' }}>
                        <View style={{
                            width: 72, height: 72,
                            backgroundColor: 'rgba(255,255,255,0.12)',
                            borderRadius: 22, alignItems: 'center', justifyContent: 'center',
                            marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
                        }}>
                            <ShieldCheck size={36} color="white" strokeWidth={2} />
                        </View>
                        <Text style={{ color: 'white', fontSize: 32, fontWeight: '900', letterSpacing: -1, marginBottom: 6 }}>SURAKSHA</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '500' }}>Your safety, our priority</Text>
                    </View>

                    {/* Form card */}
                    <View style={{
                        flex: 1, backgroundColor: 'white',
                        borderTopLeftRadius: 32, borderTopRightRadius: 32,
                        paddingHorizontal: 28, paddingTop: 36,
                        paddingBottom: insets.bottom + 24, minHeight: 420,
                    }}>
                        <Text style={{ color: '#0F172A', fontSize: 24, fontWeight: '800', marginBottom: 4 }}>Welcome back</Text>
                        <Text style={{ color: '#64748B', fontSize: 14, marginBottom: 28 }}>Sign in to your account to continue</Text>

                        {/* Email */}
                        <Text style={{ color: '#374151', fontSize: 12, fontWeight: '700', marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 }}>EMAIL ADDRESS</Text>
                        <View style={fieldStyle('email')}>
                            <Mail size={18} color={errors.email ? '#EF4444' : focusedField === 'email' ? '#2563EB' : '#94A3B8'} strokeWidth={2} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 15, paddingHorizontal: 12, color: '#0F172A', fontSize: 15, fontWeight: '500' }}
                                placeholder="you@example.com"
                                placeholderTextColor="#CBD5E1"
                                value={email}
                                onChangeText={v => { setEmail(v); clearError('email'); }}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                returnKeyType="next"
                                onSubmitEditing={() => passwordRef.current?.focus()}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>
                        {errors.email ? <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 12, marginLeft: 4 }}>{errors.email}</Text> : <View style={{ height: 16 }} />}

                        {/* Password */}
                        <Text style={{ color: '#374151', fontSize: 12, fontWeight: '700', marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 }}>PASSWORD</Text>
                        <View style={fieldStyle('password')}>
                            <Lock size={18} color={errors.password ? '#EF4444' : focusedField === 'password' ? '#2563EB' : '#94A3B8'} strokeWidth={2} />
                            <TextInput
                                ref={passwordRef}
                                style={{ flex: 1, paddingVertical: 15, paddingHorizontal: 12, color: '#0F172A', fontSize: 15, fontWeight: '500' }}
                                placeholder="Your password"
                                placeholderTextColor="#CBD5E1"
                                value={password}
                                onChangeText={v => { setPassword(v); clearError('password'); }}
                                secureTextEntry={!showPassword}
                                returnKeyType="done"
                                onSubmitEditing={handleLogin}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                {showPassword ? <EyeOff size={18} color="#94A3B8" strokeWidth={2} /> : <Eye size={18} color="#94A3B8" strokeWidth={2} />}
                            </TouchableOpacity>
                        </View>
                        {errors.password ? <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 12, marginLeft: 4 }}>{errors.password}</Text> : <View style={{ height: 20 }} />}

                        {/* Sign In button */}
                        <TouchableOpacity onPress={handleLogin} disabled={loading || googleLoading} activeOpacity={0.85} style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
                            <LinearGradient colors={['#1E3A8A', '#2563EB', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 17, alignItems: 'center', justifyContent: 'center' }}>
                                {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }}>Sign In</Text>}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Google Sign-In — hidden in Expo Go, shown in APK build */}
                        {!IS_EXPO_GO && (
                            <>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                    <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
                                    <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600', marginHorizontal: 12 }}>OR CONTINUE WITH</Text>
                                    <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
                                </View>
                                <TouchableOpacity
                                    onPress={handleGooglePress}
                                    disabled={loading || googleLoading}
                                    activeOpacity={0.85}
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                        borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16,
                                        paddingVertical: 15, marginBottom: 24,
                                        backgroundColor: googleLoading ? '#F8FAFC' : 'white',
                                    }}
                                >
                                    {googleLoading
                                        ? <ActivityIndicator color="#2563EB" size="small" />
                                        : <Text style={{ color: '#374151', fontSize: 15, fontWeight: '700' }}>Continue with Google</Text>
                                    }
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Register link */}
                        <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7} style={{ alignItems: 'center', paddingVertical: 8 }}>
                            <Text style={{ color: '#64748B', fontSize: 15 }}>
                                New to Suraksha?{' '}
                                <Text style={{ color: '#2563EB', fontWeight: '700' }}>Create account</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}
