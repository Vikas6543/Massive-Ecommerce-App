import express from "express";
import {
  toggleWishlist,
  getWishlist,
} from "../controllers/wishlist.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect); // all wishlist routes are protected

router.get("/", getWishlist);
router.post("/toggle/:productId", toggleWishlist);

export default router;
