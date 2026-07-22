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
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const passwordRef = useRef<TextInput>(null);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing Fields', 'Please enter your email and password.');
            return;
        }
        setLoading(true);
        try {
            const res = await authService.login({ email, password });
            await AsyncStorage.setItem('token', res.data.token);
            await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
            navigation.replace('MainTabs');
        } catch (error: any) {
            const isNetworkError = !error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error';
            Alert.alert(
                'Login Failed',
                isNetworkError
                    ? 'Cannot reach the server. Make sure:\n• Your phone and PC are on the same Wi-Fi\n• The backend server is running\n• IP address is correct (192.168.8.121)'
                    : error.response?.data?.error || error.response?.data?.message || 'Invalid email or password.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <LinearGradient
                colors={['#0F172A', '#1E3A8A', '#1D4ED8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Top branding area */}
                    <View style={{
                        paddingTop: insets.top + 40,
                        paddingHorizontal: 32,
                        paddingBottom: 40,
                        alignItems: 'center',
                    }}>
                        <View style={{
                            width: 72,
                            height: 72,
                            backgroundColor: 'rgba(255,255,255,0.12)',
                            borderRadius: 22,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 20,
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.2)',
                        }}>
                            <ShieldCheck size={36} color="white" strokeWidth={2} />
                        </View>
                        <Text style={{
                            color: 'white',
                            fontSize: 32,
                            fontWeight: '900',
                            letterSpacing: -1,
                            marginBottom: 6,
                        }}>
                            SURAKSHA
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '500' }}>
                            Your safety, our priority
                        </Text>
                    </View>

                    {/* Form card */}
                    <View style={{
                        flex: 1,
                        backgroundColor: 'white',
                        borderTopLeftRadius: 32,
                        borderTopRightRadius: 32,
                        paddingHorizontal: 28,
                        paddingTop: 36,
                        paddingBottom: insets.bottom + 24,
                        minHeight: 420,
                    }}>
                        <Text style={{ color: '#0F172A', fontSize: 24, fontWeight: '800', marginBottom: 6 }}>
                            Welcome back
                        </Text>
                        <Text style={{ color: '#64748B', fontSize: 14, marginBottom: 32 }}>
                            Sign in to your account to continue
                        </Text>

                        {/* Email */}
                        <Text style={{ color: '#374151', fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4 }}>
                            EMAIL ADDRESS
                        </Text>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: focusedField === 'email' ? '#EFF6FF' : '#F8FAFC',
                            borderWidth: 1.5,
                            borderColor: focusedField === 'email' ? '#2563EB' : '#E2E8F0',
                            borderRadius: 16,
                            paddingHorizontal: 16,
                            marginBottom: 20,
                        }}>
                            <Mail size={18} color={focusedField === 'email' ? '#2563EB' : '#94A3B8'} strokeWidth={2} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 15, paddingHorizontal: 12, color: '#0F172A', fontSize: 15, fontWeight: '500' }}
                                placeholder="you@example.com"
                                placeholderTextColor="#CBD5E1"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                returnKeyType="next"
                                onSubmitEditing={() => passwordRef.current?.focus()}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>

                        {/* Password */}
                        <Text style={{ color: '#374151', fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4 }}>
                            PASSWORD
                        </Text>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: focusedField === 'password' ? '#EFF6FF' : '#F8FAFC',
                            borderWidth: 1.5,
                            borderColor: focusedField === 'password' ? '#2563EB' : '#E2E8F0',
                            borderRadius: 16,
                            paddingHorizontal: 16,
                            marginBottom: 32,
                        }}>
                            <Lock size={18} color={focusedField === 'password' ? '#2563EB' : '#94A3B8'} strokeWidth={2} />
                            <TextInput
                                ref={passwordRef}
                                style={{ flex: 1, paddingVertical: 15, paddingHorizontal: 12, color: '#0F172A', fontSize: 15, fontWeight: '500' }}
                                placeholder="••••••••"
                                placeholderTextColor="#CBD5E1"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                returnKeyType="done"
                                onSubmitEditing={handleLogin}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                {showPassword
                                    ? <EyeOff size={18} color="#94A3B8" strokeWidth={2} />
                                    : <Eye size={18} color="#94A3B8" strokeWidth={2} />
                                }
                            </TouchableOpacity>
                        </View>

                        {/* Login button */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.85}
                            style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}
                        >
                            <LinearGradient
                                colors={['#1E3A8A', '#2563EB', '#3B82F6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ paddingVertical: 17, alignItems: 'center', justifyContent: 'center' }}
                            >
                                {loading
                                    ? <ActivityIndicator color="white" />
                                    : <Text style={{ color: 'white', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }}>Sign In</Text>
                                }
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Register')}
                            activeOpacity={0.7}
                            style={{ alignItems: 'center', paddingVertical: 8 }}
                        >
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
