import express from "express";
import {
  getSellerDashboard,
  getSellerOrders,
  updateSellerOrderStatus,
  getSellerProducts,
} from "../controllers/seller.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect, authorizeRoles("seller", "admin")); // all seller routes are protected and only accessible by sellers and admins

router.get("/dashboard", getSellerDashboard);
router.get("/orders", getSellerOrders);
router.put("/orders/:id/status", updateSellerOrderStatus);
router.get("/products", getSellerProducts);

export default router;
