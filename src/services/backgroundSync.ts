import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { syncPendingItems } from './syncService';
import { checkConnectivity } from './networkMonitor';

const BACKGROUND_SYNC_TASK = 'SURAKSHA_BACKGROUND_SYNC';

// Define the task
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const online = await checkConnectivity();
    if (online) {
      await syncPendingItems();
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync() {
  const status = await BackgroundFetch.getStatusAsync();

  if (status === BackgroundFetch.BackgroundFetchStatus.Available || status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutes minimum (OS enforced)
      stopOnTerminate: false,    // keep running after app close
      startOnBoot: true          // start when device restarts
    });
    console.log('[BackgroundSync] Registered');
  } else {
    console.warn('[BackgroundSync] Not available on this device');
  }
}
