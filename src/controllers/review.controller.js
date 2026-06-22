import ReviewModel from "../models/ReviewModel.js";
import OrderModel from "../models/OrderModel.js";
import ProductModel from "../models/ProductModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

// ✅ ADD REVIEW
export const addReview = asyncHandler(async (req, res) => {
  const { productId, orderId, rating, title, comment } = req.body;

  // check product exists
  const product = await ProductModel.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  // check user actually ordered this product
  const order = await OrderModel.findOne({
    _id: orderId,
    user: req.user._id,
    status: "delivered",
    "items.product": productId,
  });

  if (!order) {
    throw new ApiError(
      403,
      "You can only review products you have purchased and received",
    );
  }

  // check already reviewed
  const existingReview = await ReviewModel.findOne({
    user: req.user._id,
    product: productId,
  });
  if (existingReview)
    throw new ApiError(400, "You have already reviewed this product");

  const reviewData = {
    user: req.user._id,
    product: productId,
    order: orderId,
    rating: Number(rating),
    title,
    comment,
  };

  // handle review images
  if (req.files && req.files.length > 0) {
    reviewData.images = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));
  }

  const review = await ReviewModel.create(reviewData);
  await review.populate("user", "name avatar");

  res
    .status(201)
    .json(new ApiResponse(201, review, "Review added successfully"));
});

// ✅ GET PRODUCT REVIEWS
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = "recent" } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  let sortOption = { createdAt: -1 };
  if (sort === "highest") sortOption = { rating: -1 };
  if (sort === "lowest") sortOption = { rating: 1 };
  if (sort === "helpful") sortOption = { likes: -1 };

  const [reviews, total] = await Promise.all([
    ReviewModel.find({ product: productId })
      .populate("user", "name avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit)),
    ReviewModel.countDocuments({ product: productId }),
  ]);

  // rating breakdown
  const ratingBreakdown = await ReviewModel.aggregate([
    {
      $match: {
        product: new (await import("mongoose")).default.Types.ObjectId(
          productId,
        ),
      },
    },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        ratingBreakdown,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      "Reviews fetched successfully",
    ),
  );
});

// ✅ UPDATE REVIEW
export const updateReview = asyncHandler(async (req, res) => {
  const review = await ReviewModel.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!review) throw new ApiError(404, "Review not found");

  const { rating, title, comment } = req.body;

  if (rating) review.rating = Number(rating);
  if (title) review.title = title;
  if (comment) review.comment = comment;

  await review.save();

  res
    .status(200)
    .json(new ApiResponse(200, review, "Review updated successfully"));
});

// ✅ DELETE REVIEW
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await ReviewModel.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!review) throw new ApiError(404, "Review not found");

  // delete review images from cloudinary
  for (const img of review.images) {
    await cloudinary.uploader.destroy(img.public_id);
  }

  await review.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Review deleted successfully"));
});

// ✅ LIKE / UNLIKE REVIEW
export const toggleReviewLike = asyncHandler(async (req, res) => {
  const review = await ReviewModel.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  const isLiked = review.likes.includes(req.user._id);

  if (isLiked) {
    review.likes = review.likes.filter(
      (id) => String(id) !== String(req.user._id),
    );
  } else {
    review.likes.push(req.user._id);
  }

  await review.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, null, isLiked ? "Review unliked" : "Review liked"),
    );
});
