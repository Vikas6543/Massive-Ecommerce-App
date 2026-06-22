import Joi from "joi";

export const createCouponSchema = Joi.object({
  code: Joi.string().min(3).max(20).uppercase().required().messages({
    "any.required": "Coupon code is required",
  }),
  description: Joi.string().optional(),
  discountType: Joi.string().valid("percentage", "flat").required().messages({
    "any.required": "Discount type is required",
    "any.only": "Discount type must be percentage or flat",
  }),
  discountValue: Joi.number().min(1).required().messages({
    "any.required": "Discount value is required",
  }),
  minOrderAmount: Joi.number().min(0).optional(),
  maxDiscount: Joi.number().min(0).optional(),
  usageLimit: Joi.number().min(1).optional(),
  perUserLimit: Joi.number().min(1).optional(),
  expiresAt: Joi.date().greater("now").required().messages({
    "any.required": "Expiry date is required",
    "date.greater": "Expiry date must be in the future",
  }),
});
