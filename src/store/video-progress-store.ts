
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface VideoProgressState {
  watchedVideos: Set<string>;
  markVideoAsWatched: (videoTitle: string) => void;
  resetVideoProgress: () => void;
}

// This store will persist in localStorage to remember watched videos across sessions.
const useVideoProgressStore = create<VideoProgressState>()(
  persist(
    (set) => ({
      watchedVideos: new Set(),
      markVideoAsWatched: (videoTitle) =>
        set((state) => {
          const newSet = new Set(state.watchedVideos);
          if (!newSet.has(videoTitle)) {
            newSet.add(videoTitle);
          }
          return { watchedVideos: newSet };
        }),
      resetVideoProgress: () => set({ watchedVideos: new Set() }),
    }),
    {
      name: 'video-progress-storage', 
      storage: createJSONStorage(() => localStorage, {
        replacer: (key, value) => {
          if (value instanceof Set) {
            return {
              _type: 'set',
              value: Array.from(value),
            };
          }
          return value;
        },
        reviver: (key, value) => {
          if (typeof value === 'object' && value !== null && value._type === 'set') {
            return new Set(value.value);
          }
          return value;
        },
      }),
    }
  )
);

export default useVideoProgressStore;
