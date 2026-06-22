import express from "express";
import {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
  toggleReviewLike,
} from "../controllers/review.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/:productId", getProductReviews);
router.post("/", protect, upload.array("images", 3), addReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.post("/:id/like", protect, toggleReviewLike);

export default router;
