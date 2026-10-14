'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, Trash2, X } from 'lucide-react';
import {
  getOfflineNarratives,
  syncOfflineQueue,
  clearOfflineQueue,
  SyncResult
} from '../lib/offlineStorage';
import { LanguageCode, translations } from '../lib/translations';

interface Props {
  currentLang: LanguageCode;
  onSyncComplete?: () => void;
}

export const SyncStatusBadge: React.FC<Props> = ({ currentLang, onSyncComplete }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  // Populated when the server permanently rejects (4xx) queued items.
  const [rejected, setRejected] = useState<SyncResult['rejected']>([]);
  // Transient (network / 5xx) error message, if the last sync couldn't reach the server.
  const [lastError, setLastError] = useState<string | undefined>(undefined);
  const [showPanel, setShowPanel] = useState<boolean>(false);

  const syncingRef = useRef<boolean>(false);
  const onSyncCompleteRef = useRef(onSyncComplete);
  onSyncCompleteRef.current = onSyncComplete;
  const t = translations[currentLang];

  const checkQueue = async (): Promise<number> => {
    try {
      const items = await getOfflineNarratives();
      setQueueCount(items.length);
      return items.length;
    } catch {
      setQueueCount(0);
      return 0;
    }
  };

  const handleManualSync = async () => {
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setIsOnline(online);
    if (!online || syncingRef.current) return;
    syncingRef.current = true;
    setIsSyncing(true);
    try {
      const result = await syncOfflineQueue();
      setRejected(result.rejected);
      setLastError(result.rejected.length > 0 ? undefined : result.lastError);
      // Open the panel automatically when something is permanently stuck,
      // so the user finally sees WHY the count is not dropping.
      if (result.rejected.length > 0) setShowPanel(true);
      await checkQueue();
      if (onSyncCompleteRef.current) onSyncCompleteRef.current();
    } catch (e: any) {
      setLastError(e?.message || 'Unexpected sync error');
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  };

  const handleDiscardAll = async () => {
    await clearOfflineQueue();
    setRejected([]);
    setLastError(undefined);
    setShowPanel(false);
    await checkQueue();
    if (onSyncCompleteRef.current) onSyncCompleteRef.current();
  };

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      handleManualSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Flush cached items immediately when the page loads while online.
    handleManualSync();

    const interval = setInterval(async () => {
      const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
      setIsOnline(online);
      const pending = await checkQueue();
      if (online && pending > 0) handleManualSync();
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const hasIssue = rejected.length > 0 || !!lastError;

  return (
    <div className="relative flex items-center gap-1.5 text-xs">
      {/* Connectivity status */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full font-medium border ${
          isOnline
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}
        title={isOnline ? t.statusOnline : t.statusOffline}
      >
        {isOnline ? (
          <Wifi className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
        )}
        <span className="sr-only">{isOnline ? t.statusOnline : t.statusOffline}</span>
        <span className="hidden lg:inline" aria-hidden="true">{isOnline ? t.statusOnline : t.statusOffline}</span>
      </div>

      {/* Queue / issue button */}
      {queueCount > 0 && (
        <button
          type="button"
          onClick={() => (hasIssue ? setShowPanel((s) => !s) : handleManualSync())}
          disabled={!isOnline || isSyncing}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full border font-medium transition-colors disabled:opacity-60 ${
            hasIssue
              ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
              : 'bg-earth-50 text-earth-800 border-earth-200 hover:bg-earth-100'
          }`}
          title={
            hasIssue
              ? `${queueCount} item(s) could not sync — click for details`
              : `${queueCount} ${t.queueCount} — click to synchronize`
          }
        >
          {hasIssue ? (
            <AlertTriangle className="w-3 h-3 text-rose-600" aria-hidden="true" />
          ) : (
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
          )}
          <span>{queueCount}</span>
          <span className="hidden lg:inline">{hasIssue ? 'stuck' : t.queueCount}</span>
        </button>
      )}

      {/* Details panel — explains WHY items are stuck and lets you clear them */}
      {showPanel && queueCount > 0 && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">Offline queue ({queueCount})</span>
            <button
              type="button"
              onClick={() => setShowPanel(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {lastError && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
              {lastError}
            </p>
          )}

          {rejected.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-600">
                {rejected.length} item(s) were rejected by the server and will not sync as-is:
              </p>
              {rejected.map((r, i) => (
                <div key={i} className="text-xs bg-rose-50 border border-rose-200 rounded-lg p-2">
                  <div className="font-mono text-[10px] text-rose-500">HTTP {r.status}</div>
                  <div className="text-rose-800">{r.detail}</div>
                  {r.narrative && (
                    <div className="text-slate-500 italic mt-1 truncate">"{r.narrative}"</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {isOnline && !isSyncing && (
              <button
                type="button"
                onClick={handleManualSync}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-savanna-800 hover:bg-savanna-900 text-white rounded-lg text-xs font-semibold"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            )}
            <button
              type="button"
              onClick={handleDiscardAll}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
            >
              <Trash2 className="w-3 h-3" /> Discard all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
