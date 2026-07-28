import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Alert,
    ActivityIndicator, ScrollView, Platform, StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/api';
import { Eye, EyeOff, Mail, Lock, User, Phone, ChevronLeft, ShieldCheck, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync } from '../services/notificationService';

WebBrowser.maybeCompleteAuthSession();

const IS_EXPO_GO =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    (Constants as any).appOwnership === 'expo';

// ── Validation helpers ─────────────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = (v: string) => v === '' || /^(\+94|0)[0-9]{9}$/.test(v.replace(/\s/g, ''));
const hasLetter = (v: string) => /[a-zA-Z]/.test(v);
const hasNumber = (v: string) => /[0-9]/.test(v);

// Password strength: returns 0–3
const passwordStrength = (p: string): number => {
    if (p.length === 0) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (hasLetter(p) && hasNumber(p)) score++;
    if (p.length >= 12 || /[^a-zA-Z0-9]/.test(p)) score++;
    return score;
};
const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Strong'];
const STRENGTH_COLOR = ['', '#EF4444', '#F59E0B', '#22C55E'];

export default function RegisterScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const emailRef = useRef<TextInput>(null);
    const phoneRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const confirmRef = useRef<TextInput>(null);

    const handleGooglePress = () => {
        if (IS_EXPO_GO) {
            Alert.alert(
                'Google Sign-Up',
                'Google Sign-Up is not supported in Expo Go. Please register with your email and password below.',
                [{ text: 'OK' }]
            );
            return;
        }
        // Full Google OAuth — works in APK/development build
        Alert.alert('Google Sign-Up', 'Coming soon in the app build.');
    };

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = 'Full name is required.';
        else if (name.trim().length < 2) e.name = 'Name must be at least 2 characters.';

        if (!email.trim()) e.email = 'Email address is required.';
        else if (!isValidEmail(email)) e.email = 'Enter a valid email address.';

        if (phone && !isValidPhone(phone)) e.phone = 'Enter a valid Sri Lankan phone number (e.g. 077 123 4567).';

        if (!password) e.password = 'Password is required.';
        else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
        else if (!hasLetter(password) || !hasNumber(password)) e.password = 'Password must contain letters and numbers.';

        if (!confirmPassword) e.confirmPassword = 'Please confirm your password.';
        else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match.';

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const clearError = (field: string) => {
        if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    };

    // ── Register ──────────────────────────────────────────────────────────────
    const handleRegister = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await authService.register({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password });
            const msg = 'Your account has been created. Please sign in to continue.';
            if (Platform.OS === 'web') { window.alert('Account Created!\n' + msg); navigation.navigate('Login'); return; }
            Alert.alert('Account Created!', msg, [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }]);
        } catch (error: any) {
            Alert.alert('Registration Failed', error.response?.data?.error || 'Could not create account. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const strength = passwordStrength(password);

    // ── Field helpers ─────────────────────────────────────────────────────────
    const borderColor = (key: string) => errors[key] ? '#EF4444' : focusedField === key ? '#2563EB' : '#E2E8F0';
    const bgColor = (key: string) => errors[key] ? '#FFF5F5' : focusedField === key ? '#EFF6FF' : '#F8FAFC';
    const iconColor = (key: string) => errors[key] ? '#EF4444' : focusedField === key ? '#2563EB' : '#94A3B8';

    const rowStyle = (key: string) => ({
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        backgroundColor: bgColor(key),
        borderWidth: 1.5,
        borderColor: borderColor(key),
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 4,
    });

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <ScrollView
                style={{ flex: 1, backgroundColor: '#1E3A8A' }}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <LinearGradient colors={['#0F172A', '#1E3A8A', '#1D4ED8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 28, flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                            style={{ width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}
                        >
                            <ChevronLeft size={22} color="white" strokeWidth={2.5} />
                        </TouchableOpacity>
                        <View style={{ alignItems: 'center', flex: 1, paddingRight: 54 }}>
                            <ShieldCheck size={28} color="white" strokeWidth={2} />
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '800', marginTop: 4, letterSpacing: -0.3 }}>Join Suraksha</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={{
                    flex: 1, backgroundColor: 'white',
                    borderTopLeftRadius: 32, borderTopRightRadius: 32,
                    paddingHorizontal: 28, paddingTop: 32,
                    paddingBottom: insets.bottom + 24, marginTop: -1,
                }}>
                    <Text style={{ color: '#0F172A', fontSize: 22, fontWeight: '800', marginBottom: 4 }}>Create your account</Text>
                    <Text style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>Help us protect your community</Text>

                    {/* Google Sign-Up — hidden in Expo Go, shown in APK build */}
                    {!IS_EXPO_GO && (
                        <>
                            <TouchableOpacity
                                onPress={handleGooglePress}
                                disabled={loading || googleLoading}
                                activeOpacity={0.85}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16,
                                    paddingVertical: 14, marginBottom: 20,
                                    backgroundColor: googleLoading ? '#F8FAFC' : 'white',
                                }}
                            >
                                {googleLoading
                                    ? <ActivityIndicator color="#2563EB" size="small" />
                                    : <Text style={{ color: '#374151', fontSize: 15, fontWeight: '700' }}>Sign up with Google</Text>
                                }
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                                <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
                                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600', marginHorizontal: 12 }}>OR REGISTER WITH EMAIL</Text>
                                <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
                            </View>
                        </>
                    )}

                    {/* ── Full Name ── */}
                    <Text style={{ color: '#374151', fontSize: 12, fontWeight: '700', marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 }}>FULL NAME *</Text>
                    <View style={rowStyle('name')}>
                        <User size={18} color={iconColor('name')} strokeWidth={2} />
                        <TextInput
                            style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: '#0F172A', fontSize: 15, fontWeight: '500' }}
                            placeholder="John Doe"
                            placeholderTextColor="#CBD5E1"
                            value={name}
                            onChangeText={v => { setName(v); clearError('name'); }}
                            autoCapitalize="words"
                            returnKeyType="next"
                            onSubmitEditing={() => emailRef.current?.focus()}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                        />
                    </View>
                    {errors.name ? <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 12, marginLeft: 4 }}>{errors.name}</Text> : <View style={{ height: 14 }} />}

                    {/* ── Email ── */}
                    <Text style={{ color: '#374151', fontSize: 12, fontWeight: '700', marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 }}>EMAIL ADDRESS *</Text>
                    <View style={rowStyle('email')}>
                        <Mail size={18} color={iconColor('email')} strokeWidth={2} />
                        <TextInput
                            ref={emailRef}
                            style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: '#0F172A', fontSize: 15, fontWeight: '500' }}
                            placeholder="you@example.com"
                            placeholderTextColor="#CBD5E1"
                            value={email}
                            onChangeText={v => { setEmail(v); clearError('email'); }}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            returnKeyType="next"
                            onSubmitEditing={() => phoneRef.current?.focus()}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                        />
                    </View>
                    {errors.email ? <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 12, marginLeft: 4 }}>{errors.email}</Text> : <View style={{ height: 14 }} />}

                    {/* ── Phone ── */}
                    <Text style={{ color: '#374151', fontSize: 12, fontWeight: '700', marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 }}>PHONE NUMBER <Text style={{ color: '#94A3B8', fontWeight: '500' }}>(OPTIONAL)</Text></Text>
                    <View style={rowStyle('phone')}>
                        <Phone size={18} color={iconColor('phone')} strokeWidth={2} />
                        <TextInput
                            ref={phoneRef}
                            style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: '#0F172A', fontSize: 15, fontWeight: '500' }}
                            placeholder="077 123 4567"
                            placeholderTextColor="#CBD5E1"
                            value={phone}
                            onChangeText={v => { setPhone(v); clearError('phone'); }}
                            keyboardType="phone-pad"
                            returnKeyType="next"
                            onSubmitEditing={() => passwordRef.current?.focus()}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                        />
                    </View>
                    {errors.phone ? <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 12, marginLeft: 4 }}>{errors.phone}</Text> : <View style={{ height: 14 }} />}

                    {/* ── Password ── */}
                    <Text style={{ color: '#374151', fontSize: 12, fontWeight: '700', marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 }}>PASSWORD *</Text>
                    <View style={rowStyle('password')}>
                        <Lock size={18} color={iconColor('password')} strokeWidth={2} />
                        <TextInput
                            ref={passwordRef}
                            style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: '#0F172A', fontSize: 15, fontWeight: '500' }}
                            placeholder="Min 8 characters"
                            placeholderTextColor="#CBD5E1"
                            value={password}
                            onChangeText={v => { setPassword(v); clearError('password'); }}
                            secureTextEntry={!showPassword}
                            returnKeyType="next"
                            onSubmitEditing={() => confirmRef.current?.focus()}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                        </TouchableOpacity>
                    </View>
                    {/* Strength bar */}
                    {password.length > 0 && (
                        <View style={{ flexDirection: 'row', gap: 4, marginBottom: 6, marginTop: 6 }}>
                            {[1, 2, 3].map(i => (
                                <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= strength ? STRENGTH_COLOR[strength] : '#E2E8F0' }} />
                            ))}
                            <Text style={{ color: STRENGTH_COLOR[strength], fontSize: 11, fontWeight: '700', marginLeft: 6 }}>{STRENGTH_LABEL[strength]}</Text>
                        </View>
                    )}
                    {errors.password ? <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 12, marginLeft: 4 }}>{errors.password}</Text> : <View style={{ height: 14 }} />}

                    {/* ── Confirm Password ── */}
                    <Text style={{ color: '#374151', fontSize: 12, fontWeight: '700', marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 }}>CONFIRM PASSWORD *</Text>
                    <View style={rowStyle('confirmPassword')}>
                        <Lock size={18} color={iconColor('confirmPassword')} strokeWidth={2} />
                        <TextInput
                            ref={confirmRef}
                            style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: '#0F172A', fontSize: 15, fontWeight: '500' }}
                            placeholder="Re-enter your password"
                            placeholderTextColor="#CBD5E1"
                            value={confirmPassword}
                            onChangeText={v => { setConfirmPassword(v); clearError('confirmPassword'); }}
                            secureTextEntry={!showConfirm}
                            returnKeyType="done"
                            onSubmitEditing={handleRegister}
                            onFocus={() => setFocusedField('confirmPassword')}
                            onBlur={() => setFocusedField(null)}
                        />
                        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            {showConfirm ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                        </TouchableOpacity>
                        {confirmPassword.length > 0 && password === confirmPassword && (
                            <CheckCircle size={18} color="#22C55E" strokeWidth={2} style={{ marginLeft: 6 }} />
                        )}
                    </View>
                    {errors.confirmPassword ? <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 16, marginLeft: 4 }}>{errors.confirmPassword}</Text> : <View style={{ height: 20 }} />}

                    {/* ── Submit ── */}
                    <TouchableOpacity
                        onPress={handleRegister}
                        disabled={loading || googleLoading}
                        activeOpacity={0.85}
                        style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}
                    >
                        <LinearGradient
                            colors={['#1E3A8A', '#2563EB', '#3B82F6']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={{ paddingVertical: 17, alignItems: 'center', justifyContent: 'center' }}
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }}>Create Account</Text>}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7} style={{ alignItems: 'center', paddingVertical: 8 }}>
                        <Text style={{ color: '#64748B', fontSize: 15 }}>
                            Already have an account?{' '}
                            <Text style={{ color: '#2563EB', fontWeight: '700' }}>Sign in</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    );
}
