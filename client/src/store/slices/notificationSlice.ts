import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// TYPES
interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "order" | "product" | "system" | "promotion";
  isRead: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
}

// INITIAL STATE
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isOpen: false,
};

// SLICE
const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
    },

    addNotification: (state, action: PayloadAction<Notification>) => {
      // Add new notification at the top
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n._id === action.payload,
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach((n) => (n.isRead = true));
      state.unreadCount = 0;
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n._id === action.payload,
      );
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(
        (n) => n._id !== action.payload,
      );
    },

    toggleNotificationPanel: (state) => {
      state.isOpen = !state.isOpen;
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.isOpen = false;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  toggleNotificationPanel,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
