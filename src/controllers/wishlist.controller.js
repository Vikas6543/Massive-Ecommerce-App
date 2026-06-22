import WishlistModel from "../models/WishlistModel.js";
import ProductModel from "../models/ProductModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ✅ TOGGLE WISHLIST (add if not there, remove if already there)
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await ProductModel.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  let wishlist = await WishlistModel.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await WishlistModel.create({ user: req.user._id, products: [] });
  }

  const isAlreadyAdded = wishlist.products.includes(productId);

  if (isAlreadyAdded) {
    // remove from wishlist
    wishlist.products = wishlist.products.filter(
      (id) => String(id) !== String(productId),
    );
    await wishlist.save();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Removed from wishlist"));
  } else {
    // add to wishlist
    wishlist.products.push(productId);
    await wishlist.save();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Added to wishlist"));
  }
});

// ✅ GET MY WISHLIST
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await WishlistModel.findOne({ user: req.user._id }).populate(
    "products",
    "name images price discountPrice ratings status slug",
  );

  if (!wishlist) {
    return res
      .status(200)
      .json(new ApiResponse(200, { products: [] }, "Wishlist is empty"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, wishlist, "Wishlist fetched successfully"));
});
