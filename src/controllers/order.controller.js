import crypto from "crypto";
import OrderModel from "../models/OrderModel.js";
import CartModel from "../models/CartModel.js";
import ProductModel from "../models/ProductModel.js";
import PaymentModel from "../models/PaymentModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import razorpay from "../config/razorpay.js";
import {
  notifyOrderPlaced,
  notifyPaymentSuccess,
  notifyOrderStatusChanged,
} from "../services/notification.service.js";
import { config } from "../config/env.js";

// ✅ CREATE ORDER + RAZORPAY PAYMENT
export const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, coupon } = req.body;

  // get user cart
  const cart = await CartModel.findOne({ user: req.user._id }).populate(
    "items.product",
  );

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // validate stock and build order items
  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (!product || product.status !== "active") {
      throw new ApiError(
        400,
        `Product ${product?.name} is no longer available`,
      );
    }

    // check stock
    const availableStock =
      product.variants?.length > 0
        ? product.variants.find(
            (v) =>
              v.size === item.variant?.size && v.color === item.variant?.color,
          )?.stock || 0
        : product.stock;

    if (availableStock < item.quantity) {
      throw new ApiError(
        400,
        `Only ${availableStock} units available for ${product.name}`,
      );
    }

    const price =
      product.discountPrice > 0 ? product.discountPrice : product.price;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || "",
      price,
      quantity: item.quantity,
      variant: item.variant,
    });

    subtotal += price * item.quantity;
  }

  // shipping charge logic
  const shippingCharge = subtotal > 999 ? 0 : 99;

  // coupon discount
  let discount = 0;
  let couponData = {};
  if (cart.coupon?.code) {
    discount = cart.coupon.discountAmount;
    couponData = cart.coupon;
  }

  const total = subtotal - discount + shippingCharge;

  // create order in DB
  const order = await OrderModel.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    subtotal,
    discount,
    shippingCharge,
    total,
    coupon: couponData,
    paymentMethod,
    paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
    status: paymentMethod === "cod" ? "confirmed" : "pending",
    tracking: [
      {
        status: "pending",
        message: "Order placed successfully",
      },
    ],
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  // if razorpay — create razorpay order
  let razorpayOrder = null;
  if (paymentMethod === "razorpay") {
    razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // in paise
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        orderId: String(order._id),
        userId: String(req.user._id),
      },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // create payment record
    await PaymentModel.create({
      order: order._id,
      user: req.user._id,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      status: "created",
    });
  }

  // deduct stock
  for (const item of cart.items) {
    const product = await ProductModel.findById(item.product._id);

    if (product.variants?.length > 0) {
      const variantIndex = product.variants.findIndex(
        (v) => v.size === item.variant?.size && v.color === item.variant?.color,
      );
      if (variantIndex > -1) {
        product.variants[variantIndex].stock -= item.quantity;
      }
    } else {
      product.stock -= item.quantity;
    }

    product.sold += item.quantity;
    await product.save();
  }

  // clear cart after order
  cart.items = [];
  cart.coupon = undefined;
  await cart.save();

  // ✅ send notification
  await notifyOrderPlaced(order, req.user._id);

  res.status(201).json(
    new ApiResponse(
      201,
      {
        order,
        razorpayOrder,
        key: config.RAZORPAY_KEY_ID,
      },
      "Order placed successfully",
    ),
  );
});

// ✅ VERIFY RAZORPAY PAYMENT
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  console.log("razorpay_order_id:", razorpay_order_id);
  console.log("razorpay_payment_id:", razorpay_payment_id);
  console.log("razorpay_signature:", razorpay_signature);

  // verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) throw new ApiError(400, "Invalid payment signature");

  // update order
  const order = await OrderModel.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  order.paymentStatus = "paid";
  order.status = "confirmed";
  order.razorpayPaymentId = razorpay_payment_id;
  order.tracking.push({
    status: "confirmed",
    message: "Payment received. Order confirmed.",
  });
  await order.save();

  // update payment record
  await PaymentModel.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "paid",
    },
  );

  // ✅ send notifications
  await notifyPaymentSuccess(order, order.user);
  await notifyOrderStatusChanged(order);

  res
    .status(200)
    .json(new ApiResponse(200, { order }, "Payment verified successfully"));
});

// ✅ GET MY ORDERS
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const query = { user: req.user._id };
  if (status) query.status = status;

  const [orders, total] = await Promise.all([
    OrderModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("items.product", "name images slug"),
    OrderModel.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      "Orders fetched successfully",
    ),
  );
});

// ✅ GET SINGLE ORDER
export const getOrder = asyncHandler(async (req, res) => {
  const order = await OrderModel.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("items.product", "name images slug");

  if (!order) throw new ApiError(404, "Order not found");

  res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});
// ✅ CANCEL ORDER
export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await OrderModel.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!order) throw new ApiError(404, "Order not found");

  // can only cancel if pending or confirmed
  if (!["pending", "confirmed"].includes(order.status)) {
    throw new ApiError(400, `Cannot cancel order in ${order.status} status`);
  }

  // restore stock
  for (const item of order.items) {
    const product = await ProductModel.findById(item.product);
    if (!product) continue;

    if (product.variants?.length > 0) {
      const variantIndex = product.variants.findIndex(
        (v) => v.size === item.variant?.size && v.color === item.variant?.color,
      );
      if (variantIndex > -1) {
        product.variants[variantIndex].stock += item.quantity;
      }
    } else {
      product.stock += item.quantity;
    }

    product.sold -= item.quantity;
    await product.save();
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = reason || "Cancelled by user";
  order.tracking.push({
    status: "cancelled",
    message: reason || "Order cancelled by user",
  });

  await order.save();

  res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled successfully"));
});

// ✅ GET ALL ORDERS - Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const query = {};
  if (status) query.status = status;

  const [orders, total] = await Promise.all([
    OrderModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("user", "name email")
      .populate("items.product", "name images"),
    OrderModel.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      "All orders fetched successfully",
    ),
  );
});

// ✅ UPDATE ORDER STATUS - Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message } = req.body;

  const order = await OrderModel.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  order.status = status;
  order.tracking.push({
    status,
    message: message || `Order ${status}`,
  });

  if (status === "delivered") {
    order.deliveredAt = new Date();
    order.paymentStatus = "paid";
  }

  await order.save();

  res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});
