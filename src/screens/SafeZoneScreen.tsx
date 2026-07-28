import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Phone, Navigation, ShieldCheck, AlertTriangle, Building2, Heart, Church, School, Route } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { API_BASE_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

interface SafePlace {
  id: string;
  name: string;
  type: string;
  district: string;
  address: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
  capacity: number | null;
  distanceKm: number;
  isInDangerZone: boolean;
  mapsUrl: string;
  deepLink: string;
}

interface AuthorityContact {
  id: string;
  role: string;
  name: string;
  phone: string;
  phone2?: string;
  email?: string;
}

type SafeZoneParams = {
  SafeZone: {
    lat?: number;
    lng?: number;
    name?: string;
    type?: string;
    dangerRadiusKm?: number;
    district?: string;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function typeIcon(type: string, color: string, size = 18) {
  switch (type) {
    case 'HOSPITAL':       return <Heart color={color} size={size} />;
    case 'SCHOOL':         return <School color={color} size={size} />;
    case 'TEMPLE':         return <Church color={color} size={size} />;
    case 'POLICE_STATION': return <ShieldCheck color={color} size={size} />;
    default:               return <Building2 color={color} size={size} />;
  }
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    HOSPITAL: 'Hospital',
    SCHOOL: 'School',
    TEMPLE: 'Temple / Religious',
    POLICE_STATION: 'Police Station',
    FIRE_BRIGADE: 'Fire Brigade',
    COMMUNITY_HALL: 'Community Hall',
    SPORTS_GROUND: 'Sports Ground',
  };
  return map[type] || type;
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    DMC_OFFICER: 'DMC Officer',
    POLICE: 'Police',
    GRAMA_NILADHARI: 'Grama Niladhari',
    CIVIL_DEFENSE: 'Civil Defense',
    FIRE_BRIGADE: 'Fire Brigade',
    NATIONAL_EMERGENCY: 'National Emergency',
    DISASTER_HOTLINE: 'Disaster Hotline',
  };
  return map[role] || role;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SafeZoneScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<SafeZoneParams, 'SafeZone'>>();

  const paramLat   = route.params?.lat;
  const paramLng   = route.params?.lng;
  const paramName  = route.params?.name;
  const dangerKm   = route.params?.dangerRadiusKm ?? 5;
  const district   = route.params?.district;

  const [userLat, setUserLat] = useState<number | null>(paramLat ?? null);
  const [userLng, setUserLng] = useState<number | null>(paramLng ?? null);
  const [places,       setPlaces]       = useState<SafePlace[]>([]);
  const [authorities,  setAuthorities]  = useState<AuthorityContact[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SafePlace | null>(null);
  const [tab, setTab] = useState<'map' | 'list' | 'contacts'>('map');

  // ── Location ────────────────────────────────────────────────────
  useEffect(() => {
    if (paramLat && paramLng) return;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setUserLat(loc.coords.latitude);
      setUserLng(loc.coords.longitude);
    })();
  }, []);

  // ── Fetch safe zones ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (userLat === null || userLng === null) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const searchRadius = Math.min(dangerKm * 1.5, 5); // cap at 5 km
      const [zonesRes, authRes] = await Promise.all([
        fetch(
          `${API_BASE_URL}/api/safe-zones?lat=${userLat}&lng=${userLng}&dangerRadius=${dangerKm}&searchRadius=${searchRadius}&maxResults=10`,
          { headers }
        ),
        district
          ? fetch(`${API_BASE_URL}/api/safe-zones/authorities/${encodeURIComponent(district)}`, { headers })
          : Promise.resolve(null),
      ]);

      if (zonesRes.ok) {
        const json = await zonesRes.json();
        setPlaces(json.data || []);
      }
      if (authRes?.ok) {
        const json = await authRes.json();
        setAuthorities(json.data || []);
      }
    } catch (e) {
      console.error('[SafeZoneScreen]', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userLat, userLng, dangerKm, district]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // ── Open Google Maps ────────────────────────────────────────────
  const openMaps = (place: SafePlace) => Linking.openURL(place.mapsUrl);
  const callPhone = (phone: string) => Linking.openURL(`tel:${phone}`);

  // ── Render ──────────────────────────────────────────────────────

  const safeCount = places.filter(p => !p.isInDangerZone).length;
  const dangerCount = places.filter(p => p.isInDangerZone).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#fff" size={22} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Safe Zones</Text>
          {paramName ? (
            <Text style={styles.headerSub} numberOfLines={1}>{paramName}</Text>
          ) : null}
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{safeCount} safe</Text>
        </View>
        <TouchableOpacity
          style={styles.routeBtn}
          onPress={() => navigation.navigate('SafeRoute')}
        >
          <Route color="#fff" size={14} />
          <Text style={styles.routeBtnText}>Route</Text>
        </TouchableOpacity>
      </View>

      {/* Alert banner */}
      {dangerCount > 0 && (
        <View style={styles.alertBanner}>
          <AlertTriangle color="#92400E" size={16} />
          <Text style={styles.alertText}>
            {dangerCount} place{dangerCount > 1 ? 's' : ''} in danger zone — scroll down for alternatives
          </Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['map', 'list', 'contacts'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {t === 'contacts' ? 'Authorities' : t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Finding safe zones near you…</Text>
        </View>
      ) : (
        <>
          {/* MAP TAB */}
          {tab === 'map' && userLat !== null && userLng !== null && (
            <View style={{ flex: 1 }}>
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: userLat,
                  longitude: userLng,
                  latitudeDelta: (dangerKm * 3) / 55,
                  longitudeDelta: (dangerKm * 3) / 55,
                }}
              >
                {/* User position */}
                <Marker coordinate={{ latitude: userLat, longitude: userLng }} title="Your Location" pinColor="#EF4444" />

                {/* Danger zone circle */}
                <Circle
                  center={{ latitude: userLat, longitude: userLng }}
                  radius={dangerKm * 1000}
                  strokeColor="rgba(239,68,68,0.8)"
                  fillColor="rgba(239,68,68,0.12)"
                  strokeWidth={2}
                />

                {/* Safe place markers */}
                {places.map(p => (
                  <Marker
                    key={p.id}
                    coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                    title={p.name}
                    description={`${typeLabel(p.type)} · ${p.distanceKm} km`}
                    pinColor={p.isInDangerZone ? '#F59E0B' : '#16A34A'}
                    onPress={() => setSelectedPlace(p)}
                  />
                ))}
              </MapView>

              {/* Selected place card */}
              {selectedPlace && (
                <View style={styles.selectedCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {typeIcon(selectedPlace.type, selectedPlace.isInDangerZone ? '#F59E0B' : '#16A34A', 20)}
                    <Text style={styles.selectedName}>{selectedPlace.name}</Text>
                  </View>
                  <Text style={styles.selectedMeta}>
                    {typeLabel(selectedPlace.type)} · {selectedPlace.distanceKm} km away
                    {selectedPlace.isInDangerZone ? '  ⚠️ In danger zone' : '  ✅ Safe'}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <TouchableOpacity style={styles.mapBtn} onPress={() => openMaps(selectedPlace)}>
                      <Navigation color="#fff" size={14} />
                      <Text style={styles.mapBtnText}>Directions</Text>
                    </TouchableOpacity>
                    {selectedPlace.phone && (
                      <TouchableOpacity style={[styles.mapBtn, { backgroundColor: '#16A34A' }]} onPress={() => callPhone(selectedPlace.phone!)}>
                        <Phone color="#fff" size={14} />
                        <Text style={styles.mapBtnText}>Call</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.mapBtn, { backgroundColor: '#6B7280' }]} onPress={() => setSelectedPlace(null)}>
                      <Text style={styles.mapBtnText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* LIST TAB */}
          {tab === 'list' && (
            <ScrollView
              style={{ flex: 1 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
              {places.length === 0 ? (
                <View style={styles.center}>
                  <Text style={{ color: '#64748B', marginTop: 40 }}>No safe places found within search radius.</Text>
                </View>
              ) : (
                places.map(p => (
                  <View key={p.id} style={[styles.placeCard, p.isInDangerZone && styles.placeCardDanger]}>
                    <View style={styles.placeRow}>
                      <View style={[styles.iconBox, { backgroundColor: p.isInDangerZone ? '#FEF3C7' : '#DCFCE7' }]}>
                        {typeIcon(p.type, p.isInDangerZone ? '#D97706' : '#16A34A')}
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.placeName}>{p.name}</Text>
                        <Text style={styles.placeMeta}>{typeLabel(p.type)} · {p.district}</Text>
                        {p.address ? <Text style={styles.placeAddr}>{p.address}</Text> : null}
                        <View style={styles.placeTagRow}>
                          <View style={[styles.tag, { backgroundColor: p.isInDangerZone ? '#FEF3C7' : '#DCFCE7' }]}>
                            <Text style={[styles.tagText, { color: p.isInDangerZone ? '#92400E' : '#15803D' }]}>
                              {p.isInDangerZone ? '⚠️ In danger zone' : '✅ Safe location'}
                            </Text>
                          </View>
                          <View style={styles.tag}>
                            <Text style={styles.tagText}>{p.distanceKm} km away</Text>
                          </View>
                          {p.capacity ? (
                            <View style={styles.tag}>
                              <Text style={styles.tagText}>Cap: {p.capacity}</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </View>
                    <View style={styles.placeActions}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => openMaps(p)}>
                        <Navigation color="#2563EB" size={14} />
                        <Text style={styles.actionBtnText}>Directions</Text>
                      </TouchableOpacity>
                      {p.phone ? (
                        <TouchableOpacity style={[styles.actionBtn, { borderColor: '#16A34A' }]} onPress={() => callPhone(p.phone!)}>
                          <Phone color="#16A34A" size={14} />
                          <Text style={[styles.actionBtnText, { color: '#16A34A' }]}>Call</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                ))
              )}
              <View style={{ height: 30 }} />
            </ScrollView>
          )}

          {/* CONTACTS TAB */}
          {tab === 'contacts' && (
            <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
              {authorities.length === 0 ? (
                <View style={styles.center}>
                  <Text style={{ color: '#64748B', marginTop: 40 }}>No authority contacts available for this area.</Text>
                </View>
              ) : (
                authorities.map(a => (
                  <View key={a.id} style={styles.contactCard}>
                    <View style={styles.contactRow}>
                      <View style={styles.contactIconBox}>
                        <ShieldCheck color="#2563EB" size={20} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.contactName}>{a.name}</Text>
                        <Text style={styles.contactRole}>{roleLabel(a.role)}</Text>
                        {a.district !== 'ALL' ? <Text style={styles.contactDistrict}>{a.district} District</Text> : null}
                      </View>
                    </View>
                    <View style={styles.placeActions}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => callPhone(a.phone)}>
                        <Phone color="#2563EB" size={14} />
                        <Text style={styles.actionBtnText}>{a.phone}</Text>
                      </TouchableOpacity>
                      {a.phone2 ? (
                        <TouchableOpacity style={styles.actionBtn} onPress={() => callPhone(a.phone2!)}>
                          <Phone color="#2563EB" size={14} />
                          <Text style={styles.actionBtnText}>{a.phone2}</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                ))
              )}
              {/* National emergency always shown */}
              <View style={[styles.contactCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                <Text style={[styles.contactName, { color: '#DC2626' }]}>National Emergency Hotlines</Text>
                <View style={styles.placeActions}>
                  <TouchableOpacity style={[styles.actionBtn, { borderColor: '#DC2626' }]} onPress={() => callPhone('1938')}>
                    <Phone color="#DC2626" size={14} />
                    <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>DMC: 1938</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { borderColor: '#DC2626' }]} onPress={() => callPhone('117')}>
                    <Phone color="#DC2626" size={14} />
                    <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Disaster: 117</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ height: 30 }} />
            </ScrollView>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F8FAFC' },
  header:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E3A5F', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn:      { padding: 6 },
  headerTitle:  { color: '#fff', fontSize: 18, fontWeight: '800' },
  headerSub:    { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 1 },
  badge:        { backgroundColor: '#16A34A', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:    { color: '#fff', fontSize: 12, fontWeight: '700' },
  routeBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#2563EB', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8 },
  routeBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  alertBanner:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF3C7', paddingHorizontal: 16, paddingVertical: 10 },
  alertText:    { color: '#92400E', fontSize: 13, fontWeight: '600', flex: 1 },
  tabBar:       { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabBtn:       { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabBtnActive: { borderBottomWidth: 3, borderBottomColor: '#2563EB' },
  tabLabel:     { fontSize: 13, color: '#64748B', fontWeight: '600' },
  tabLabelActive: { color: '#2563EB' },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  loadingText:  { color: '#64748B', marginTop: 12, fontSize: 14 },
  selectedCard: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  selectedName: { fontSize: 15, fontWeight: '700', color: '#0F172A', flex: 1 },
  selectedMeta: { fontSize: 13, color: '#64748B', marginTop: 2 },
  mapBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#2563EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  mapBtnText:   { color: '#fff', fontSize: 13, fontWeight: '600' },
  placeCard:    { margin: 12, marginBottom: 0, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  placeCardDanger: { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' },
  placeRow:     { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox:      { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  placeName:    { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  placeMeta:    { fontSize: 12, color: '#64748B', marginTop: 2 },
  placeAddr:    { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  placeTagRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  tag:          { backgroundColor: '#F1F5F9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText:      { fontSize: 11, color: '#475569', fontWeight: '600' },
  placeActions: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  actionBtn:    { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.5, borderColor: '#2563EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  actionBtnText: { color: '#2563EB', fontSize: 13, fontWeight: '600' },
  contactCard:  { margin: 12, marginBottom: 0, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  contactRow:   { flexDirection: 'row', alignItems: 'center' },
  contactIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  contactName:  { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  contactRole:  { fontSize: 12, color: '#2563EB', fontWeight: '600', marginTop: 1 },
  contactDistrict: { fontSize: 12, color: '#64748B', marginTop: 1 },
});
