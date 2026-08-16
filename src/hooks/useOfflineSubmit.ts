import { useState } from 'react';
import { addToSyncQueue } from '../storage/localDB';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../services/api';

export function useOfflineSubmit(type: string, endpoint: string, method: 'POST' | 'PATCH' = 'POST') {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'queued' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit(data: any) {
    setStatus('submitting');
    setError(null);

    const token = await AsyncStorage.getItem('token');

    // Always attempt the network call — don't rely on a cached online flag
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setStatus('success');
        return { success: true, data: await response.json() };
      }

      // 4xx = server rejected the request (auth error, validation) — surface it, don't queue
      if (response.status >= 400 && response.status < 500) {
        const body = await response.json().catch(() => ({}));
        const raw = body?.message || body?.error || `Request failed (${response.status})`;
        const msg = typeof raw === 'string' ? raw : JSON.stringify(raw);
        setStatus('error');
        setError(msg);
        throw new Error(msg);
      }

      // 5xx = server-side problem — fall through to queue for retry
      throw new Error(`server_error_${response.status}`);

    } catch (err: any) {
      const isNetworkOrTimeout =
        err.name === 'AbortError' ||
        err.message === 'Network request failed' ||
        err.message?.startsWith('server_error_');

      if (!isNetworkOrTimeout) {
        // Re-throw 4xx / validation errors — caller shows them to the user
        throw err;
      }
      // Network unreachable or server down — queue for later
    }

    const queueId = await addToSyncQueue(type, data);
    setStatus('queued');
    return { success: true, queued: true, queueId };
  }

  return { submit, status, error };
}
