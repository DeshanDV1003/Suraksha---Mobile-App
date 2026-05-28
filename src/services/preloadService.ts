import { cacheIncidents, cacheAlerts, cacheReliefCamps, getMeta } from '../storage/localDB';
import { getToken } from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.8.121:3002';

async function apiFetch(path: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  });
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

export async function preloadCriticalData() {
  try {
    const lastSync = await getMeta('last_incidents_sync');
    const since = lastSync ? `?since=${lastSync}` : '';

    // If these endpoints differ from api.ts, they should be adjusted
    const [incidents, alerts, camps] = await Promise.all([
      apiFetch(`/api/incidents${since}`),
      apiFetch('/api/alerts?active=true'), // Assuming an alert api exists
      apiFetch('/api/camps') // In api.ts it's /camps, not /relief-camps
    ]);

    if (incidents) await cacheIncidents(incidents);
    if (alerts) await cacheAlerts(alerts);
    if (camps) await cacheReliefCamps(camps);

    console.log('[Preload] Critical data cached for offline use');
  } catch (err: any) {
    console.warn('[Preload] Failed to preload:', err.message);
    // Non-fatal — user still has whatever was cached last time
  }
}
