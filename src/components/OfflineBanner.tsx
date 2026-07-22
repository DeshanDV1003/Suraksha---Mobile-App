import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { addConnectivityListener, checkConnectivity } from '../services/networkMonitor';
import { getPendingCount } from '../storage/localDB';
import { forceSyncNow } from '../services/syncService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BANNER_HEIGHT = 56;

export default function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const slideAnim = useRef(new Animated.Value(-(BANNER_HEIGHT + insets.top))).current;
  const visibleRef = useRef(false);

  const show = () => {
    if (visibleRef.current) return;
    visibleRef.current = true;
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const hide = () => {
    if (!visibleRef.current) return;
    visibleRef.current = false;
    Animated.timing(slideAnim, {
      toValue: -(BANNER_HEIGHT + insets.top),
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    // Check actual connectivity on mount so we don't flash the banner when online
    checkConnectivity().then((online) => {
      setIsOnline(online);
      if (!online) {
        getPendingCount().then(setPendingCount);
        show();
      }
    });

    const unsub = addConnectivityListener(async (online) => {
      setIsOnline(online);
      if (online) {
        hide();
      } else {
        const count = await getPendingCount();
        setPendingCount(count);
        show();
      }
    });
    return unsub;
  }, []);

  const handleSyncNow = async () => {
    setSyncing(true);
    await forceSyncNow();
    const count = await getPendingCount();
    setPendingCount(count);
    setSyncing(false);
    if (count === 0) hide();
  };

  const totalHeight = BANNER_HEIGHT + insets.top;

  return (
    <Animated.View
      style={[
        styles.banner,
        { height: totalHeight, paddingTop: insets.top, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.row}>
        <Text style={styles.icon}>📡</Text>
        <View style={styles.textGroup}>
          <Text style={styles.title}>You are offline</Text>
          <Text style={styles.subtitle}>
            {pendingCount > 0
              ? `${pendingCount} report${pendingCount > 1 ? 's' : ''} will sync when connected`
              : 'Reports will be saved and sent when connected'}
          </Text>
        </View>
        {pendingCount > 0 && isOnline && (
          <TouchableOpacity onPress={handleSyncNow} style={styles.syncBtn}>
            <Text style={styles.syncText}>{syncing ? '...' : 'Sync'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999,
    backgroundColor: '#92400e',
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { fontSize: 20 },
  textGroup: { flex: 1 },
  title: { color: 'white', fontWeight: '700', fontSize: 13 },
  subtitle: { color: '#fcd34d', fontSize: 11, marginTop: 2 },
  syncBtn: {
    backgroundColor: '#b45309', paddingHorizontal: 14,
    paddingVertical: 6, borderRadius: 6,
  },
  syncText: { color: 'white', fontWeight: '700', fontSize: 13 },
});
