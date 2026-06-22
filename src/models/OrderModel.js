import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String, // snapshot
  image: String, // snapshot
  price: Number, // snapshot at time of order
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  variant: {
    size: String,
    color: String,
    sku: String,
  },
});

const orderSchema = new mongoose.Schema(
  {
    // ✅ Order reference
    orderNumber: {
      type: String,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ Items
    items: [orderItemSchema],

    // ✅ Shipping address snapshot
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "India" },
    },

    // ✅ Pricing
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // ✅ Coupon
    coupon: {
      code: String,
      discountAmount: { type: Number, default: 0 },
    },

    // ✅ Payment
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,

    // ✅ Order Status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },

    // ✅ Tracking
    tracking: [
      {
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // ✅ Delivery
    estimatedDelivery: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
  },
  { timestamps: true },
);

// ✅ Auto generate order number before saving
orderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORDER-${count + 1}-${Date.now()}`;
  }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
