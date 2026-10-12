export interface QueuedNarrative {
  id?: number;
  narrative: string;
  language: string;
  age_band: string;
  gender: string;
  sub_county: string;
  source_org: string;
  label: string;
  consent_given: boolean;
  queued_at: string;
}

const DB_NAME = 'OukHarmfulPracticeDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_narratives';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineNarrative(data: Omit<QueuedNarrative, 'id' | 'queued_at'>): Promise<number> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const item: QueuedNarrative = {
      ...data,
      queued_at: new Date().toISOString()
    };
    const req = store.add(item);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function getOfflineNarratives(): Promise<QueuedNarrative[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    return [];
  }
}

export async function removeOfflineNarrative(id: number): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function syncOfflineQueue(apiUrl: string = '/api/narratives/submit'): Promise<{ synced: number; failed: number }> {
  const items = await getOfflineNarratives();
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrative: item.narrative,
          language: item.language,
          age_band: item.age_band,
          gender: item.gender,
          sub_county: item.sub_county,
          source_org: item.source_org,
          label: item.label,
          consent_given: item.consent_given
        })
      });

      if (res.ok && item.id !== undefined) {
        await removeOfflineNarrative(item.id);
        synced++;
      } else {
        failed++;
      }
    } catch (e) {
      failed++;
    }
  }

  return { synced, failed };
}

