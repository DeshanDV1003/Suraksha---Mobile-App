import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogIn, UserPlus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(t('common.error'), 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const res = await authService.login({ email, password });
            await AsyncStorage.setItem('token', res.data.token);
            await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
            navigation.replace('MainTabs');
        } catch (error: any) {
            Alert.alert(t('common.error'), error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white px-8 justify-center">
            <View className="items-center mb-12">
                <View className="bg-[#DBEAFE] p-6 rounded-[32px] mb-6">
                    <LogIn size={48} color="#2563EB" strokeWidth={2.5} />
                </View>
                <Text className="text-4xl font-black text-[#1E3A8A] mb-2 text-center uppercase tracking-tighter">
                    Suraksha
                </Text>
                <Text className="text-[#64748B] text-lg font-bold text-center">
                    Welcome back to safety
                </Text>
            </View>

            <View className="space-y-4">
                <View>
                    <Text className="text-[#1E3A8A] font-black text-sm uppercase mb-2 ml-2">Email</Text>
                    <TextInput 
                        className="bg-[#F8FAFC] border-2 border-[#F1F5F9] p-5 rounded-2xl text-[#1E3A8A] font-bold text-lg"
                        placeholder="email@example.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View className="mt-4">
                    <Text className="text-[#1E3A8A] font-black text-sm uppercase mb-2 ml-2">Password</Text>
                    <TextInput 
                        className="bg-[#F8FAFC] border-2 border-[#F1F5F9] p-5 rounded-2xl text-[#1E3A8A] font-bold text-lg"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity 
                    onPress={handleLogin}
                    disabled={loading}
                    className="mt-8 rounded-2xl overflow-hidden"
                >
                    <LinearGradient
                        colors={['#2563EB', '#1D4ED8']}
                        className="py-5 items-center"
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-xl font-black uppercase">Login</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => navigation.navigate('Register')}
                    className="mt-6 items-center"
                >
                    <Text className="text-[#64748B] font-bold text-lg">
                        Don't have an account? <Text className="text-[#2563EB] font-black">Register</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
