import * as Network from 'expo-network';
import { AppState } from 'react-native';
import { syncPendingItems } from './syncService';

let isOnline = true;
let listeners: ((online: boolean) => void)[] = [];
let appStateSubscription: any = null;
let networkCheckInterval: any = null;

export function addConnectivityListener(fn: (online: boolean) => void) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

function notifyListeners(online: boolean) {
  isOnline = online;
  listeners.forEach(fn => fn(online));
}

export async function checkConnectivity() {
  try {
    const state = await Network.getNetworkStateAsync();
    // isInternetReachable is null on Android when undetermined — treat null as online
    // Only treat as offline when explicitly false
    const online = state.isConnected && state.isInternetReachable !== false;
    return !!online;
  } catch {
    return false;
  }
}

export function getIsOnline() {
  return isOnline;
}

export async function startNetworkMonitoring() {
  // Initial check
  const initial = await checkConnectivity();
  notifyListeners(initial);

  // Poll every 8 seconds
  networkCheckInterval = setInterval(async () => {
    const currentlyOnline = await checkConnectivity();
    if (currentlyOnline !== isOnline) {
      notifyListeners(currentlyOnline);
      // Just came online — trigger sync immediately
      if (currentlyOnline) {
        console.log('[Network] Connection restored — starting sync');
        await syncPendingItems();
      }
    }
  }, 8000);

  // Also check when app comes to foreground
  appStateSubscription = AppState.addEventListener('change', async (state) => {
    if (state === 'active') {
      const online = await checkConnectivity();
      if (online && !isOnline) {
        notifyListeners(true);
        await syncPendingItems();
      } else {
        notifyListeners(online);
      }
    }
  });
}

export function stopNetworkMonitoring() {
  clearInterval(networkCheckInterval);
  appStateSubscription?.remove();
}
