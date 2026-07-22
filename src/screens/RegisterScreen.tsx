import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Alert,
    ActivityIndicator, ScrollView, Platform, StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff, Mail, Lock, User, Phone, ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const emailRef = useRef<TextInput>(null);
    const phoneRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }
        setLoading(true);
        try {
            await authService.register({ name, email, phone, password });
            const successMsg = 'Your account has been created. Please log in to continue.';
            if (Platform.OS === 'web') {
                window.alert('Registration Successful\n' + successMsg);
                navigation.navigate('Login');
                return;
            }
            Alert.alert('Account Created!', successMsg, [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }]);
        } catch (error: any) {
            Alert.alert('Registration Failed', error.response?.data?.error || 'Could not create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({
        label, value, onChangeText, placeholder, secureTextEntry, icon: Icon,
        keyboardType, returnKeyType, onSubmitEditing, ref: fieldRef,
        rightElement, fieldKey, autoCapitalize
    }: any) => (
        <View style={{ marginBottom: 18 }}>
            <Text style={{ color: '#374151', fontSize: 12, fontWeight: '700', marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 }}>
                {label}
            </Text>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: focusedField === fieldKey ? '#EFF6FF' : '#F8FAFC',
                borderWidth: 1.5,
                borderColor: focusedField === fieldKey ? '#2563EB' : '#E2E8F0',
                borderRadius: 16,
                paddingHorizontal: 16,
            }}>
                <Icon size={18} color={focusedField === fieldKey ? '#2563EB' : '#94A3B8'} strokeWidth={2} />
                <TextInput
                    ref={fieldRef}
                    style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12, color: '#0F172A', fontSize: 15, fontWeight: '500' }}
                    placeholder={placeholder}
                    placeholderTextColor="#CBD5E1"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType || 'default'}
                    returnKeyType={returnKeyType || 'next'}
                    onSubmitEditing={onSubmitEditing}
                    autoCapitalize={autoCapitalize || 'none'}
                    onFocus={() => setFocusedField(fieldKey)}
                    onBlur={() => setFocusedField(null)}
                />
                {rightElement}
            </View>
        </View>
    );

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <ScrollView
                style={{ flex: 1, backgroundColor: '#1E3A8A' }}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <LinearGradient
                    colors={['#0F172A', '#1E3A8A', '#1D4ED8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Top nav */}
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

                {/* Form */}
                <View style={{
                    flex: 1,
                    backgroundColor: 'white',
                    borderTopLeftRadius: 32,
                    borderTopRightRadius: 32,
                    paddingHorizontal: 28,
                    paddingTop: 32,
                    paddingBottom: insets.bottom + 24,
                    marginTop: -1,
                }}>
                    <Text style={{ color: '#0F172A', fontSize: 22, fontWeight: '800', marginBottom: 4 }}>
                        Create your account
                    </Text>
                    <Text style={{ color: '#64748B', fontSize: 14, marginBottom: 28 }}>
                        Help us protect your community
                    </Text>

                    <InputField label="FULL NAME *" value={name} onChangeText={setName} placeholder="John Doe" icon={User} fieldKey="name" autoCapitalize="words" onSubmitEditing={() => emailRef.current?.focus()} />
                    <InputField label="EMAIL ADDRESS *" value={email} onChangeText={setEmail} placeholder="you@example.com" icon={Mail} keyboardType="email-address" fieldKey="email" ref={emailRef} onSubmitEditing={() => phoneRef.current?.focus()} />
                    <InputField label="PHONE NUMBER (OPTIONAL)" value={phone} onChangeText={setPhone} placeholder="+94 77 123 4567" icon={Phone} keyboardType="phone-pad" fieldKey="phone" ref={phoneRef} onSubmitEditing={() => passwordRef.current?.focus()} />
                    <InputField
                        label="PASSWORD *"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Min 8 characters"
                        icon={Lock}
                        secureTextEntry={!showPassword}
                        fieldKey="password"
                        ref={passwordRef}
                        returnKeyType="done"
                        onSubmitEditing={handleRegister}
                        rightElement={
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                            </TouchableOpacity>
                        }
                    />

                    <TouchableOpacity
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.85}
                        style={{ borderRadius: 16, overflow: 'hidden', marginTop: 8, marginBottom: 20 }}
                    >
                        <LinearGradient
                            colors={['#1E3A8A', '#2563EB', '#3B82F6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ paddingVertical: 17, alignItems: 'center', justifyContent: 'center' }}
                        >
                            {loading
                                ? <ActivityIndicator color="white" />
                                : <Text style={{ color: 'white', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }}>Create Account</Text>
                            }
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.7}
                        style={{ alignItems: 'center', paddingVertical: 8 }}
                    >
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
