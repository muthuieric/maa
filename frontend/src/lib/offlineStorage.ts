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
  // Diagnostics from the last sync attempt (populated at sync time).
  last_error?: string;
  last_status?: number;
}

// Result of one sync pass, rich enough to explain WHY anything is stuck.
export interface SyncResult {
  synced: number;
  // Retryable: network blip or server 5xx — will succeed later, keep in queue.
  retryable: number;
  // Permanent: server returned 4xx (validation / consent). It will NEVER accept
  // this exact payload, so we surface it and let the user discard it.
  rejected: { id?: number; status: number; detail: string; narrative: string }[];
  // Human-readable summary of the last network/server error, if any.
  lastError?: string;
}

const DB_NAME = 'NenoGuardDB';
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

// Wipe the entire offline queue (escape hatch for stuck/phantom items).
export async function clearOfflineQueue(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Persist diagnostic fields (last_error / last_status) onto a queued item so the
// UI can explain why it is stuck.
async function updateItemDiagnostics(id: number, last_status: number, last_error: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const item = getReq.result;
        if (item) {
          item.last_status = last_status;
          item.last_error = last_error;
          store.put(item);
        }
        resolve();
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch {
    // diagnostics are best-effort; ignore
  }
}

// Extract a readable message from a failed submit response.
async function readErrorDetail(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === 'string') return body.detail;
    if (Array.isArray(body?.detail)) {
      // Pydantic validation errors: [{type, loc, msg, ...}]
      return body.detail
        .map((d: any) => `${d.loc?.[d.loc.length - 1] ?? 'field'}: ${d.msg}`)
        .join('; ');
    }
    return JSON.stringify(body);
  } catch {
    return `HTTP ${res.status}`;
  }
}

export async function syncOfflineQueue(apiUrl: string = '/api/narratives/submit'): Promise<SyncResult> {
  const items = await getOfflineNarratives();
  let synced = 0;
  let retryable = 0;
  const rejected: SyncResult['rejected'] = [];
  let lastError: string | undefined;

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

      if (res.ok) {
        if (item.id !== undefined) await removeOfflineNarrative(item.id);
        synced++;
        continue;
      }

      const detail = await readErrorDetail(res);

      if (res.status >= 400 && res.status < 500) {
        // Permanent rejection — the server will not accept this payload as-is.
        // Keep it (so no data loss) but flag it so the UI can offer a discard.
        if (item.id !== undefined) {
          await updateItemDiagnostics(item.id, res.status, detail);
        }
        rejected.push({
          id: item.id,
          status: res.status,
          detail,
          narrative: (item.narrative || '').slice(0, 80)
        });
      } else {
        // 5xx — transient server error, worth retrying later.
        retryable++;
        lastError = `Server error (${res.status}): ${detail}`;
        if (item.id !== undefined) {
          await updateItemDiagnostics(item.id, res.status, lastError);
        }
      }
    } catch (e: any) {
      // Network failure — definitely retryable.
      retryable++;
      lastError = e?.message ? `Network error: ${e.message}` : 'Network error';
    }
  }

  return { synced, retryable, rejected, lastError };
}

