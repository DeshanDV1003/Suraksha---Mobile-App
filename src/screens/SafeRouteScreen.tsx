import React, { useState, useEffect, useCallback, useRef, Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';

class MapErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ height: 280, backgroundColor: '#1e2d47', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#64748b', fontSize: 12, textAlign: 'center', paddingHorizontal: 24 }}>
            Map unavailable — Google Maps API key required.{'\n'}Routes still work below.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Route, AlertTriangle, CheckCircle, XCircle, MapPin, Navigation } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RouteOption {
  name:          string;
  color:         string;
  waypoints:     [number, number][];
  score:         number;
  risk:          'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  estimatedKm:   number;
  hazardsNearby: Array<{ name: string; type: string; distanceKm: number }>;
}

interface RouteResult {
  from:           { lat: number; lng: number };
  destination:    { name: string; lat: number; lng: number; type: string };
  routes:         RouteOption[];
  hazards:        Array<{ id: string; name: string; type: string; severity: string; lat: number; lng: number; radiusM: number }>;
  directDistKm:   number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROUTE_COLORS = ['#16A34A', '#D97706', '#9333EA'];

const riskColor = (risk: string) => {
  switch (risk) {
    case 'LOW':      return '#16A34A';
    case 'MODERATE': return '#D97706';
    case 'HIGH':     return '#EA580C';
    default:         return '#DC2626';
  }
};

const riskBg = (risk: string) => {
  switch (risk) {
    case 'LOW':      return '#dcfce7';
    case 'MODERATE': return '#fef3c7';
    case 'HIGH':     return '#ffedd5';
    default:         return '#fee2e2';
  }
};

// Convert waypoints [lat,lng][] to LatLng objects for react-native-maps
const toLatLng = (waypoints: [number, number][]) =>
  waypoints.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));

export default function SafeRouteScreen() {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locLoading, setLocLoading] = useState(true);
  const [locError, setLocError] = useState('');

  const [destType, setDestType] = useState<'SAFE_ZONE' | 'CAMP'>('SAFE_ZONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RouteResult | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // ── GPS on mount ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocError('Location permission denied. Enter coordinates manually.');
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch {
        setLocError('Could not get GPS location. Try again.');
      } finally {
        setLocLoading(false);
      }
    })();
  }, []);

  // ── Compute routes ───────────────────────────────────────────────────────────
  const compute = useCallback(async () => {
    if (!location) { Alert.alert('No location', 'Enable GPS or wait for location to load.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/map/safe-route`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ fromLat: location.latitude, fromLng: location.longitude, destType }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Server error');
      const data: RouteResult = await res.json();
      setResult(data);
      setSelectedIdx(0);

      // Fit map to include all waypoints of the primary route
      if (data.routes.length && mapRef.current) {
        const coords = toLatLng(data.routes[0].waypoints);
        mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 60, bottom: 60, left: 40, right: 40 }, animated: true });
      }
    } catch (e: any) {
      setError(e.message || 'Failed to compute routes');
    } finally { setLoading(false); }
  }, [location, destType]);

  // ── Open selected route in Google Maps ──────────────────────────────────────
  const openInGoogleMaps = useCallback(() => {
    if (!result) return;
    const route = result.routes[selectedIdx];
    if (!route) return;
    const dest = result.destination;
    const origin = `${location!.latitude},${location!.longitude}`;
    const destination = `${dest.lat},${dest.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    Linking.openURL(url);
  }, [result, selectedIdx, location]);

  // ── Initial map region ───────────────────────────────────────────────────────
  const mapRegion = location
    ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.1, longitudeDelta: 0.1 }
    : { latitude: 7.8731, longitude: 80.7718, latitudeDelta: 3.0, longitudeDelta: 3.0 };

  const selectedRoute = result?.routes[selectedIdx];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Safe Route Finder</Text>
          <Text style={styles.headerSub}>Hazard-aware evacuation routing</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Map */}
        <MapErrorBoundary>
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            region={mapRegion}
          >
            {/* User location pin */}
            {location && (
              <Marker coordinate={location} title="Your Location" pinColor="#1E3A5F" />
            )}
            {/* Destination pin */}
            {result && (
              <Marker
                coordinate={{ latitude: result.destination.lat, longitude: result.destination.lng }}
                title={result.destination.name}
                pinColor="#16A34A"
              />
            )}
            {/* All routes (unselected = faded, selected = bold) */}
            {result && result.routes.map((route, idx) => (
              <Polyline
                key={idx}
                coordinates={toLatLng(route.waypoints)}
                strokeColor={ROUTE_COLORS[idx] || '#6B7280'}
                strokeWidth={idx === selectedIdx ? 5 : 2}
                lineDashPattern={idx === selectedIdx ? undefined : [8, 6]}
                opacity={idx === selectedIdx ? 1 : 0.35}
              />
            ))}
          </MapView>
          {locLoading && (
            <View style={styles.mapOverlay}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.mapOverlayText}>Getting your location…</Text>
            </View>
          )}
        </View>
        </MapErrorBoundary>

        {/* Controls */}
        <View style={styles.controls}>
          {locError ? (
            <View style={styles.errorBox}>
              <AlertTriangle size={14} color="#DC2626" />
              <Text style={styles.errorText}>{locError}</Text>
            </View>
          ) : location ? (
            <View style={styles.locRow}>
              <MapPin size={13} color="#16A34A" />
              <Text style={styles.locText}>
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </Text>
            </View>
          ) : null}

          {/* Destination type picker */}
          <Text style={styles.label}>Route to:</Text>
          <View style={styles.destRow}>
            {(['SAFE_ZONE', 'CAMP'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.destBtn, destType === type && styles.destBtnActive]}
                onPress={() => setDestType(type)}
              >
                <Text style={[styles.destBtnText, destType === type && styles.destBtnTextActive]}>
                  {type === 'SAFE_ZONE' ? '🛡 Nearest Safe Zone' : '🏕 Nearest Relief Camp'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <AlertTriangle size={14} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.computeBtn, (loading || !location) && { opacity: 0.5 }]}
            onPress={compute}
            disabled={loading || !location}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Route size={16} color="#fff" />
                <Text style={styles.computeBtnText}>Calculate Safe Routes</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Route results */}
          {result && (
            <>
              <View style={styles.destinationBanner}>
                <CheckCircle size={14} color="#16A34A" />
                <Text style={styles.destinationText}>
                  To: <Text style={{ fontWeight: '700' }}>{result.destination.name}</Text>
                  {'  '}·{'  '}{result.directDistKm} km straight-line
                </Text>
              </View>

              {result.routes.map((route, idx) => {
                const isSelected = idx === selectedIdx;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.routeCard, isSelected && { borderColor: ROUTE_COLORS[idx] || '#16A34A', borderWidth: 2 }]}
                    onPress={() => {
                      setSelectedIdx(idx);
                      if (mapRef.current) {
                        mapRef.current.fitToCoordinates(toLatLng(route.waypoints), {
                          edgePadding: { top: 60, bottom: 60, left: 40, right: 40 }, animated: true,
                        });
                      }
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={styles.routeHeader}>
                      <View style={styles.routeNameRow}>
                        <View style={[styles.routeDot, { backgroundColor: ROUTE_COLORS[idx] || '#6B7280' }]} />
                        <Text style={styles.routeName}>{route.name}</Text>
                      </View>
                      <View style={[styles.riskBadge, { backgroundColor: riskBg(route.risk) }]}>
                        <Text style={[styles.riskText, { color: riskColor(route.risk) }]}>{route.risk}</Text>
                      </View>
                    </View>

                    {/* Score bar */}
                    <View style={styles.scoreRow}>
                      <View style={styles.scoreBar}>
                        <View style={[styles.scoreFill, { width: `${route.score}%` as any, backgroundColor: riskColor(route.risk) }]} />
                      </View>
                      <Text style={styles.scoreLabel}>{route.score}%</Text>
                    </View>

                    <View style={styles.routeMeta}>
                      <Text style={styles.metaText}>{route.estimatedKm} km</Text>
                      {route.hazardsNearby.length > 0 ? (
                        <Text style={styles.hazardText}>⚠ {route.hazardsNearby.length} hazard{route.hazardsNearby.length > 1 ? 's' : ''} nearby</Text>
                      ) : (
                        <Text style={styles.clearText}>✓ Clear path</Text>
                      )}
                    </View>

                    {isSelected && route.hazardsNearby.length > 0 && (
                      <View style={styles.hazardList}>
                        {route.hazardsNearby.slice(0, 3).map((h, i) => (
                          <Text key={i} style={styles.hazardItem}>
                            {h.type === 'FLOOD' ? '🌊' : '⚠'} {h.name} ({h.distanceKm} km away)
                          </Text>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* Google Maps button */}
              <TouchableOpacity style={styles.mapsBtn} onPress={openInGoogleMaps}>
                <Navigation size={16} color="#fff" />
                <Text style={styles.mapsBtnText}>Navigate in Google Maps</Text>
              </TouchableOpacity>

              {/* Hazard summary */}
              {result.hazards.length > 0 && (
                <View style={styles.hazardSummary}>
                  <Text style={styles.hazardSummaryTitle}>
                    {result.hazards.length} Active Hazard{result.hazards.length > 1 ? 's' : ''} Considered
                  </Text>
                  {result.hazards.slice(0, 5).map(h => (
                    <Text key={h.id} style={styles.hazardSummaryItem}>
                      {h.type === 'FLOOD' ? '🌊' : h.type === 'THREAT' ? '⚡' : '⚠'} {h.name} — {h.severity}
                    </Text>
                  ))}
                  {result.hazards.length > 5 && (
                    <Text style={styles.hazardSummaryMore}>+{result.hazards.length - 5} more</Text>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#0b1120' },
  header:          { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#131f33' },
  backBtn:         { width: 38, height: 38, borderRadius: 12, backgroundColor: '#1e2d47', alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { color: '#f1f5f9', fontSize: 17, fontWeight: '900' },
  headerSub:       { color: '#64748b', fontSize: 11, fontWeight: '700', marginTop: 1 },
  mapContainer:    { height: 280, position: 'relative' },
  map:             { flex: 1 },
  mapOverlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', gap: 8 },
  mapOverlayText:  { color: '#fff', fontSize: 12, fontWeight: '700' },
  controls:        { padding: 20, gap: 12 },
  label:           { color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  locRow:          { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locText:         { color: '#16A34A', fontSize: 11, fontWeight: '700' },
  destRow:         { flexDirection: 'row', gap: 8 },
  destBtn:         { flex: 1, backgroundColor: '#1e2d47', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  destBtnActive:   { backgroundColor: '#0f2d1a', borderColor: '#16A34A' },
  destBtnText:     { color: '#94a3b8', fontSize: 11, fontWeight: '700' },
  destBtnTextActive: { color: '#16A34A' },
  computeBtn:      { backgroundColor: '#16A34A', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  computeBtnText:  { color: '#fff', fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  errorBox:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fee2e2', borderRadius: 10, padding: 10 },
  errorText:       { color: '#DC2626', fontSize: 12, fontWeight: '600', flex: 1 },
  destinationBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0f2d1a', borderRadius: 10, padding: 10 },
  destinationText: { color: '#86efac', fontSize: 12, flex: 1 },
  routeCard:       { backgroundColor: '#131f33', borderRadius: 16, padding: 14, gap: 8, borderWidth: 1, borderColor: 'transparent' },
  routeHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  routeNameRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeDot:        { width: 10, height: 10, borderRadius: 5 },
  routeName:       { color: '#e2e8f0', fontSize: 13, fontWeight: '800' },
  riskBadge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  riskText:        { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  scoreRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreBar:        { flex: 1, height: 5, backgroundColor: '#1e2d47', borderRadius: 3, overflow: 'hidden' },
  scoreFill:       { height: '100%', borderRadius: 3 },
  scoreLabel:      { color: '#94a3b8', fontSize: 11, fontWeight: '800', width: 30, textAlign: 'right' },
  routeMeta:       { flexDirection: 'row', gap: 12 },
  metaText:        { color: '#64748b', fontSize: 11, fontWeight: '700' },
  hazardText:      { color: '#D97706', fontSize: 11, fontWeight: '700' },
  clearText:       { color: '#16A34A', fontSize: 11, fontWeight: '700' },
  hazardList:      { backgroundColor: '#0f172a', borderRadius: 10, padding: 8, gap: 4 },
  hazardItem:      { color: '#94a3b8', fontSize: 11 },
  mapsBtn:         { backgroundColor: '#1E3A5F', borderRadius: 14, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  mapsBtnText:     { color: '#fff', fontSize: 13, fontWeight: '800' },
  hazardSummary:   { backgroundColor: '#1a0a0a', borderRadius: 12, padding: 12, gap: 4 },
  hazardSummaryTitle: { color: '#fca5a5', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  hazardSummaryItem: { color: '#94a3b8', fontSize: 11 },
  hazardSummaryMore: { color: '#64748b', fontSize: 10 },
});
