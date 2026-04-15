import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'sale' | 'stock' | 'insight';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  add: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAllRead: () => void;
  clear: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  add: (n) =>
    set((s) => ({
      notifications: [
        { ...n, id: crypto.randomUUID(), timestamp: new Date(), read: false },
        ...s.notifications,
      ].slice(0, 50), // keep max 50
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
  clear: () => set({ notifications: [] }),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
