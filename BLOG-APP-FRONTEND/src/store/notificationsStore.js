import { create } from "zustand";
import axios from "axios";

export const useNotifications = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/user-api/notifications`, { withCredentials: true });
      if (res.status === 200) {
        const list = res.data.payload || [];
        const unread = list.filter((n) => !n.isRead).length;
        set({ notifications: list, unreadCount: unread, loading: false });
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      set({ loading: false, error: err.response?.data?.message || "Failed to load notifications" });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/user-api/notifications/unread-count`, { withCredentials: true });
      if (res.status === 200) {
        set({ unreadCount: res.data.payload || 0 });
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  },

  markAsRead: async (id) => {
    const prevNotifications = [...get().notifications];
    const prevUnread = get().unreadCount;

    // Optimistic UI Update
    const updated = prevNotifications.map((n) => 
      n._id === id ? { ...n, isRead: true } : n
    );
    set({
      notifications: updated,
      unreadCount: Math.max(0, prevUnread - 1)
    });

    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/user-api/notifications/${id}/read`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      // Rollback
      set({ notifications: prevNotifications, unreadCount: prevUnread });
    }
  },

  markAllAsRead: async () => {
    const prevNotifications = [...get().notifications];
    const prevUnread = get().unreadCount;

    // Optimistic UI Update
    const updated = prevNotifications.map((n) => ({ ...n, isRead: true }));
    set({ notifications: updated, unreadCount: 0 });

    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/user-api/notifications/read-all`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      // Rollback
      set({ notifications: prevNotifications, unreadCount: prevUnread });
    }
  },

  deleteNotification: async (id) => {
    const prevNotifications = [...get().notifications];
    const prevUnread = get().unreadCount;
    const deletedNotification = prevNotifications.find((n) => n._id === id);

    // Optimistic UI Update
    const updated = prevNotifications.filter((n) => n._id !== id);
    const wasUnread = deletedNotification && !deletedNotification.isRead;
    set({
      notifications: updated,
      unreadCount: wasUnread ? Math.max(0, prevUnread - 1) : prevUnread
    });

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/user-api/notifications/${id}`, { withCredentials: true });
    } catch (err) {
      console.error("Failed to delete notification:", err);
      // Rollback
      set({ notifications: prevNotifications, unreadCount: prevUnread });
    }
  }
}));
