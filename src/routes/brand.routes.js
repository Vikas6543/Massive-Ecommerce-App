import express from "express";
import {
  createBrand,
  getAllBrands,
  getBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/", getAllBrands);
router.get("/:id", getBrand);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  upload.single("logo"),
  createBrand,
);
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  upload.single("logo"),
  updateBrand,
);
router.delete("/:id", protect, authorizeRoles("admin"), deleteBrand);

export default router;
