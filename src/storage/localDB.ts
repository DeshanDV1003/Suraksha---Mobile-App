import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

let db: SQLite.SQLiteDatabase;
let dbReady: Promise<void> | null = null;

export function openDatabase(): Promise<void> {
  if (!dbReady) {
    dbReady = (async () => {
      db = await SQLite.openDatabaseAsync('suraksha_offline.db');
      await db.execAsync(`PRAGMA journal_mode = WAL;`);
      await setupTables();
    })();
  }
  return dbReady;
}

async function ensureDb(): Promise<void> {
  if (!db) await openDatabase();
}

async function setupTables() {
  await db.execAsync(`
    -- Offline queue for all outbound data
    CREATE TABLE IF NOT EXISTS sync_queue (
      id            TEXT PRIMARY KEY,
      type          TEXT NOT NULL,
      payload       TEXT NOT NULL,
      status        TEXT DEFAULT 'pending',
      attempts      INTEGER DEFAULT 0,
      max_attempts  INTEGER DEFAULT 5,
      created_at    TEXT DEFAULT (datetime('now')),
      synced_at     TEXT,
      error_msg     TEXT
    );

    -- Local cache of incidents (read from server)
    CREATE TABLE IF NOT EXISTS incidents_cache (
      id          TEXT PRIMARY KEY,
      title       TEXT,
      description TEXT,
      location    TEXT,
      latitude    REAL,
      longitude   REAL,
      severity    TEXT,
      status      TEXT,
      category    TEXT,
      zone_id     TEXT,
      zone_name   TEXT,
      created_at  TEXT,
      synced      INTEGER DEFAULT 1
    );

    -- Local cache of alerts
    CREATE TABLE IF NOT EXISTS alerts_cache (
      id         TEXT PRIMARY KEY,
      title      TEXT,
      message    TEXT,
      location   TEXT,
      type       TEXT,
      active     INTEGER DEFAULT 1,
      created_at TEXT
    );

    -- Local cache of relief camps
    CREATE TABLE IF NOT EXISTS relief_camps_cache (
      id                TEXT PRIMARY KEY,
      name              TEXT,
      location          TEXT,
      latitude          REAL,
      longitude         REAL,
      current_occupancy INTEGER,
      total_capacity    INTEGER,
      services          TEXT,
      status            TEXT,
      wait_time         TEXT,
      updated_at        TEXT
    );

    -- App metadata (last sync times etc)
    CREATE TABLE IF NOT EXISTS app_meta (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

// ─── SYNC QUEUE OPERATIONS ────────────────────────────────────────────────

export async function addToSyncQueue(type: string, payload: any) {
  await ensureDb();
  const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  await db.runAsync(
    `INSERT INTO sync_queue (id, type, payload) VALUES (?, ?, ?)`,
    [id, type, JSON.stringify(payload)]
  );
  return id;
}

export async function getPendingItems() {
  await ensureDb();
  return await db.getAllAsync<any>(
    `SELECT * FROM sync_queue 
     WHERE status = 'pending' AND attempts < max_attempts
     ORDER BY created_at ASC`
  );
}

export async function markSynced(id: string) {
  await ensureDb();
  await db.runAsync(
    `UPDATE sync_queue SET status = 'synced', synced_at = datetime('now') WHERE id = ?`,
    [id]
  );
}

export async function markFailed(id: string, errorMsg: string) {
  await ensureDb();
  await db.runAsync(
    `UPDATE sync_queue 
     SET attempts = attempts + 1, error_msg = ?, 
         status = CASE WHEN attempts + 1 >= max_attempts THEN 'failed' ELSE 'pending' END
     WHERE id = ?`,
    [errorMsg, id]
  );
}

export async function getPendingCount() {
  await ensureDb();
  const result = await db.getFirstAsync<{count: number}>(
    `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'`
  );
  return result?.count || 0;
}

// ─── INCIDENT CACHE OPERATIONS ───────────────────────────────────────────

export async function cacheIncidents(incidents: any[]) {
  await ensureDb();
  for (const inc of incidents) {
    await db.runAsync(
      `INSERT OR REPLACE INTO incidents_cache 
       (id, title, description, location, latitude, longitude, severity, status, category, zone_id, zone_name, created_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [inc.id, inc.title, inc.description, inc.location, inc.latitude,
       inc.longitude, inc.severity, inc.status, inc.category,
       inc.zoneId, inc.zoneName, inc.createdAt]
    );
  }
  await setMeta('last_incidents_sync', new Date().toISOString());
}

export async function getCachedIncidents() {
  await ensureDb();
  return await db.getAllAsync<any>(
    `SELECT * FROM incidents_cache ORDER BY created_at DESC`
  );
}

// ─── ALERTS CACHE OPERATIONS ─────────────────────────────────────────────

export async function cacheAlerts(alerts: any[]) {
  await ensureDb();
  for (const alert of alerts) {
    await db.runAsync(
      `INSERT OR REPLACE INTO alerts_cache (id, title, message, location, type, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [alert.id, alert.title, alert.message, alert.location, alert.type, alert.active ? 1 : 0, alert.createdAt]
    );
  }
  await setMeta('last_alerts_sync', new Date().toISOString());
}

export async function getCachedAlerts() {
  await ensureDb();
  return await db.getAllAsync<any>(
    `SELECT * FROM alerts_cache WHERE active = 1 ORDER BY created_at DESC`
  );
}

// ─── RELIEF CAMPS CACHE ───────────────────────────────────────────────────

export async function cacheReliefCamps(camps: any[]) {
  await ensureDb();
  for (const camp of camps) {
    await db.runAsync(
      `INSERT OR REPLACE INTO relief_camps_cache 
       (id, name, location, latitude, longitude, current_occupancy, total_capacity, services, status, wait_time, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [camp.id, camp.name, camp.location, camp.latitude, camp.longitude,
       camp.currentOccupancy, camp.totalCapacity, JSON.stringify(camp.services),
       camp.status, camp.waitTime, camp.updatedAt]
    );
  }
}

export async function getCachedReliefCamps() {
  await ensureDb();
  const rows = await db.getAllAsync<any>(`SELECT * FROM relief_camps_cache WHERE status = 'OPEN'`);
  return rows.map(r => ({ ...r, services: JSON.parse(r.services || '[]') }));
}

// ─── APP META ─────────────────────────────────────────────────────────────

export async function setMeta(key: string, value: string) {
  await ensureDb();
  await db.runAsync(`INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)`, [key, value]);
}

export async function getMeta(key: string) {
  await ensureDb();
  const row = await db.getFirstAsync<{value: string}>(`SELECT value FROM app_meta WHERE key = ?`, [key]);
  return row?.value || null;
}
