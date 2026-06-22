import CouponModel from "../models/CouponModel.js";
import CartModel from "../models/CartModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ✅ CREATE COUPON (Admin)
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    usageLimit,
    perUserLimit,
    expiresAt,
  } = req.body;

  const existing = await CouponModel.findOne({ code: code.toUpperCase() });
  if (existing) throw new ApiError(400, "Coupon code already exists");

  const coupon = await CouponModel.create({
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    usageLimit,
    perUserLimit,
    expiresAt,
  });

  res
    .status(201)
    .json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

// ✅ GET ALL COUPONS (Admin)
export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await CouponModel.find().sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, coupons, "Coupons fetched successfully"));
});

// ✅ APPLY COUPON TO CART
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const coupon = await CouponModel.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) throw new ApiError(404, "Invalid coupon code");

  // check expiry
  if (new Date() > coupon.expiresAt) {
    throw new ApiError(400, "Coupon has expired");
  }

  // check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "Coupon usage limit reached");
  }

  // check per user limit
  const userUsageCount = coupon.usedBy.filter(
    (u) => String(u.user) === String(req.user._id),
  ).length;

  if (userUsageCount >= coupon.perUserLimit) {
    throw new ApiError(400, "You have already used this coupon");
  }

  // get cart
  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // check min order amount
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  if (subtotal < coupon.minOrderAmount) {
    throw new ApiError(
      400,
      `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
    );
  }

  // calculate discount
  let discountAmount = 0;

  if (coupon.discountType === "percentage") {
    discountAmount = (cart.subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  // apply to cart
  cart.coupon = {
    code: coupon.code,
    discountAmount: Math.round(discountAmount),
  };
  await cart.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        discountAmount: Math.round(discountAmount),
        coupon: coupon.code,
        subtotal,
        total: subtotal - Math.round(discountAmount),
      },
      `Coupon applied! You save ₹${Math.round(discountAmount)}`,
    ),
  );
});

// ✅ REMOVE COUPON FROM CART
export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.coupon = undefined;
  await cart.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Coupon removed successfully"));
});

// ✅ DELETE COUPON (Admin)
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await CouponModel.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  await coupon.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Coupon deleted successfully"));
});
