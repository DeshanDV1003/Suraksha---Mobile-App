import { useState } from 'react';
import { getIsOnline } from '../services/networkMonitor';
import { addToSyncQueue } from '../storage/localDB';
import { getToken } from '../services/storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.8.121:3001';

export function useOfflineSubmit(type: string, endpoint: string) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'queued' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit(data: any) {
    setStatus('submitting');
    setError(null);

    const online = getIsOnline();

    if (online) {
      // Try direct API call
      try {
        const token = await getToken();
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          setStatus('success');
          return { success: true, data: await response.json() };
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      } catch (err: any) {
        // Network call failed even though we thought we were online
        // Fall through to offline queue
        console.warn('[Submit] Online submit failed, queuing offline:', err.message);
      }
    }

    // Queue for later sync
    const queueId = await addToSyncQueue(type, data);
    setStatus('queued');
    return { success: true, queued: true, queueId };
  }

  return { submit, status, error };
}
