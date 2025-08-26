
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VideoProgressState {
  watchedVideos: Set<string>;
  toggleWatchedVideo: (videoTitle: string) => void;
  resetVideoProgress: () => void;
}

// This store will persist in localStorage to remember watched videos across sessions.
const useVideoProgressStore = create<VideoProgressState>()(
  persist(
    (set) => ({
      watchedVideos: new Set(),
      toggleWatchedVideo: (videoTitle) =>
        set((state) => {
          const newSet = new Set(state.watchedVideos);
          if (newSet.has(videoTitle)) {
            newSet.delete(videoTitle);
          } else {
            newSet.add(videoTitle);
          }
          return { watchedVideos: newSet };
        }),
      resetVideoProgress: () => set({ watchedVideos: new Set() }),
    }),
    {
      name: 'video-progress-storage', // name of the item in the storage (must be unique)
      storage: {
        getItem: (name) => {
          // When getting item, we reset the progress as requested
          localStorage.removeItem(name);
          return {
            state: {
              watchedVideos: new Set(),
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
