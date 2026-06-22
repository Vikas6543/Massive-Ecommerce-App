import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

// store online users → { userId: socketId }
export const onlineUsers = new Map();

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // ✅ Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await UserModel.findById(decoded.id).select("_id name role");

      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = String(socket.user._id);
    console.log(`✅ User connected: ${socket.user.name} (${userId})`);

    // store user socket
    onlineUsers.set(userId, socket.id);

    // join personal room
    socket.join(userId);

    // join role room (admin, seller, user)
    socket.join(socket.user.role);

    // send online status
    socket.emit("connected", {
      message: "Connected to notification service",
      userId,
    });

    // ✅ Mark notification as read
    socket.on("mark_read", async (notificationId) => {
      try {
        const { default: Notification } =
          await import("../models/Notification.js");
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });
        socket.emit("notification_read", { notificationId });
      } catch (error) {
        console.error("Mark read error:", error);
      }
    });

    // ✅ Mark all notifications as read
    socket.on("mark_all_read", async () => {
      try {
        const { default: Notification } =
          await import("../models/Notification.js");
        await Notification.updateMany(
          { recipient: socket.user._id, isRead: false },
          { isRead: true },
        );
        socket.emit("all_notifications_read");
      } catch (error) {
        console.error("Mark all read error:", error);
      }
    });

    // ✅ Disconnect
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      console.log(`❌ User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};
