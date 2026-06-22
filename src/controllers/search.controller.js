import ProductModel from "../models/ProductModel.js";
import CategoryModel from "../models/CategoryModel.js";
import BrandModel from "../models/BrandModel.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// ✅ MAIN SEARCH
export const searchProducts = asyncHandler(async (req, res) => {
  const {
    q, // search query
    category, // category id or slug
    brand, // brand id or slug
    minPrice,
    maxPrice,
    rating, // minimum rating
    sort, // popular, newest, price-low, price-high, rating
    page = 1,
    limit = 12,
    inStock, // true/false
    isFeatured, // true/false
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const query = { status: "active" };

  // ✅ Text search
  if (q) {
    query.$text = { $search: q };
  }

  // ✅ Category filter (by id or slug)
  if (category) {
    const isValidId = category.match(/^[0-9a-fA-F]{24}$/);
    if (isValidId) {
      // find category + all its children
      const categories = await CategoryModel.find({
        $or: [{ _id: category }, { parent: category }],
      }).select("_id");
      query.category = { $in: categories.map((c) => c._id) };
    } else {
      const cat = await CategoryModel.findOne({ slug: category });
      if (cat) {
        const categories = await CategoryModel.find({
          $or: [{ _id: cat._id }, { parent: cat._id }],
        }).select("_id");
        query.category = { $in: categories.map((c) => c._id) };
      }
    }
  }

  // ✅ Brand filter (by id or slug)
  if (brand) {
    const isValidId = brand.match(/^[0-9a-fA-F]{24}$/);
    if (isValidId) {
      query.brand = brand;
    } else {
      const b = await BrandModel.findOne({ slug: brand });
      if (b) query.brand = b._id;
    }
  }

  // ✅ Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // ✅ Rating filter
  if (rating) {
    query["ratings.average"] = { $gte: Number(rating) };
  }

  // ✅ In stock filter
  if (inStock === "true") {
    query.stock = { $gt: 0 };
  }

  // ✅ Featured filter
  if (isFeatured === "true") {
    query.isFeatured = true;
  }

  // ✅ Sort options
  let sortOption = { createdAt: -1 };
  if (sort === "popular") sortOption = { sold: -1 };
  if (sort === "price-low") sortOption = { price: 1 };
  if (sort === "price-high") sortOption = { price: -1 };
  if (sort === "rating") sortOption = { "ratings.average": -1 };
  if (sort === "newest") sortOption = { createdAt: -1 };
  if (q && !sort) sortOption = { score: { $meta: "textScore" } };

  const [products, total] = await Promise.all([
    ProductModel.find(query, q ? { score: { $meta: "textScore" } } : {})
      .populate("category", "name slug")
      .populate("brand", "name slug logo")
      .populate("seller", "name")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .select("-specifications -variants"),
    ProductModel.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      "Search results fetched successfully",
    ),
  );
});

// ✅ GET FILTERS (for sidebar)
export const getSearchFilters = asyncHandler(async (req, res) => {
  const { q, category } = req.query;

  const matchQuery = { status: "active" };
  if (q) matchQuery.$text = { $search: q };

  const [priceRange, brands, ratings, categories] = await Promise.all([
    // price range of results
    ProductModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]),

    // available brands in results
    ProductModel.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$brand", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "brands",
          localField: "_id",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: "$brand" },
      {
        $project: {
          _id: "$brand._id",
          name: "$brand.name",
          slug: "$brand.slug",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]),

    // rating distribution
    ProductModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $floor: "$ratings.average" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]),

    // available categories
    ProductModel.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: "$category._id",
          name: "$category.name",
          slug: "$category.slug",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
        brands,
        ratings,
        categories,
      },
      "Filters fetched successfully",
    ),
  );
});

// ✅ SEARCH SUGGESTIONS (autocomplete)
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.status(200).json(new ApiResponse(200, [], "No suggestions"));
  }

  const suggestions = await ProductModel.find({
    status: "active",
    name: { $regex: q, $options: "i" },
  })
    .select("name slug images price")
    .limit(5);

  res
    .status(200)
    .json(
      new ApiResponse(200, suggestions, "Suggestions fetched successfully"),
    );
});
