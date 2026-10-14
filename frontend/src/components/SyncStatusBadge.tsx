'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { getOfflineNarratives, syncOfflineQueue } from '../lib/offlineStorage';
import { LanguageCode, translations } from '../lib/translations';

interface Props {
  currentLang: LanguageCode;
  onSyncComplete?: () => void;
}

export const SyncStatusBadge: React.FC<Props> = ({ currentLang, onSyncComplete }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  // Ref guards against concurrent syncs without hitting stale-closure traps.
  const syncingRef = useRef<boolean>(false);
  // Keep the latest callback reachable from long-lived listeners/interval.
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
    // Always evaluate live connectivity instead of possibly-stale state,
    // otherwise the `online` event handler exits via the guard below.
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setIsOnline(online);
    if (!online || syncingRef.current) return;
    syncingRef.current = true;
    setIsSyncing(true);
    try {
      await syncOfflineQueue();
      await checkQueue();
      if (onSyncCompleteRef.current) onSyncCompleteRef.current();
    } catch {
      // Keep items queued; the interval will retry while online.
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      handleManualSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Flush any cached items immediately when the page loads while online,
    // otherwise the queue only ever synced after a manual click.
    handleManualSync();

    const interval = setInterval(async () => {
      const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
      setIsOnline(online);
      const pending = await checkQueue();
      // Periodically retry while items remain queued and we are online.
      if (online && pending > 0) {
        handleManualSync();
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-xs">
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

      {queueCount > 0 && (
        <button
          type="button"
          onClick={handleManualSync}
          disabled={!isOnline || isSyncing}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-earth-50 text-earth-800 border border-earth-200 hover:bg-earth-100 disabled:opacity-60 transition-colors font-medium"
          title={`${queueCount} ${t.queueCount} — click to synchronize`}
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{queueCount}</span>
          <span className="hidden lg:inline">{t.queueCount}</span>
        </button>
      )}
    </div>
  );
};

