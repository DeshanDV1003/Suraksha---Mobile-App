import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPlus, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert(t('common.error'), 'Please fill in required fields');
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

            Alert.alert(
                'Registration Successful',
                successMsg,
                [{ text: 'Login', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error: any) {
            Alert.alert(t('common.error'), error.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="px-8 pt-20 pb-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-8">
                    <ArrowLeft size={32} color="#1E3A8A" />
                </TouchableOpacity>

                <View className="items-center mb-10">
                    <View className="bg-[#D1FAE5] p-6 rounded-[32px] mb-6">
                        <UserPlus size={48} color="#059669" strokeWidth={2.5} />
                    </View>
                    <Text className="text-4xl font-black text-[#1E3A8A] mb-2 text-center uppercase tracking-tighter">
                        Join Suraksha
                    </Text>
                    <Text className="text-[#64748B] text-lg font-bold text-center">
                        Help us protect the community
                    </Text>
                </View>

                <View className="space-y-4">
                    <View>
                        <Text className="text-[#1E3A8A] font-black text-sm uppercase mb-2 ml-2">Full Name</Text>
                        <TextInput 
                            className="bg-[#F8FAFC] border-2 border-[#F1F5F9] p-5 rounded-2xl text-[#1E3A8A] font-bold text-lg"
                            placeholder="John Doe"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View className="mt-4">
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
                        <Text className="text-[#1E3A8A] font-black text-sm uppercase mb-2 ml-2">Phone (Optional)</Text>
                        <TextInput 
                            className="bg-[#F8FAFC] border-2 border-[#F1F5F9] p-5 rounded-2xl text-[#1E3A8A] font-bold text-lg"
                            placeholder="+94 77 123 4567"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
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
                        onPress={handleRegister}
                        disabled={loading}
                        className="mt-10 rounded-2xl overflow-hidden"
                    >
                        <LinearGradient
                            colors={['#059669', '#047857']}
                            className="py-5 items-center"
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-xl font-black uppercase">Create Account</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Login')}
                        className="mt-6 items-center"
                    >
                        <Text className="text-[#64748B] font-bold text-lg">
                            Already have an account? <Text className="text-[#059669] font-black">Login</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
