import express from "express";
import {
  searchProducts,
  getSearchFilters,
  getSearchSuggestions,
} from "../controllers/search.controller.js";

const router = express.Router();

router.get("/", searchProducts);
router.get("/filters", getSearchFilters);
router.get("/suggestions", getSearchSuggestions);

export default router;
