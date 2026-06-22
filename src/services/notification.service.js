import NotificationModel from "../models/NotificationModel.js";
import { onlineUsers } from "../config/socket.js";

let io;

// ✅ Set io instance (called from server.js)
export const setIO = (ioInstance) => {
  io = ioInstance;
};

// ✅ Create and send notification
export const sendNotification = async ({
  recipientId,
  type,
  title,
  message,
  data = {},
}) => {
  try {
    // save to DB
    const notification = await NotificationModel.create({
      recipient: recipientId,
      type,
      title,
      message,
      data,
    });

    // send real-time if user is online
    if (io) {
      io.to(String(recipientId)).emit("new_notification", {
        _id: notification._id,
        type,
        title,
        message,
        data,
        isRead: false,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (error) {
    console.error("Notification error:", error);
  }
};

// ✅ Notify order placed (to user + admin)
export const notifyOrderPlaced = async (order, userId) => {
  // notify user
  await sendNotification({
    recipientId: userId,
    type: "order_placed",
    title: "Order Placed Successfully! 🎉",
    message: `Your order #${order.orderNumber} has been placed successfully.`,
    data: { orderId: order._id, orderNumber: order.orderNumber },
  });

  // notify admin via room
  if (io) {
    io.to("admin").emit("new_order_alert", {
      message: `New order #${order.orderNumber} received!`,
      orderId: order._id,
      total: order.total,
    });
  }
};

// ✅ Notify order status changed
export const notifyOrderStatusChanged = async (order) => {
  const messages = {
    confirmed: `Your order #${order.orderNumber} has been confirmed! ✅`,
    processing: `Your order #${order.orderNumber} is being processed. 📦`,
    shipped: `Your order #${order.orderNumber} has been shipped! 🚚`,
    delivered: `Your order #${order.orderNumber} has been delivered! 🎉`,
    cancelled: `Your order #${order.orderNumber} has been cancelled.`,
  };

  await sendNotification({
    recipientId: order.user,
    type: `order_${order.status}`,
    title: `Order ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
    message:
      messages[order.status] || `Order status updated to ${order.status}`,
    data: { orderId: order._id, orderNumber: order.orderNumber },
  });
};

// ✅ Notify payment success
export const notifyPaymentSuccess = async (order, userId) => {
  await sendNotification({
    recipientId: userId,
    type: "payment_success",
    title: "Payment Successful! 💳",
    message: `Payment of ₹${order.total} for order #${order.orderNumber} was successful.`,
    data: { orderId: order._id, amount: order.total },
  });
};

// ✅ Notify low stock (to seller)
export const notifyLowStock = async (product, sellerId) => {
  await sendNotification({
    recipientId: sellerId,
    type: "low_stock",
    title: "Low Stock Alert! ⚠️",
    message: `${product.name} has only ${product.stock} units left.`,
    data: { productId: product._id, stock: product.stock },
  });
};
