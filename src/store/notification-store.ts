// InvestWise - A modern stock trading and investment education platform for young investors

import { create } from 'zustand';
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import { auth } from '@/lib/firebase/config';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  href: string;
  type: 'holdings' | 'content' | 'leaderboard' | 'welcome' | 'default';
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  setNotifications: (notifications: AppNotification[]) => void;
  addNotification: (notification: AppNotification) => void;
  removeNotification: (id: string) => void;
}

const updateNotificationsInFirestore = (notifications: AppNotification[]) => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(getFirestore(), "users", user.uid);
    updateDoc(userDocRef, { notifications }).catch(error => {
        console.error("Failed to update notifications in Firestore:", error);
    });
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    const sortedNotifications = notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    set({ 
      notifications: sortedNotifications, 
      unreadCount: sortedNotifications.filter(n => !n.read).length
    });
  },
  
  addNotification: (notification) => {
    const updatedNotifications = [notification, ...get().notifications];
    set({
      notifications: updatedNotifications,
      unreadCount: updatedNotifications.filter(n => !n.read).length
    });
    updateNotificationsInFirestore(updatedNotifications);
  },

  removeNotification: (id) => {
    const currentNotifications = get().notifications;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    
    set({
      notifications: updatedNotifications,
      unreadCount: updatedNotifications.filter(n => !n.read).length
    });

    updateNotificationsInFirestore(updatedNotifications);
  },
}));
