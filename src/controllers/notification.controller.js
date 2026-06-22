import NotificationModel from "../models/NotificationModel.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ✅ GET MY NOTIFICATIONS
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    NotificationModel.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    NotificationModel.countDocuments({ recipient: req.user._id }),
    NotificationModel.countDocuments({
      recipient: req.user._id,
      isRead: false,
    }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        unreadCount,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      "Notifications fetched successfully",
    ),
  );
});

// ✅ MARK AS READ
export const markAsRead = asyncHandler(async (req, res) => {
  await NotificationModel.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
  );

  res
    .status(200)
    .json(new ApiResponse(200, null, "Notification marked as read"));
});

// ✅ MARK ALL AS READ
export const markAllAsRead = asyncHandler(async (req, res) => {
  await NotificationModel.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true },
  );

  res
    .status(200)
    .json(new ApiResponse(200, null, "All notifications marked as read"));
});

// ✅ DELETE NOTIFICATION
export const deleteNotification = asyncHandler(async (req, res) => {
  await NotificationModel.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, null, "Notification deleted"));
});
