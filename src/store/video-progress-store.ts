
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VideoProgressState {
  watchedVideos: Set<string>;
  addWatchedVideo: (videoTitle: string) => void;
  resetVideoProgress: () => void;
}

// This store will persist in localStorage to remember watched videos across sessions.
const useVideoProgressStore = create<VideoProgressState>()(
  persist(
    (set) => ({
      watchedVideos: new Set(),
      addWatchedVideo: (videoTitle) =>
        set((state) => ({
          watchedVideos: new Set(state.watchedVideos).add(videoTitle),
        })),
      resetVideoProgress: () => set({ watchedVideos: new Set() }),
    }),
    {
      name: 'video-progress-storage', // name of the item in the storage (must be unique)
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              watchedVideos: new Set(state.watchedVideos),
            },
          };
        },
        setItem: (name, newValue) => {
          const str = JSON.stringify({
            state: {
              ...newValue.state,
              watchedVideos: Array.from(newValue.state.watchedVideos),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export default useVideoProgressStore;
