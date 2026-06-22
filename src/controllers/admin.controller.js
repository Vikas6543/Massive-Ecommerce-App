import UserModel from "../models/UserModel.js";
import ProductModel from "../models/ProductModel.js";
import OrderModel from "../models/OrderModel.js";
import PaymentModel from "../models/PaymentModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import cloudinary from "../config/cloudinary.js";

// ✅ ADMIN DASHBOARD
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    newUsersThisMonth,
    ordersThisMonth,
    revenueThisMonth,
    revenueLastMonth,
    ordersByStatus,
    recentOrders,
    topSellingProducts,
    monthlyStats,
  ] = await Promise.all([
    // counts
    UserModel.countDocuments(),
    ProductModel.countDocuments(),
    OrderModel.countDocuments(),

    // total revenue
    OrderModel.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),

    // new users this month
    UserModel.countDocuments({ createdAt: { $gte: startOfMonth } }),

    // orders this month
    OrderModel.countDocuments({ createdAt: { $gte: startOfMonth } }),

    // revenue this month
    OrderModel.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),

    // revenue last month
    OrderModel.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),

    // orders by status
    OrderModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),

    // recent 5 orders
    OrderModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .select("orderNumber total status createdAt paymentMethod"),

    // top 5 selling products
    ProductModel.find()
      .sort({ sold: -1 })
      .limit(5)
      .select("name sold price images ratings"),

    // monthly stats last 12 months
    OrderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  // revenue growth percentage
  const thisMonthRevenue = revenueThisMonth[0]?.total || 0;
  const lastMonthRevenue = revenueLastMonth[0]?.total || 0;
  const revenueGrowth =
    lastMonthRevenue === 0
      ? 100
      : (
          ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) *
          100
        ).toFixed(1);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          newUsersThisMonth,
          ordersThisMonth,
          revenueThisMonth: thisMonthRevenue,
          revenueGrowth: Number(revenueGrowth),
        },
        ordersByStatus,
        recentOrders,
        topSellingProducts,
        monthlyStats,
      },
      "Admin dashboard fetched successfully",
    ),
  );
});

// ✅ GET ALL USERS
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    UserModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-password -refreshToken"),
    UserModel.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      "Users fetched successfully",
    ),
  );
});

// ✅ GET SINGLE USER
export const getUser = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.id).select(
    "-password -refreshToken",
  );

  if (!user) throw new ApiError(404, "User not found");

  // get user stats
  const [totalOrders, totalSpent] = await Promise.all([
    OrderModel.countDocuments({ user: user._id }),
    OrderModel.aggregate([
      { $match: { user: user._id, paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        stats: {
          totalOrders,
          totalSpent: totalSpent[0]?.total || 0,
        },
      },
      "User fetched successfully",
    ),
  );
});

// ✅ BAN / UNBAN USER
export const toggleUserBan = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  // prevent banning another admin
  if (user.role === "admin") {
    throw new ApiError(403, "Cannot ban an admin user");
  }

  user.isBanned = !user.isBanned;
  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isBanned: user.isBanned },
        user.isBanned
          ? "User banned successfully"
          : "User unbanned successfully",
      ),
    );
});

// ✅ UPDATE USER ROLE
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!["user", "seller", "admin"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const user = await UserModel.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  user.role = role;
  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { role: user.role },
        "User role updated successfully",
      ),
    );
});

// ✅ DELETE USER
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  if (user.role === "admin") {
    throw new ApiError(403, "Cannot delete an admin user");
  }

  // delete avatar from cloudinary
  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  await user.deleteOne();

  res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

// ✅ GET ALL ORDERS (Admin)
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, paymentStatus } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const query = {};
  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const [orders, total] = await Promise.all([
    OrderModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("user", "name email")
      .populate("items.product", "name images"),
    OrderModel.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      "Orders fetched successfully",
    ),
  );
});

// ✅ UPDATE ORDER STATUS (Admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message } = req.body;

  const order = await OrderModel.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  order.status = status;
  order.tracking.push({
    status,
    message: message || `Order ${status} by admin`,
  });

  if (status === "delivered") {
    order.deliveredAt = new Date();
    order.paymentStatus = "paid";
  }

  if (status === "cancelled") {
    order.cancelledAt = new Date();
  }

  await order.save();

  res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

// ✅ TOGGLE FEATURED PRODUCT
export const toggleFeaturedProduct = asyncHandler(async (req, res) => {
  const product = await ProductModel.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  product.isFeatured = !product.isFeatured;
  await product.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isFeatured: product.isFeatured },
        product.isFeatured
          ? "Product marked as featured"
          : "Product removed from featured",
      ),
    );
});

// ✅ DELETE ANY PRODUCT (Admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await ProductModel.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  for (const img of product.images) {
    await cloudinary.uploader.destroy(img.public_id);
  }

  await product.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully"));
});
