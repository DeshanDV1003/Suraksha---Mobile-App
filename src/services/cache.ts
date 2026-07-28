import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'cache_';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours — screens refresh from network when online

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > TTL_MS) return null; // expired
    return data as T;
  } catch {
    return null;
  }
}

export async function setCache(key: string, data: any): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

export async function clearCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch {}
}
