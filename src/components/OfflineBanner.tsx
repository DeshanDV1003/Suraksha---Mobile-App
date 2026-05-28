import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { addConnectivityListener } from '../services/networkMonitor';
import { getPendingCount } from '../storage/localDB';
import { forceSyncNow } from '../services/syncService';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const slideAnim = useState(new Animated.Value(-60))[0];

  useEffect(() => {
    const unsub = addConnectivityListener(async (online) => {
      setIsOnline(online);
      Animated.timing(slideAnim, {
        toValue: online ? -60 : 0,
        duration: 350,
        useNativeDriver: true
      }).start();

      if (!online) {
        const count = await getPendingCount();
        setPendingCount(count);
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
  };

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
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
    backgroundColor: '#92400e', paddingTop: 44, paddingBottom: 12,
    paddingHorizontal: 16
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { fontSize: 22 },
  textGroup: { flex: 1 },
  title: { color: 'white', fontWeight: '700', fontSize: 14 },
  subtitle: { color: '#fcd34d', fontSize: 12, marginTop: 2 },
  syncBtn: {
    backgroundColor: '#b45309', paddingHorizontal: 14,
    paddingVertical: 6, borderRadius: 6
  },
  syncText: { color: 'white', fontWeight: '700', fontSize: 13 }
});
