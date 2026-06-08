import API_BASE_URL from "@/config/apiConfig";
import { Notification } from "@/types/types";

export const getNotifications = async (
  token: string,
): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> => {
  const response = await fetch(`${API_BASE_URL}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

export const markAsRead = async (token: string, id: string): Promise<void> => {
  await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
};
