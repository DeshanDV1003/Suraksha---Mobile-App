import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { syncPendingItems } from './syncService';
import { checkConnectivity } from './networkMonitor';

const BACKGROUND_SYNC_TASK = 'SURAKSHA_BACKGROUND_SYNC';

// expo-background-fetch does not work in Expo Go (SDK 53+).
// Only register when running in a development build or production.
const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    // Fallback for older Expo versions
    (Constants as any).appOwnership === 'expo';

// Define task once at module load (TaskManager throws if defined twice)
if (!isExpoGo) {
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
}

let registered = false;

export async function registerBackgroundSync(): Promise<void> {
    // Skip in Expo Go — background fetch is unavailable there
    if (isExpoGo) {
        return;
    }

    // Guard against double-registration across React re-renders / StrictMode
    if (registered) return;

    try {
        const status = await BackgroundFetch.getStatusAsync();
        const available =
            status === BackgroundFetch.BackgroundFetchStatus.Available ||
            status === BackgroundFetch.BackgroundFetchStatus.Restricted;

        if (!available) {
            return;
        }

        const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
        if (!isTaskRegistered) {
            await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
                minimumInterval: 15 * 60, // 15 minutes (OS enforced)
                stopOnTerminate: false,
                startOnBoot: true,
            });
        }

        registered = true;
        console.log('[BackgroundSync] Registered');
    } catch (err) {
        // Non-fatal — offline sync still works via foreground network monitoring
        console.log('[BackgroundSync] Could not register:', (err as Error).message);
    }
}
