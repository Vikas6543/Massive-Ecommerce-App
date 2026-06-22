import express from "express";
import {
  placeOrder,
  verifyPayment,
  getMyOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  placeOrderSchema,
  verifyPaymentSchema,
} from "../validations/order.validation.js";

const router = express.Router();

router.use(protect); // All routes below require authentication

// User routes
router.post("/", validate(placeOrderSchema), placeOrder);
router.post("/verify-payment", validate(verifyPaymentSchema), verifyPayment);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrder);
router.put("/:id/cancel", cancelOrder);

// Admin routes
router.get("/", authorizeRoles("admin"), getAllOrders);
router.put("/:id/status", authorizeRoles("admin"), updateOrderStatus);

export default router;
