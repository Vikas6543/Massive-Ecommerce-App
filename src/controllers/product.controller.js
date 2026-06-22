import ProductModal from "../models/ProductModel.js";
import CategoryModal from "../models/CategoryModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

// ✅ CREATE PRODUCT (Seller/Admin)
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    discountPrice,
    category,
    brand,
    stock,
    variants,
    specifications,
    tags,
    status,
  } = req.body;

  // validate category exists
  const categoryExists = await CategoryModal.findById(category);
  if (!categoryExists) throw new ApiError(400, "Invalid category");

  const productData = {
    name,
    description,
    price,
    discountPrice: discountPrice || 0,
    category,
    brand: brand || undefined,
    stock: stock || 0,
    seller: req.user._id,
    status: status || "draft",
  };

  // parse JSON fields (sent as strings in form-data)
  if (variants) {
    productData.variants =
      typeof variants === "string" ? JSON.parse(variants) : variants;
  }
  if (specifications) {
    productData.specifications =
      typeof specifications === "string"
        ? JSON.parse(specifications)
        : specifications;
  }
  if (tags) {
    productData.tags = typeof tags === "string" ? JSON.parse(tags) : tags;
  }

  // handle multiple image uploads
  if (req.files && req.files.length > 0) {
    productData.images = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));
  }

  const product = await ProductModal.create(productData);

  res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

// ✅ GET ALL PRODUCTS (with filters, search, pagination)
export const getAllProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    brand,
    minPrice,
    maxPrice,
    search,
    sort,
    status = "active",
  } = req.query;

  const query = { status };

  // ObjectId
  if (category) query.category = category;
  if (brand) query.brand = brand;

  // price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // search by text
  if (search) {
    query.$text = { $search: search };
  }

  // sorting
  let sortOption = { createdAt: -1 }; // default: newest first
  if (sort === "price-low") sortOption = { price: 1 };
  if (sort === "price-high") sortOption = { price: -1 };
  if (sort === "rating") sortOption = { "ratings.average": -1 };
  if (sort === "popular") sortOption = { sold: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    ProductModal.find(query)
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .populate("seller", "name")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit)),
    ProductModal.countDocuments(query),
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
      "Products fetched successfully",
    ),
  );
});

// ✅ GET SINGLE PRODUCT (by slug or id)
export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // check if it's a valid mongo ID, else search by slug
  const isValidId = id.match(/^[0-9a-fA-F]{24}$/);

  const query = isValidId ? { _id: id } : { slug: id };

  const product = await ProductModal.findOne(query)
    .populate("category", "name slug")
    .populate("brand", "name slug logo")
    .populate("seller", "name email");

  if (!product) throw new ApiError(404, "Product not found");

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

// ✅ UPDATE PRODUCT (Seller who owns it / Admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await ProductModal.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  // check ownership (unless admin)
  if (
    req.user.role !== "admin" &&
    String(product.seller) !== String(req.user._id)
  ) {
    throw new ApiError(403, "You can only update your own products");
  }

  const {
    name,
    description,
    price,
    discountPrice,
    category,
    brand,
    stock,
    variants,
    specifications,
    tags,
    status,
    isFeatured,
  } = req.body;

  if (name) product.name = name;
  if (description) product.description = description;
  if (price !== undefined) product.price = price;
  if (discountPrice !== undefined) product.discountPrice = discountPrice;
  if (category) product.category = category;
  if (brand) product.brand = brand;
  if (stock !== undefined) product.stock = stock;
  if (status) product.status = status;
  if (isFeatured !== undefined && req.user.role === "admin")
    product.isFeatured = isFeatured;

  if (variants) {
    product.variants =
      typeof variants === "string" ? JSON.parse(variants) : variants;
  }
  if (specifications) {
    product.specifications =
      typeof specifications === "string"
        ? JSON.parse(specifications)
        : specifications;
  }
  if (tags) {
    product.tags = typeof tags === "string" ? JSON.parse(tags) : tags;
  }

  // add new images (append, don't replace)
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));
    product.images.push(...newImages);
  }

  await product.save();

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

// ✅ DELETE PRODUCT IMAGE
export const deleteProductImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { public_id } = req.body;

  const product = await ProductModal.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  if (
    req.user.role !== "admin" &&
    String(product.seller) !== String(req.user._id)
  ) {
    throw new ApiError(403, "You can only update your own products");
  }

  // remove from cloudinary
  await cloudinary.uploader.destroy(public_id);

  // remove from array
  product.images = product.images.filter((img) => img.public_id !== public_id);
  await product.save();

  res
    .status(200)
    .json(new ApiResponse(200, product, "Image deleted successfully"));
});

// ✅ DELETE PRODUCT (Seller who owns it / Admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await ProductModal.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  if (
    req.user.role !== "admin" &&
    String(product.seller) !== String(req.user._id)
  ) {
    throw new ApiError(403, "You can only delete your own products");
  }

  // delete all images from cloudinary
  for (const img of product.images) {
    await cloudinary.uploader.destroy(img.public_id);
  }

  await product.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully"));
});

// ✅ GET MY PRODUCTS (Seller dashboard)
export const getMyProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    ProductModal.find({ seller: req.user._id })
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    ProductModal.countDocuments({ seller: req.user._id }),
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
      "Your products fetched successfully",
    ),
  );
});
