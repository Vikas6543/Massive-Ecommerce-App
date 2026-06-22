import express from "express";
import {
  createCoupon,
  getAllCoupons,
  applyCoupon,
  removeCoupon,
  deleteCoupon,
} from "../controllers/coupon.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createCouponSchema } from "../validations/coupon.validation.js";

const router = express.Router();

router.post("/apply", protect, applyCoupon);
router.delete("/remove", protect, removeCoupon);

router.use(protect, authorizeRoles("admin")); // all coupon routes below are protected and only accessible by admins
router.post("/", validate(createCouponSchema), createCoupon);
router.get("/", getAllCoupons);
router.delete("/:id", deleteCoupon);

export default router;
