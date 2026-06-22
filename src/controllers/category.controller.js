import CategoryModel from "../models/CategoryModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

// ✅ CREATE CATEGORY (Admin only)
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parent } = req.body;

  const existing = await CategoryModel.findOne({ name });
  if (existing) throw new ApiError(400, "Category already exists");

  const categoryData = { name, description, parent: parent || null };

  // if image uploaded
  if (req.file) {
    categoryData.image = {
      url: req.file.path,
      public_id: req.file.filename,
    };
  }

  const category = await CategoryModel.create(categoryData);

  res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully"));
});

// ✅ GET ALL CATEGORIES (with nested structure)
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await CategoryModel.find({ isActive: true }).lean();

  // build tree structure
  const buildTree = (parentId = null) => {
    return categories
      .filter((cat) => String(cat.parent) === String(parentId))
      .map((cat) => ({
        ...cat,
        children: buildTree(cat._id),
      }));
  };

  const tree = buildTree(null);

  res
    .status(200)
    .json(new ApiResponse(200, tree, "Categories fetched successfully"));
});

// ✅ GET SINGLE CATEGORY
export const getCategory = asyncHandler(async (req, res) => {
  const category = await CategoryModel.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched successfully"));
});

// ✅ UPDATE CATEGORY (Admin only)
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await CategoryModel.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const { name, description, parent, isActive } = req.body;

  if (name) category.name = name;
  if (description !== undefined) category.description = description;
  if (parent !== undefined) category.parent = parent || null;
  if (isActive !== undefined) category.isActive = isActive;

  // if new image uploaded
  if (req.file) {
    // delete old image from cloudinary
    if (category.image?.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }
    category.image = {
      url: req.file.path,
      public_id: req.file.filename,
    };
  }

  await category.save();

  res
    .status(200)
    .json(new ApiResponse(200, category, "Category updated successfully"));
});

// ✅ DELETE CATEGORY (Admin only)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await CategoryModel.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  // check if it has subcategories
  const hasChildren = await CategoryModel.findOne({ parent: category._id });
  if (hasChildren) {
    throw new ApiError(
      400,
      "Cannot delete category with subcategories. Delete subcategories first.",
    );
  }

  // delete image from cloudinary
  if (category.image?.public_id) {
    await cloudinary.uploader.destroy(category.image.public_id);
  }

  await category.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Category deleted successfully"));
});
