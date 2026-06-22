import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: true, // since we check order before allowing review
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

// ✅ One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// ✅ Auto update product ratings after review save
reviewSchema.post("save", async function () {
  await updateProductRatings(this.product);
});

// ✅ Auto update product ratings after review delete
reviewSchema.post("deleteOne", { document: true }, async function () {
  await updateProductRatings(this.product);
});

// ✅ Helper to recalculate product ratings
const updateProductRatings = async (productId) => {
  const Product = mongoose.model("Product");

  const result = await mongoose.model("Review").aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      "ratings.average": Math.round(result[0].average * 10) / 10,
      "ratings.count": result[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      "ratings.average": 0,
      "ratings.count": 0,
    });
  }
};

const Review = mongoose.model("Review", reviewSchema);

export default Review;
