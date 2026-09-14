/**
 * Persisted experiment history.
 *
 * The Overview page reads from this hook so the dashboard reflects real
 * activity from the current browser session. Storage is capped at 50 entries
 * (LRU eviction on write). Server-side rendering returns an empty list so
 * the UI hydrates without mismatch.
 */
'use client';

import * as React from 'react';

const STORAGE_KEY = 'hurstify:history';
const MAX_ENTRIES = 50;

export type ExperimentEntry =
  | {
      kind: 'estimate';
      id: string;
      at: number;
      model: string;
      trueH: number;
      H: number;
      bias: number;
      rmse: number;
      significant: boolean | null;
    }
  | {
      kind: 'sweep';
      id: string;
      at: number;
      optimizer: string;
      windowSize: number;
      trueH: number;
      rmse: number;
      failRate: number;
    }
  | {
      kind: 'figure';
      id: string;
      at: number;
      figure: string;
    };

function readStorage(): ExperimentEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ExperimentEntry[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(entries: ExperimentEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries.slice(0, MAX_ENTRIES)),
    );
  } catch {
    // ignore (private mode, quota exceeded)
  }
}

const subscribers = new Set<(entries: ExperimentEntry[]) => void>();
let cache: ExperimentEntry[] | null = null;
let primed = false;

function ensurePrimed() {
  if (primed) return;
  primed = true;
  cache = readStorage();
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        cache = readStorage();
        subscribers.forEach((cb) => cb(cache ?? []));
      }
    });
  }
}

function notify() {
  subscribers.forEach((cb) => cb(cache ?? []));
}

/**
 * Subscribe to the persisted experiment history.
 * Returns a stable, sorted-by-most-recent list.
 *
 * The initial state is always `[]` (matching SSR) — localStorage is read
 * inside `useEffect` so the first client render matches the server, and
 * we avoid hydration mismatches. The flag `ready` flips to `true` once
 * the storage has been primed so views can defer reading `entries` until
 * after hydration.
 */
export function useExperimentHistory(): {
  entries: ExperimentEntry[];
  ready: boolean;
  record: (entry: ExperimentEntry) => void;
  clear: () => void;
} {
  const [entries, setEntries] = React.useState<ExperimentEntry[]>([]);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    ensurePrimed();
    const cb = (next: ExperimentEntry[]) => setEntries(next);
    subscribers.add(cb);
    // Sync from localStorage. We always do this — even if `cache` was
    // primed by another hook on the same page — so this hook is safe to
    // call from multiple components.
    const fresh = readStorage();
    if (JSON.stringify(fresh) !== JSON.stringify(cache ?? [])) {
      cache = fresh;
      notify();
    } else if (cache && cache !== fresh) {
      // Make sure React state is in sync if cache was populated externally.
      setEntries(cache);
    }
    setEntries(cache ?? []);
    setReady(true);
    return () => {
      subscribers.delete(cb);
    };
  }, []);

  const record = React.useCallback((entry: ExperimentEntry) => {
    cache = [entry, ...(cache ?? [])].slice(0, MAX_ENTRIES);
    writeStorage(cache);
    notify();
  }, []);

  const clear = React.useCallback(() => {
    cache = [];
    writeStorage([]);
    notify();
  }, []);

  return {entries, ready, record, clear};
}

/** Generate a stable id without requiring crypto.randomUUID at call time. */
export function nextId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
