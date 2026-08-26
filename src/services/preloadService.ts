import { cacheIncidents, cacheAlerts, cacheReliefCamps, getMeta } from '../storage/localDB';
import { getToken } from './storage';
import { API_BASE_URL } from './api';

async function apiFetch(path: string) {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'ngrok-skip-browser-warning': 'true', // bypass ngrok interstitial page
    }
  });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) throw new Error(`Got HTML for ${path} — ngrok tunnel may not be running`);
  return res.json();
}

export async function preloadCriticalData() {
  try {
    const lastSync = await getMeta('last_incidents_sync');
    const since = lastSync ? `?since=${lastSync}` : '';

    const [incidents, alerts, camps] = await Promise.all([
      apiFetch(`/incidents${since}`).catch(() => null),
      apiFetch('/alerts').catch(() => null),
      apiFetch('/camps').catch(() => null),
    ]);

    if (Array.isArray(incidents)) await cacheIncidents(incidents);
    if (Array.isArray(alerts))    await cacheAlerts(alerts);
    if (Array.isArray(camps))     await cacheReliefCamps(camps);

    console.log('[Preload] Critical data cached for offline use');
  } catch (err: any) {
    console.log('[Preload] Failed to preload (backend may be offline):', err.message);
  }
}
