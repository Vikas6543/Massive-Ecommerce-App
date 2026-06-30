import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .messages({
      "string.pattern.base": "Please enter a valid Indian phone number",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

export const sendOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  purpose: Joi.string()
    .valid("email-verification", "password-reset", "login")
    .required()
    .messages({
      "any.only": "Invalid OTP purpose",
    }),
});

export const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required().messages({
    "string.length": "OTP must be 6 digits",
    "any.required": "OTP is required",
  }),
  purpose: Joi.string()
    .valid("email-verification", "password-reset", "login")
    .required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
  }),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(3).max(50).optional().messages({
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 50 characters",
  }),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .messages({
      "string.pattern.base": "Please enter a valid Indian phone number",
    }),
  avatar: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.object({
        url: Joi.string().allow(""),
        public_id: Joi.string().allow(""),
      }).unknown(true),
    )
    .optional(),
})
  .or("name", "phone", "avatar")
  .messages({
    "object.missing": "Provide at least one field to update",
  });

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.min": "New password must be at least 6 characters",
    "any.required": "New password is required",
  }),
});
