import Joi from "joi";

export const placeOrderSchema = Joi.object({
  paymentMethod: Joi.string().valid("razorpay", "cod").required().messages({
    "any.required": "Payment method is required",
    "any.only": "Payment method must be razorpay or cod",
  }),
  shippingAddress: Joi.object({
    name: Joi.string().required().messages({
      "any.required": "Recipient name is required",
    }),
    phone: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        "string.pattern.base": "Please enter a valid phone number",
        "any.required": "Phone number is required",
      }),
    addressLine1: Joi.string().required().messages({
      "any.required": "Address Line 1 is required",
    }),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        "string.pattern.base": "Please enter a valid 6-digit pincode",
      }),
    country: Joi.string().default("India"),
  }).required(),
});

export const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
  orderId: Joi.string().hex().length(24).required(),
});
