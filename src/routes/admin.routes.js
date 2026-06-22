import express from "express";
import {
  getAdminDashboard,
  getAllUsers,
  getUser,
  toggleUserBan,
  updateUserRole,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  toggleFeaturedProduct,
  deleteProduct,
} from "../controllers/admin.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// all routes admin only
router.use(protect, authorizeRoles("admin"));

// dashboard
router.get("/dashboard", getAdminDashboard);

// users
router.get("/users", getAllUsers);
router.get("/users/:id", getUser);
router.put("/users/:id/ban", toggleUserBan);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// orders
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

// products
router.put("/products/:id/feature", toggleFeaturedProduct);
router.delete("/products/:id", deleteProduct);

export default router;
