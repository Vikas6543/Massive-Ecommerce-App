import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).required().messages({
    "any.required": "Product name is required",
  }),
  description: Joi.string().min(10).required().messages({
    "any.required": "Description is required",
    "string.min": "Description must be at least 10 characters",
  }),
  price: Joi.number().min(0).required().messages({
    "any.required": "Price is required",
    "number.min": "Price cannot be negative",
  }),
  discountPrice: Joi.number().min(0).optional(),
  category: Joi.string().hex().length(24).required().messages({
    "any.required": "Category is required",
  }),
  brand: Joi.string().hex().length(24).optional(),
  stock: Joi.number().min(0).optional(),
  status: Joi.string().valid("draft", "active", "inactive").optional(),
  variants: Joi.alternatives().try(Joi.string(), Joi.array()).optional(),
  specifications: Joi.alternatives().try(Joi.string(), Joi.array()).optional(),
  tags: Joi.alternatives().try(Joi.string(), Joi.array()).optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).optional(),
  price: Joi.number().min(0).optional(),
  discountPrice: Joi.number().min(0).optional(),
  category: Joi.string().hex().length(24).optional(),
  brand: Joi.string().hex().length(24).optional(),
  stock: Joi.number().min(0).optional(),
  status: Joi.string()
    .valid("draft", "active", "inactive", "out-of-stock")
    .optional(),
  variants: Joi.alternatives().try(Joi.string(), Joi.array()).optional(),
  specifications: Joi.alternatives().try(Joi.string(), Joi.array()).optional(),
  tags: Joi.alternatives().try(Joi.string(), Joi.array()).optional(),
  isFeatured: Joi.boolean().optional(),
});
