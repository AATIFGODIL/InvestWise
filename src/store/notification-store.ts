
import { create } from 'zustand';
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import { auth } from '@/lib/firebase/config';

export interface Notification {
  id: string;
  title: string;
  description: string;
  href: string;
  type: 'holdings' | 'content' | 'leaderboard' | 'welcome' | 'default';
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  removeNotification: (id: string) => void;
}

const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    const sortedNotifications = notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    set({ 
      notifications: sortedNotifications, 
      unreadCount: sortedNotifications.filter(n => !n.read).length
    });
  },

  removeNotification: (id) => {
    const user = auth.currentUser;
    if (!user) return;

    const currentNotifications = get().notifications;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    
    // Optimistically update the UI
    set({
      notifications: updatedNotifications,
      unreadCount: updatedNotifications.filter(n => !n.read).length
    });

    // Update Firestore in the background
    const userDocRef = doc(getFirestore(), "users", user.uid);
    updateDoc(userDocRef, {
      notifications: updatedNotifications
    }).catch(error => {
      console.error("Failed to remove notification from Firestore:", error);
      // If the update fails, revert the state
      set({ notifications: currentNotifications, unreadCount: currentNotifications.length });
    });
  },
}));

export default useNotificationStore;
