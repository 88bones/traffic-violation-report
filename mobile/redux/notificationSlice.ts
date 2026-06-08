import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "@/types/types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (
      state,
      action: PayloadAction<{
        notifications: Notification[];
        unreadCount: number;
      }>,
    ) => {
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const n = state.notifications.find((n) => n._id === action.payload);
      if (n) {
        n.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
});

export const { setNotifications, markNotificationRead } =
  notificationSlice.actions;
export default notificationSlice.reducer;
