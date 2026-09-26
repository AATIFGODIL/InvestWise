// InvestWise - A modern stock trading and investment education platform for young investors

import { create } from 'zustand';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

/**
 * Bump when the tours change enough that everyone should see them once more.
 * A tour counts as seen only if it was seen at this version or later — which is
 * how existing users get the new tours exactly once.
 */
export const TOUR_VERSION = 3;

interface TourState {
  /** Tour id → the version it was last seen at. */
  seen: Record<string, number>;
  /** The user `seen` belongs to. Auto-start waits until this is the signed-in user. */
  hydratedFor: string | null;
  /** The tour currently on screen, if any. */
  active: string | null;
  hydrate: (uid: string, seen: Record<string, number>) => void;
  start: (tourId: string) => void;
  /** Close the tour and remember it — whether it was finished or skipped. */
  finish: (tourId: string) => void;
  /** Close without remembering (the user navigated away mid-tour). */
  stop: () => void;
}

const cacheKey = (uid: string) => `iw-tours-${uid}`;

function readCache(uid: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(cacheKey(uid)) || '{}');
  } catch {
    return {};
  }
}

export const useTourStore = create<TourState>((set, get) => ({
  seen: {},
  hydratedFor: null,
  active: null,

  hydrate: (uid, seen) => {
    // Merge with the local cache so a tour finished while the Firestore write
    // was still in flight (or failed) doesn't come back on the next load.
    const cached = readCache(uid);
    const merged: Record<string, number> = { ...seen };
    Object.entries(cached).forEach(([id, v]) => {
      merged[id] = Math.max(merged[id] ?? 0, v);
    });
    set({ seen: merged, hydratedFor: uid });
  },

  start: (tourId) => set({ active: tourId }),

  stop: () => set({ active: null }),

  finish: (tourId) => {
    const seen = { ...get().seen, [tourId]: TOUR_VERSION };
    set({ seen, active: null });

    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      localStorage.setItem(cacheKey(uid), JSON.stringify(seen));
    } catch {
      // Storage can be unavailable (private mode); Firestore is the record.
    }
    updateDoc(doc(db, 'users', uid), { [`toursSeen.${tourId}`]: TOUR_VERSION }).catch((error) => {
      console.error('Failed to save tour progress:', error);
    });
  },
}));
