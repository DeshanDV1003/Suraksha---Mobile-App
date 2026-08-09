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
      await seedEmergencyNumbers();
      await seedFirstAid();
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

    -- Emergency contact numbers (pre-seeded, updated when online)
    CREATE TABLE IF NOT EXISTS emergency_numbers_cache (
      id       TEXT PRIMARY KEY,
      label    TEXT NOT NULL,
      number   TEXT NOT NULL,
      category TEXT
    );

    -- First aid quick reference (pre-seeded)
    CREATE TABLE IF NOT EXISTS first_aid_cache (
      id       TEXT PRIMARY KEY,
      title    TEXT NOT NULL,
      steps    TEXT NOT NULL,
      category TEXT
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

// ─── EMERGENCY NUMBERS ────────────────────────────────────────────────────

const EMERGENCY_NUMBERS_SEED = [
  { id: 'e1', label: 'National Emergency', number: '119', category: 'emergency' },
  { id: 'e2', label: 'Disaster Management Centre', number: '117', category: 'disaster' },
  { id: 'e3', label: 'Police Emergency', number: '118', category: 'police' },
  { id: 'e4', label: 'Fire & Rescue', number: '110', category: 'fire' },
  { id: 'e5', label: 'Ambulance', number: '1990', category: 'medical' },
  { id: 'e6', label: 'Red Cross Sri Lanka', number: '+94 11 269 5452', category: 'humanitarian' },
  { id: 'e7', label: 'Suwa Seriya Ambulance', number: '1990', category: 'medical' },
];

export async function seedEmergencyNumbers() {
  await ensureDb();
  const existing = await db.getFirstAsync<{count: number}>(`SELECT COUNT(*) as count FROM emergency_numbers_cache`);
  if ((existing?.count || 0) > 0) return;
  for (const n of EMERGENCY_NUMBERS_SEED) {
    await db.runAsync(
      `INSERT OR IGNORE INTO emergency_numbers_cache (id, label, number, category) VALUES (?, ?, ?, ?)`,
      [n.id, n.label, n.number, n.category]
    );
  }
}

export async function getEmergencyNumbers() {
  await ensureDb();
  return await db.getAllAsync<any>(`SELECT * FROM emergency_numbers_cache ORDER BY category`);
}

// ─── FIRST AID ────────────────────────────────────────────────────────────

const FIRST_AID_SEED = [
  {
    id: 'fa1', category: 'flood', title: 'Flood Evacuation',
    steps: JSON.stringify([
      'Move to higher ground immediately.',
      'Do not walk through flowing water — 15 cm can knock you down.',
      'If trapped, signal from the roof; do not enter attic if rising.',
      'Avoid contact with floodwater — it may be contaminated.',
      'Turn off electricity at the breaker if safe to do so.',
    ])
  },
  {
    id: 'fa2', category: 'medical', title: 'Drowning First Aid',
    steps: JSON.stringify([
      'Remove the person from water safely.',
      'Check responsiveness and call for help.',
      'If not breathing, start CPR: 30 chest compressions, 2 rescue breaths.',
      'Continue until breathing resumes or help arrives.',
      'Keep the person warm and still.',
    ])
  },
  {
    id: 'fa3', category: 'medical', title: 'Wound / Bleeding',
    steps: JSON.stringify([
      'Apply firm pressure with a clean cloth for at least 10 minutes.',
      'Do not remove the cloth — add more on top if soaked.',
      'Elevate the injured limb above heart level if possible.',
      'Cover with a clean bandage.',
      'Seek medical help if bleeding does not stop.',
    ])
  },
  {
    id: 'fa4', category: 'medical', title: 'Dehydration / Heat Stroke',
    steps: JSON.stringify([
      'Move the person to a cool, shaded area.',
      'Give small sips of water — do not force if unconscious.',
      'Apply cool wet cloths to neck, armpits, and groin.',
      'Fan the person to reduce body temperature.',
      'Call for medical help for severe cases.',
    ])
  },
  {
    id: 'fa5', category: 'disaster', title: 'Earthquake — If Indoors',
    steps: JSON.stringify([
      'Drop, cover, and hold on under a sturdy table or against interior wall.',
      'Stay away from windows, exterior walls, and heavy objects.',
      'Do not run outside during shaking.',
      'After shaking stops, evacuate calmly using stairs, not lifts.',
      'Check for gas leaks and injuries before anything else.',
    ])
  },
  {
    id: 'fa6', category: 'medical', title: 'Fracture / Broken Bone',
    steps: JSON.stringify([
      'Do not try to straighten the bone.',
      'Immobilise the area with a splint or rolled clothing.',
      'Apply ice wrapped in cloth to reduce swelling.',
      'Keep the person still and warm.',
      'Seek medical attention immediately.',
    ])
  },
];

export async function seedFirstAid() {
  await ensureDb();
  const existing = await db.getFirstAsync<{count: number}>(`SELECT COUNT(*) as count FROM first_aid_cache`);
  if ((existing?.count || 0) > 0) return;
  for (const f of FIRST_AID_SEED) {
    await db.runAsync(
      `INSERT OR IGNORE INTO first_aid_cache (id, title, steps, category) VALUES (?, ?, ?, ?)`,
      [f.id, f.title, f.steps, f.category]
    );
  }
}

export async function getFirstAidGuides() {
  await ensureDb();
  const rows = await db.getAllAsync<any>(`SELECT * FROM first_aid_cache ORDER BY category`);
  return rows.map(r => ({ ...r, steps: JSON.parse(r.steps || '[]') }));
}
