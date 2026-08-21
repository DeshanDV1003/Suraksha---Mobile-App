import React, { useState, useCallback } from 'react';
import {
    ScrollView, View, Text, TouchableOpacity, Alert, Platform,
    StatusBar, ActivityIndicator, Modal, TextInput, Switch,
    Linking, KeyboardAvoidingView, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { incidentService, userService, volunteerService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import {
    Globe, Bell, MapPin, Shield, FileText, Phone,
    LogOut, ChevronRight, ClipboardList, CheckSquare,
    User, Trash2, Plus, X, Edit3, Check,
    BellOff, Info, Camera,
} from 'lucide-react-native';
import { useToast } from '../context/ToastContext';

const profilePicKey = (userId: string) => `profile_picture_${userId}`;

const NOTIF_PREFS_KEY = 'notif_prefs';
const EMERGENCY_CONTACTS_KEY = 'emergency_contacts';

interface NotifPrefs {
    enabled: boolean;
    emergency: boolean;
    warning: boolean;
    info: boolean;
    updates: boolean;
}

interface EmergencyContact {
    id: string;
    name: string;
    phone: string;
    relation: string;
}

const DEFAULT_NOTIF: NotifPrefs = {
    enabled: true, emergency: true, warning: true, info: true, updates: false,
};

// ── Reusable modal shell ────────────────────────────────────────────────
function ModalShell({ visible, onClose, title, children }: {
    visible: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '90%' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                            <Text style={{ flex: 1, fontSize: 18, fontWeight: '900', color: '#0F172A' }}>{title}</Text>
                            <TouchableOpacity onPress={onClose} style={{ padding: 6, backgroundColor: '#F1F5F9', borderRadius: 20 }}>
                                <X size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        {children}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ── Setting row ─────────────────────────────────────────────────────────
function SettingRow({ icon: Icon, label, value, onPress, color, isLast }: {
    icon: any; label: string; value?: string; onPress: () => void; color: string; isLast?: boolean;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{
                flexDirection: 'row', alignItems: 'center', padding: 16,
                borderBottomWidth: isLast ? 0 : 1, borderBottomColor: '#F8FAFC',
            }}
        >
            <View style={{ width: 38, height: 38, backgroundColor: color + '18', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                <Icon size={18} color={color} strokeWidth={2} />
            </View>
            <Text style={{ flex: 1, color: '#0F172A', fontSize: 14, fontWeight: '600' }}>{label}</Text>
            {value && <Text style={{ color: '#94A3B8', fontSize: 13, marginRight: 8 }}>{value}</Text>}
            <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
        </TouchableOpacity>
    );
}

// ── Main screen ─────────────────────────────────────────────────────────
export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const toast = useToast();

    const [user, setUser] = useState<any>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [stats, setStats] = useState({ reports: 0, tasks: 0 });
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [picUploading, setPicUploading] = useState(false);

    // Modal visibility
    const [editOpen, setEditOpen]       = useState(false);
    const [notifOpen, setNotifOpen]     = useState(false);
    const [locationOpen, setLocationOpen] = useState(false);
    const [contactsOpen, setContactsOpen] = useState(false);
    const [privacyOpen, setPrivacyOpen] = useState(false);
    const [termsOpen, setTermsOpen]     = useState(false);

    // Edit profile
    const [editName, setEditName]   = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editSaving, setEditSaving] = useState(false);

    // Notifications
    const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(DEFAULT_NOTIF);

    // Location
    const [locationStatus, setLocationStatus] = useState<string>('unknown');

    // Emergency contacts
    const [contacts, setContacts]           = useState<EmergencyContact[]>([]);
    const [newContactName, setNewContactName]     = useState('');
    const [newContactPhone, setNewContactPhone]   = useState('');
    const [newContactRelation, setNewContactRelation] = useState('');
    const [addingContact, setAddingContact] = useState(false);

    // Privacy / change password
    const [pwCurrent, setPwCurrent] = useState('');
    const [pwNew, setPwNew]         = useState('');
    const [pwConfirm, setPwConfirm] = useState('');
    const [pwSaving, setPwSaving]   = useState(false);

    const loadData = useCallback(async () => {
        const stored = await AsyncStorage.getItem('user');
        const parsedUser = stored ? JSON.parse(stored) : null;
        if (parsedUser) setUser(parsedUser);
        setProfileLoading(false);

        // Load saved profile picture — keyed per user to avoid cross-account bleed
        if (parsedUser?.id) {
            const pic = await AsyncStorage.getItem(profilePicKey(parsedUser.id));
            if (pic) setProfilePicture(pic);
            else setProfilePicture(null);
        }

        // Load local prefs
        const np = await AsyncStorage.getItem(NOTIF_PREFS_KEY);
        if (np) setNotifPrefs(JSON.parse(np));

        const ec = await AsyncStorage.getItem(EMERGENCY_CONTACTS_KEY);
        if (ec) setContacts(JSON.parse(ec));

        // Refresh from network
        try {
            const [reportsRes, userRes, tasksRes] = await Promise.all([
                incidentService.getMyReports().catch(() => ({ data: [] })),
                userService.getMe().catch(() => null),
                volunteerService.getMyTasks().catch(() => ({ data: [] })),
            ]);

            if (userRes?.data) {
                setUser(userRes.data);
                await AsyncStorage.setItem('user', JSON.stringify(userRes.data));
            }

            const completedTasks = (tasksRes?.data || []).filter(
                (t: any) => t.status === 'COMPLETED' || t.status === 'RESOLVED'
            ).length;
            setStats({ reports: reportsRes?.data?.length || 0, tasks: completedTasks });
        } catch {}
    }, []);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    // ── Handlers ─────────────────────────────────────────────────────────

    const handleLogout = () => {
        const doLogout = async () => {
            await AsyncStorage.multiRemove(['token', 'user', 'session_start']);
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        };
        if (Platform.OS === 'web') { if (window.confirm('Sign out?')) doLogout(); return; }
        Alert.alert(
            t('profile.sign_out_title'),
            t('profile.sign_out_message'),
            [{ text: t('common.cancel'), style: 'cancel' }, { text: t('profile.sign_out_btn'), style: 'destructive', onPress: doLogout }]
        );
    };

    // Profile picture
    const pickProfilePicture = () => {
        const options = [
            { text: 'Take Photo', onPress: () => launchPicker('camera') },
            { text: 'Choose from Library', onPress: () => launchPicker('library') },
            ...(profilePicture ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: removePhoto }] : []),
            { text: 'Cancel', style: 'cancel' as const },
        ];
        Alert.alert('Profile Photo', 'Update your profile picture', options);
    };

    const launchPicker = async (source: 'camera' | 'library') => {
        // Request permission
        if (source === 'camera') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                toast.error('Permission Denied', 'Camera access is required to take a photo.');
                return;
            }
        } else {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                toast.error('Permission Denied', 'Photo library access is required.');
                return;
            }
        }

        const result = source === 'camera'
            ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
            : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });

        if (result.canceled || !result.assets?.[0]) return;

        setPicUploading(true);
        try {
            // Resize to 200×200 and compress to keep base64 small
            const manipulated = await manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 200, height: 200 } }],
                { compress: 0.7, format: SaveFormat.JPEG, base64: true }
            );

            if (!manipulated.base64) throw new Error('Image processing returned no data');
            const dataUri = `data:image/jpeg;base64,${manipulated.base64}`;
            setProfilePicture(dataUri);
            const uid = (await AsyncStorage.getItem('user').then(s => s ? JSON.parse(s).id : null));
            if (uid) await AsyncStorage.setItem(profilePicKey(uid), dataUri);
            toast.success('Updated', 'Profile photo saved.');
        } catch {
            toast.error('Error', 'Could not process image. Please try again.');
        } finally {
            setPicUploading(false);
        }
    };

    const removePhoto = async () => {
        setProfilePicture(null);
        const uid = (await AsyncStorage.getItem('user').then(s => s ? JSON.parse(s).id : null));
        if (uid) await AsyncStorage.removeItem(profilePicKey(uid));
        toast.success('Removed', 'Profile photo removed.');
    };

    // Edit profile
    const openEdit = () => {
        setEditName(user?.name || '');
        setEditPhone(user?.phone || '');
        setEditOpen(true);
    };

    const saveProfile = async () => {
        if (!editName.trim()) { toast.error('Error', 'Name cannot be empty.'); return; }
        setEditSaving(true);
        try {
            const res = await userService.updateProfile({ name: editName.trim(), phone: editPhone.trim() || undefined });
            const updated = { ...user, ...res.data };
            setUser(updated);
            await AsyncStorage.setItem('user', JSON.stringify(updated));
            toast.success('Saved', 'Profile updated successfully.');
            setEditOpen(false);
        } catch {
            toast.error('Error', 'Failed to update profile. Please try again.');
        } finally {
            setEditSaving(false);
        }
    };

    // Notifications
    const saveNotifPrefs = async (prefs: NotifPrefs) => {
        setNotifPrefs(prefs);
        await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
    };

    // Location
    const openLocation = async () => {
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationStatus(status);
        setLocationOpen(true);
    };

    const openLocationSettings = () => {
        if (Platform.OS === 'ios') Linking.openURL('app-settings:');
        else Linking.openSettings();
    };

    // Emergency contacts
    const addContact = async () => {
        if (!newContactName.trim() || !newContactPhone.trim()) {
            toast.error('Error', 'Name and phone are required.');
            return;
        }
        const contact: EmergencyContact = {
            id: `c_${Date.now()}`,
            name: newContactName.trim(),
            phone: newContactPhone.trim(),
            relation: newContactRelation.trim() || 'Contact',
        };
        const next = [...contacts, contact];
        setContacts(next);
        await AsyncStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(next));
        setNewContactName('');
        setNewContactPhone('');
        setNewContactRelation('');
        setAddingContact(false);
        toast.success('Added', `${contact.name} added to emergency contacts.`);
    };

    const deleteContact = async (id: string) => {
        const next = contacts.filter(c => c.id !== id);
        setContacts(next);
        await AsyncStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(next));
    };

    // Change password
    const changePassword = async () => {
        if (!pwCurrent || !pwNew || !pwConfirm) { toast.error('Error', 'All fields are required.'); return; }
        if (pwNew.length < 8) { toast.error('Error', 'New password must be at least 8 characters.'); return; }
        if (pwNew !== pwConfirm) { toast.error('Error', 'Passwords do not match.'); return; }
        setPwSaving(true);
        try {
            await userService.updateProfile({ currentPassword: pwCurrent, newPassword: pwNew });
            toast.success('Password Changed', 'Your password has been updated.');
            setPwCurrent(''); setPwNew(''); setPwConfirm('');
            setPrivacyOpen(false);
        } catch (err: any) {
            const msg = err?.response?.data?.error || 'Failed to change password. Check your current password.';
            toast.error('Error', msg);
        } finally {
            setPwSaving(false);
        }
    };

    const requestDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your account and all associated data. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete My Account',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await userService.deleteUser(user.id);
                            await AsyncStorage.multiRemove(['token', 'user']);
                            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                        } catch {
                            toast.error('Error', 'Could not delete account. Contact support.');
                        }
                    },
                },
            ]
        );
    };

    if (profileLoading) return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF', alignItems: 'center', justifyContent: 'center' }}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={{ color: '#64748B', fontSize: 14, fontWeight: '600', marginTop: 12 }}>{t('profile.loading')}</Text>
        </View>
    );

    if (!user) return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>{t('profile.could_not_load')}</Text>
            <Text style={{ color: '#64748B', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>{t('profile.check_connection')}</Text>
            <TouchableOpacity
                onPress={async () => { await AsyncStorage.multiRemove(['token', 'user']); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); }}
                style={{ backgroundColor: '#EF4444', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32 }}
            >
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>{t('profile.sign_out_btn')}</Text>
            </TouchableOpacity>
        </View>
    );

    const initials = (user.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    const langLabel = i18n.language === 'si' ? 'සිංහල' : i18n.language === 'ta' ? 'தமிழ்' : 'English';
    const locationStatusLabel = locationStatus === 'granted' ? 'Allowed' : locationStatus === 'denied' ? 'Denied' : 'Not set';

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            {/* Hero */}
            <LinearGradient
                colors={['#0F172A', '#1E3A8A', '#2563EB']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ paddingTop: insets.top + 16, paddingBottom: 48, paddingHorizontal: 20, alignItems: 'center' }}
            >
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 20 }}>
                    {t('profile.title') || 'Profile'}
                </Text>

                <TouchableOpacity
                    onPress={pickProfilePicture}
                    activeOpacity={0.8}
                    style={{ alignItems: 'center' }}
                    disabled={picUploading}
                >
                    <View style={{
                        width: 88, height: 88, borderRadius: 28,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        alignItems: 'center', justifyContent: 'center',
                        marginBottom: 14, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)',
                        overflow: 'hidden',
                    }}>
                        {picUploading ? (
                            <ActivityIndicator color="white" size="large" />
                        ) : profilePicture ? (
                            <Image
                                source={{ uri: profilePicture }}
                                style={{ width: 88, height: 88, borderRadius: 26 }}
                            />
                        ) : (
                            <Text style={{ color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: -1 }}>{initials}</Text>
                        )}
                    </View>
                    {/* Camera badge */}
                    <View style={{
                        position: 'absolute', bottom: 10, right: -2,
                        width: 28, height: 28, backgroundColor: '#2563EB',
                        borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                        borderWidth: 2.5, borderColor: '#0F172A',
                    }}>
                        <Camera size={14} color="white" strokeWidth={2} />
                    </View>
                </TouchableOpacity>

                <Text style={{ color: 'white', fontSize: 20, fontWeight: '800', letterSpacing: -0.3, marginBottom: 4 }}>
                    {user.name || 'User'}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 10 }}>
                    {user.email || ''}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '700' }}>
                            {user.role || 'CITIZEN'}
                        </Text>
                    </View>
                    {user.region && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                            <MapPin size={12} color="rgba(255,255,255,0.6)" strokeWidth={2} />
                            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginLeft: 3 }}>{user.region}</Text>
                        </View>
                    )}
                </View>
            </LinearGradient>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
                {/* Stats card */}
                <View style={{ marginHorizontal: 16, marginTop: -28, marginBottom: 20 }}>
                    <View style={{ backgroundColor: 'white', borderRadius: 22, padding: 20, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 }}>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <View style={{ width: 44, height: 44, backgroundColor: '#EFF6FF', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                <ClipboardList size={22} color="#2563EB" strokeWidth={2} />
                            </View>
                            <Text style={{ color: '#0F172A', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }}>{stats.reports}</Text>
                            <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '600', marginTop: 2 }}>{t('profile.reports_submitted') || 'Reports'}</Text>
                        </View>
                        <View style={{ width: 1, backgroundColor: '#F1F5F9', marginVertical: 8 }} />
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <View style={{ width: 44, height: 44, backgroundColor: '#F0FDF4', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                <CheckSquare size={22} color="#10B981" strokeWidth={2} />
                            </View>
                            <Text style={{ color: '#0F172A', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }}>{stats.tasks}</Text>
                            <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '600', marginTop: 2 }}>{t('profile.tasks_completed') || 'Tasks Done'}</Text>
                        </View>
                    </View>
                </View>

                {/* Preferences */}
                <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                    <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>
                        {t('profile.preferences')}
                    </Text>
                    <View style={{ backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
                        <SettingRow icon={User}   label="Edit Profile"                   onPress={openEdit}     color="#2563EB" />
                        <SettingRow icon={Globe}  label={t('profile.language')}           value={langLabel}     onPress={() => navigation.navigate('Language')} color="#7C3AED" />
                        <SettingRow icon={Bell}   label={t('profile.notifications')}      value={notifPrefs.enabled ? 'On' : 'Off'} onPress={() => setNotifOpen(true)} color="#F59E0B" />
                        <SettingRow icon={MapPin} label={t('profile.location_services')}  value={locationStatusLabel} onPress={openLocation} color="#0D9488" isLast />
                    </View>
                </View>

                {/* Account */}
                <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                    <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>
                        {t('profile.account')}
                    </Text>
                    <View style={{ backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
                        <SettingRow icon={Phone}    label={t('profile.emergency_contacts')} value={contacts.length > 0 ? `${contacts.length}` : undefined} onPress={() => setContactsOpen(true)} color="#EF4444" />
                        <SettingRow icon={Shield}   label={t('profile.privacy')}            onPress={() => setPrivacyOpen(true)}  color="#64748B" />
                        <SettingRow icon={FileText} label={t('profile.terms')}              onPress={() => setTermsOpen(true)}    color="#94A3B8" isLast />
                    </View>
                </View>

                {/* Sign out */}
                <View style={{ marginHorizontal: 16, marginTop: 4 }}>
                    <TouchableOpacity
                        onPress={handleLogout}
                        activeOpacity={0.8}
                        style={{ backgroundColor: '#FFF5F5', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FECACA' }}
                    >
                        <LogOut size={18} color="#EF4444" strokeWidth={2.5} />
                        <Text style={{ color: '#EF4444', fontSize: 15, fontWeight: '700', marginLeft: 10 }}>{t('profile.logout') || 'Sign Out'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* ── Edit Profile Modal ── */}
            <ModalShell visible={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    <Text style={label}>Full Name</Text>
                    <TextInput
                        value={editName}
                        onChangeText={setEditName}
                        placeholder="Your name"
                        placeholderTextColor="#94A3B8"
                        style={input}
                    />
                    <Text style={label}>Phone Number</Text>
                    <TextInput
                        value={editPhone}
                        onChangeText={setEditPhone}
                        placeholder="+94 77 000 0000"
                        placeholderTextColor="#94A3B8"
                        keyboardType="phone-pad"
                        style={input}
                    />
                    <Text style={[label, { marginTop: 4, color: '#94A3B8' }]}>Email (cannot be changed)</Text>
                    <View style={[input, { backgroundColor: '#F8FAFC' }]}>
                        <Text style={{ color: '#94A3B8', fontSize: 15 }}>{user.email || '—'}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={saveProfile}
                        disabled={editSaving}
                        style={{ backgroundColor: '#2563EB', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 }}
                    >
                        {editSaving
                            ? <ActivityIndicator color="white" />
                            : <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>Save Changes</Text>
                        }
                    </TouchableOpacity>
                </ScrollView>
            </ModalShell>

            {/* ── Notifications Modal ── */}
            <ModalShell visible={notifOpen} onClose={() => setNotifOpen(false)} title="Notification Preferences">
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    {/* Master toggle */}
                    <View style={switchRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={switchLabel}>All Notifications</Text>
                            <Text style={switchSub}>Master switch — turns all off</Text>
                        </View>
                        <Switch
                            value={notifPrefs.enabled}
                            onValueChange={v => saveNotifPrefs({ ...notifPrefs, enabled: v })}
                            trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                            thumbColor="white"
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 }} />

                    {([
                        { key: 'emergency', label: 'Emergency Alerts', sub: 'Critical disaster warnings', color: '#DC2626' },
                        { key: 'warning',   label: 'Warning Alerts',   sub: 'Elevated risk situations', color: '#F59E0B' },
                        { key: 'info',      label: 'Info Alerts',      sub: 'General updates and news', color: '#2563EB' },
                        { key: 'updates',   label: 'App Updates',      sub: 'Feature announcements',    color: '#64748B' },
                    ] as const).map(item => (
                        <View key={item.key} style={[switchRow, { opacity: notifPrefs.enabled ? 1 : 0.4 }]}>
                            <View style={{ width: 36, height: 36, backgroundColor: item.color + '18', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                {notifPrefs.enabled && notifPrefs[item.key]
                                    ? <Bell size={16} color={item.color} strokeWidth={2} />
                                    : <BellOff size={16} color={item.color} strokeWidth={2} />
                                }
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={switchLabel}>{item.label}</Text>
                                <Text style={switchSub}>{item.sub}</Text>
                            </View>
                            <Switch
                                value={notifPrefs[item.key]}
                                disabled={!notifPrefs.enabled}
                                onValueChange={v => saveNotifPrefs({ ...notifPrefs, [item.key]: v })}
                                trackColor={{ false: '#E2E8F0', true: item.color }}
                                thumbColor="white"
                            />
                        </View>
                    ))}

                    <View style={{ backgroundColor: '#F0F9FF', borderRadius: 14, padding: 14, marginTop: 16, flexDirection: 'row' }}>
                        <Info size={15} color="#0284C7" strokeWidth={2} style={{ marginRight: 8, marginTop: 1 }} />
                        <Text style={{ color: '#0369A1', fontSize: 12, flex: 1, lineHeight: 18 }}>
                            These preferences are stored on your device. Emergency alerts from authorities may still come through your system notifications.
                        </Text>
                    </View>
                </ScrollView>
            </ModalShell>

            {/* ── Location Services Modal ── */}
            <ModalShell visible={locationOpen} onClose={() => setLocationOpen(false)} title="Location Services">
                <View style={{ padding: 24 }}>
                    <View style={{
                        backgroundColor: locationStatus === 'granted' ? '#F0FDF4' : '#FEF2F2',
                        borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 20,
                        borderWidth: 1.5, borderColor: locationStatus === 'granted' ? '#BBF7D0' : '#FECACA',
                    }}>
                        <MapPin size={36} color={locationStatus === 'granted' ? '#10B981' : '#EF4444'} strokeWidth={1.5} />
                        <Text style={{ fontSize: 16, fontWeight: '900', color: '#0F172A', marginTop: 12, marginBottom: 4 }}>
                            Location Access: {locationStatusLabel}
                        </Text>
                        <Text style={{ color: '#64748B', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                            {locationStatus === 'granted'
                                ? 'Suraksha can use your GPS location to show nearby alerts, safe zones, and provide accurate emergency routing.'
                                : 'Location access is required to show nearby alerts and safe zones. Please enable it in your device settings.'}
                        </Text>
                    </View>

                    {locationStatus !== 'granted' && (
                        <TouchableOpacity
                            onPress={openLocationSettings}
                            style={{ backgroundColor: '#2563EB', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12 }}
                        >
                            <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>Open Device Settings</Text>
                        </TouchableOpacity>
                    )}

                    <View style={{ backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14 }}>
                        <Text style={{ color: '#475569', fontSize: 13, fontWeight: '700', marginBottom: 6 }}>Why we use your location</Text>
                        {[
                            'Show emergency alerts near you',
                            'Find closest safe zones and relief camps',
                            'Calculate safe evacuation routes',
                            'Attach coordinates to your incident reports',
                        ].map(reason => (
                            <View key={reason} style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 }}>
                                <Check size={13} color="#10B981" strokeWidth={2.5} style={{ marginTop: 2, marginRight: 8 }} />
                                <Text style={{ color: '#64748B', fontSize: 13, flex: 1 }}>{reason}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ModalShell>

            {/* ── Emergency Contacts Modal ── */}
            <ModalShell visible={contactsOpen} onClose={() => setContactsOpen(false)} title="Emergency Contacts">
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    {contacts.length === 0 && !addingContact && (
                        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                            <Phone size={40} color="#CBD5E1" strokeWidth={1.5} />
                            <Text style={{ color: '#94A3B8', fontSize: 14, marginTop: 12, textAlign: 'center' }}>
                                No emergency contacts saved.{'\n'}Add people to call quickly in a crisis.
                            </Text>
                        </View>
                    )}

                    {contacts.map(c => (
                        <View key={c.id} style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 42, height: 42, backgroundColor: '#FEE2E2', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                <Phone size={18} color="#EF4444" strokeWidth={2} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: '800' }}>{c.name}</Text>
                                <Text style={{ color: '#64748B', fontSize: 12, marginTop: 1 }}>{c.relation} · {c.phone}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => Linking.openURL(`tel:${c.phone}`)}
                                style={{ backgroundColor: '#10B981', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, marginRight: 8 }}
                            >
                                <Text style={{ color: 'white', fontSize: 12, fontWeight: '800' }}>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => deleteContact(c.id)} style={{ padding: 6 }}>
                                <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                            </TouchableOpacity>
                        </View>
                    ))}

                    {addingContact ? (
                        <View style={{ backgroundColor: '#F0F9FF', borderRadius: 16, padding: 16, marginTop: 4, borderWidth: 1.5, borderColor: '#BAE6FD' }}>
                            <Text style={[label, { marginTop: 0 }]}>Name *</Text>
                            <TextInput value={newContactName} onChangeText={setNewContactName} placeholder="Contact name" placeholderTextColor="#94A3B8" style={input} />
                            <Text style={label}>Phone *</Text>
                            <TextInput value={newContactPhone} onChangeText={setNewContactPhone} placeholder="+94 77 000 0000" placeholderTextColor="#94A3B8" keyboardType="phone-pad" style={input} />
                            <Text style={label}>Relationship</Text>
                            <TextInput value={newContactRelation} onChangeText={setNewContactRelation} placeholder="e.g. Mother, Friend, Doctor" placeholderTextColor="#94A3B8" style={input} />
                            <View style={{ flexDirection: 'row', marginTop: 8 }}>
                                <TouchableOpacity onPress={() => setAddingContact(false)} style={{ flex: 1, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginRight: 8 }}>
                                    <Text style={{ color: '#64748B', fontWeight: '700' }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={addContact} style={{ flex: 1, backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}>
                                    <Text style={{ color: 'white', fontWeight: '900' }}>Add Contact</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => setAddingContact(true)}
                            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#2563EB', borderStyle: 'dashed', borderRadius: 16, paddingVertical: 14, marginTop: 8 }}
                        >
                            <Plus size={16} color="#2563EB" strokeWidth={2.5} />
                            <Text style={{ color: '#2563EB', fontWeight: '800', marginLeft: 8 }}>Add Contact</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </ModalShell>

            {/* ── Privacy & Security Modal ── */}
            <ModalShell visible={privacyOpen} onClose={() => setPrivacyOpen(false)} title="Privacy & Security">
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: '800', marginBottom: 16 }}>Change Password</Text>
                    <Text style={label}>Current Password</Text>
                    <TextInput value={pwCurrent} onChangeText={setPwCurrent} secureTextEntry placeholder="••••••••" placeholderTextColor="#94A3B8" style={input} />
                    <Text style={label}>New Password</Text>
                    <TextInput value={pwNew} onChangeText={setPwNew} secureTextEntry placeholder="Min. 8 characters" placeholderTextColor="#94A3B8" style={input} />
                    <Text style={label}>Confirm New Password</Text>
                    <TextInput value={pwConfirm} onChangeText={setPwConfirm} secureTextEntry placeholder="Repeat new password" placeholderTextColor="#94A3B8" style={input} />
                    <TouchableOpacity
                        onPress={changePassword}
                        disabled={pwSaving}
                        style={{ backgroundColor: '#2563EB', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 28 }}
                    >
                        {pwSaving
                            ? <ActivityIndicator color="white" />
                            : <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>Update Password</Text>
                        }
                    </TouchableOpacity>

                    <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 }} />

                    <Text style={{ color: '#0F172A', fontSize: 15, fontWeight: '800', marginBottom: 8 }}>Data & Account</Text>
                    <Text style={{ color: '#64748B', fontSize: 13, lineHeight: 20, marginBottom: 16 }}>
                        Your data is stored securely and used only to provide Suraksha disaster management services. We do not sell or share your data with third parties.
                    </Text>
                    <TouchableOpacity
                        onPress={requestDeleteAccount}
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FECACA', borderRadius: 16, paddingVertical: 14, backgroundColor: '#FFF5F5' }}
                    >
                        <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                        <Text style={{ color: '#EF4444', fontWeight: '700', marginLeft: 8 }}>Delete My Account</Text>
                    </TouchableOpacity>
                </ScrollView>
            </ModalShell>

            {/* ── Terms Modal ── */}
            <ModalShell visible={termsOpen} onClose={() => setTermsOpen(false)} title="Terms & Conditions">
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    {[
                        ['1. Acceptance of Terms', 'By using Suraksha, you agree to these terms. If you do not agree, please discontinue use of the application immediately.'],
                        ['2. Purpose', 'Suraksha is a disaster management and emergency response application intended to help citizens, volunteers, and authorities coordinate during emergencies in Sri Lanka.'],
                        ['3. Data Collection', 'We collect your name, contact details, location, and activity within the app solely to provide emergency services and improve disaster response. Your data is never sold to third parties.'],
                        ['4. Location Data', 'Location access is required for core features including alert proximity, safe zone discovery, and incident reporting. Location is only used while the app is in use unless background tracking is explicitly enabled.'],
                        ['5. User Responsibilities', 'You agree to provide accurate information when reporting incidents. False or misleading reports that divert emergency resources are prohibited and may be reported to authorities.'],
                        ['6. Emergency Services', 'Suraksha supplements but does not replace official emergency services. Always call 119 (Police), 110 (Fire), or 1990 (Ambulance) for life-threatening emergencies.'],
                        ['7. Volunteer Conduct', 'Volunteers agree to follow officer instructions, act within their assigned roles, and not misrepresent their capabilities during disaster response operations.'],
                        ['8. Limitation of Liability', 'Suraksha is provided as-is. We are not liable for decisions made based on information in the application during emergency situations.'],
                        ['9. Changes to Terms', 'We reserve the right to update these terms. Continued use of the application constitutes acceptance of any revised terms.'],
                        ['10. Contact', 'For questions about these terms, contact support through the application or your nearest Disaster Management Centre (DMC) office.'],
                    ].map(([heading, body]) => (
                        <View key={heading} style={{ marginBottom: 18 }}>
                            <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '800', marginBottom: 4 }}>{heading}</Text>
                            <Text style={{ color: '#64748B', fontSize: 13, lineHeight: 20 }}>{body}</Text>
                        </View>
                    ))}
                    <View style={{ backgroundColor: '#F0F9FF', borderRadius: 14, padding: 14, marginTop: 4 }}>
                        <Text style={{ color: '#0369A1', fontSize: 12, lineHeight: 18 }}>
                            Last updated: July 2026. These terms apply to all versions of Suraksha mobile application.
                        </Text>
                    </View>
                    <View style={{ height: 20 }} />
                </ScrollView>
            </ModalShell>
        </View>
    );
}

// ── Shared styles ────────────────────────────────────────────────────────
const label: any = {
    color: '#64748B', fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 6, marginTop: 14,
};

const input: any = {
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: '#0F172A',
};

const switchRow: any = {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
};

const switchLabel: any = {
    color: '#0F172A', fontSize: 14, fontWeight: '700',
};

const switchSub: any = {
    color: '#94A3B8', fontSize: 12, marginTop: 1,
};
