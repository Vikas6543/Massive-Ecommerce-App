import BrandModel from "../models/BrandModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

// ✅ CREATE BRAND (Admin only)
export const createBrand = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const existing = await BrandModel.findOne({ name });
  if (existing) throw new ApiError(400, "Brand already exists");

  const brandData = { name, description };

  if (req.file) {
    brandData.logo = {
      url: req.file.path,
      public_id: req.file.filename,
    };
  }

  const brand = await BrandModel.create(brandData);

  res
    .status(201)
    .json(new ApiResponse(201, brand, "Brand created successfully"));
});

// ✅ GET ALL BRANDS
export const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await BrandModel.find({ isActive: true });

  res
    .status(200)
    .json(new ApiResponse(200, brands, "Brands fetched successfully"));
});

// ✅ GET SINGLE BRAND
export const getBrand = asyncHandler(async (req, res) => {
  const brand = await BrandModel.findById(req.params.id);
  if (!brand) throw new ApiError(404, "Brand not found");

  res
    .status(200)
    .json(new ApiResponse(200, brand, "Brand fetched successfully"));
});

// ✅ UPDATE BRAND (Admin only)
export const updateBrand = asyncHandler(async (req, res) => {
  const brand = await BrandModel.findById(req.params.id);
  if (!brand) throw new ApiError(404, "Brand not found");

  const { name, description, isActive } = req.body;

  if (name) brand.name = name;
  if (description !== undefined) brand.description = description;
  if (isActive !== undefined) brand.isActive = isActive;

  if (req.file) {
    if (brand.logo?.public_id) {
      await cloudinary.uploader.destroy(brand.logo.public_id);
    }
    brand.logo = {
      url: req.file.path,
      public_id: req.file.filename,
    };
  }

  await brand.save();

  res
    .status(200)
    .json(new ApiResponse(200, brand, "Brand updated successfully"));
});

// ✅ DELETE BRAND (Admin only)
export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await BrandModel.findById(req.params.id);
  if (!brand) throw new ApiError(404, "Brand not found");

  if (brand.logo?.public_id) {
    await cloudinary.uploader.destroy(brand.logo.public_id);
  }

  await brand.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Brand deleted successfully"));
});
