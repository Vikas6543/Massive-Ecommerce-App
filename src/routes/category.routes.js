import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategory);

// Admin only routes
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  upload.single("image"),
  createCategory,
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  upload.single("image"),
  updateCategory,
);

router.delete("/:id", protect, authorizeRoles("admin"), deleteCategory);

export default router;
