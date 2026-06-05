import { Response } from "express";
import Notification from "../models/notificationModel.js";
import { AuthRequest } from "../types/model.types.js";

const getNotifications = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user?.id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      userId: req.user?.id,
      isRead: false,
    });

    res.status(200).json({ notifications, unreadCount });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ message: "Marked as read." });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

export { getNotifications, markAsRead };
