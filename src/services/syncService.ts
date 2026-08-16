import { getPendingItems, markSynced, markFailed, getPendingCount } from '../storage/localDB';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './api';

// API_BASE_URL already ends with /api, so endpoints here are relative to that
const API_URL = API_BASE_URL;

let isSyncing = false;

// Maps queue item type to the API endpoint and method
const SYNC_HANDLERS: Record<string, { method: string, endpoint: string | ((payload: any) => string) }> = {
  INCIDENT_REPORT:       { method: 'POST',  endpoint: '/incidents' },
  HELP_REQUEST:          { method: 'POST',  endpoint: '/help-requests' },
  DAMAGE_ASSESSMENT:     { method: 'POST',  endpoint: '/assessments/damage' },
  PSYCHOLOGICAL_SUPPORT: { method: 'POST',  endpoint: '/psychological-support' },
  TASK_STATUS_UPDATE:    { method: 'PATCH', endpoint: (p: any) => `/volunteers/tasks/${p.taskId}/status` },
  REPORT_VERIFICATION:   { method: 'POST',  endpoint: '/help-requests/verifier/verify' },
  RELIEF_TOKEN_CLAIM:    { method: 'POST',  endpoint: '/relief-tokens/claim' },
  MISSING_PERSON_REPORT: { method: 'POST',  endpoint: '/missing-persons' },
  RESOURCE_SUBMISSION:   { method: 'POST',  endpoint: '/resources' },
  DONATION_SUBMIT:       { method: 'POST',  endpoint: '/donations' },
  FAMILY_SAFETY_UPDATE:  { method: 'POST',  endpoint: '/family/status' },
  SOS_PANIC:             { method: 'POST',  endpoint: '/incidents/sos' },
};

export async function syncPendingItems() {
  if (isSyncing) return;
  
  // Use dynamic require to break the require cycle with networkMonitor
  const { getIsOnline } = require('./networkMonitor');
  if (!getIsOnline()) return;

  isSyncing = true;
  const pending = await getPendingItems();

  if (pending.length === 0) {
    isSyncing = false;
    return;
  }

  console.log(`[Sync] Starting sync of ${pending.length} pending items`);
  const token = await AsyncStorage.getItem('token');

  for (const item of pending) {
    try {
      const payload = JSON.parse(item.payload);
      const handler = SYNC_HANDLERS[item.type];

      if (!handler) {
        await markFailed(item.id, `Unknown type: ${item.type}`);
        continue;
      }

      const endpoint = typeof handler.endpoint === 'function'
        ? handler.endpoint(payload)
        : handler.endpoint;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: handler.method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'X-Offline-Sync': 'true',        // tells backend this was an offline submission
          'X-Original-Timestamp': item.created_at  // preserves when it actually happened
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await markSynced(item.id);
        console.log(`[Sync] ✓ Synced ${item.type} ${item.id}`);
      } else {
        const errText = await response.text();
        // 4xx = permanent failure (bad data), 5xx = retry later
        if (response.status >= 400 && response.status < 500) {
          await markFailed(item.id, `HTTP ${response.status}: ${errText}`);
        } else {
          await markFailed(item.id, `HTTP ${response.status}`);
        }
      }
    } catch (err: any) {
      await markFailed(item.id, err.message);
      console.warn(`[Sync] ✗ Failed ${item.type} ${item.id}:`, err.message);
    }

    // Small delay between requests to avoid hammering the server
    await new Promise(r => setTimeout(r, 300));
  }

  const remaining = await getPendingCount();
  console.log(`[Sync] Complete. ${remaining} items still pending.`);
  isSyncing = false;
}

export async function forceSyncNow() {
  isSyncing = false; // reset lock
  return syncPendingItems();
}
