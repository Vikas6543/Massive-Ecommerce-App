import express from "express";
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getMyProducts,
} from "../controllers/product.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validations/product.validation.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProduct);

// Seller/Admin routes
router.post(
  "/",
  protect,
  authorizeRoles("seller", "admin"),
  upload.array("images", 5),
  validate(createProductSchema),
  createProduct,
);

router.get(
  "/seller/my-products",
  protect,
  authorizeRoles("seller", "admin"),
  getMyProducts,
);
router.put(
  "/:id",
  protect,
  authorizeRoles("seller", "admin"),
  upload.array("images", 5),
  validate(updateProductSchema),
  updateProduct,
);

router.delete(
  "/:id/image",
  protect,
  authorizeRoles("seller", "admin"),
  deleteProductImage,
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("seller", "admin"),
  deleteProduct,
);

export default router;
