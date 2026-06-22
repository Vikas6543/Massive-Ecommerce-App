import OrderModel from "../models/OrderModel.js";
import ProductModel from "../models/ProductModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// ✅ SELLER DASHBOARD STATS
export const getSellerDashboard = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  // get all seller products
  const products = await ProductModel.find({ seller: sellerId });
  const productIds = products.map((p) => p._id);

  // get all orders containing seller's products
  const orders = await OrderModel.find({
    "items.product": { $in: productIds },
    status: { $nin: ["cancelled"] },
  });

  // calculate total revenue
  let totalRevenue = 0;
  let totalSold = 0;

  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (productIds.some((id) => String(id) === String(item.product))) {
        totalRevenue += item.price * item.quantity;
        totalSold += item.quantity;
      }
    });
  });

  // orders by status
  const ordersByStatus = await OrderModel.aggregate([
    { $match: { "items.product": { $in: productIds } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // monthly revenue (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await OrderModel.aggregate([
    {
      $match: {
        "items.product": { $in: productIds },
        createdAt: { $gte: sixMonthsAgo },
        status: { $nin: ["cancelled"] },
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
  ]);

  // top selling products
  const topProducts = await ProductModel.find({ seller: sellerId })
    .sort({ sold: -1 })
    .limit(5)
    .select("name sold price images ratings");

  // low stock products
  const lowStockProducts = await ProductModel.find({
    seller: sellerId,
    stock: { $lte: 10 },
    status: "active",
  }).select("name stock images");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
          totalSold,
        },
        ordersByStatus,
        monthlyRevenue,
        topProducts,
        lowStockProducts,
      },
      "Dashboard data fetched successfully",
    ),
  );
});

// ✅ GET SELLER ORDERS
export const getSellerOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const products = await ProductModel.find({ seller: req.user._id }).select(
    "_id",
  );
  const productIds = products.map((p) => p._id);

  const query = { "items.product": { $in: productIds } };
  if (status) query.status = status;

  const [orders, total] = await Promise.all([
    OrderModel.find(query)
      .populate("user", "name email phone")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
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
      "Seller orders fetched successfully",
    ),
  );
});

// ✅ UPDATE ORDER STATUS (Seller)
export const updateSellerOrderStatus = asyncHandler(async (req, res) => {
  const { status, message } = req.body;

  const allowedStatuses = ["processing", "shipped", "delivered"];
  if (!allowedStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Seller can only update to: ${allowedStatuses.join(", ")}`,
    );
  }

  const products = await ProductModel.find({ seller: req.user._id }).select(
    "_id",
  );
  const productIds = products.map((p) => p._id);

  const order = await OrderModel.findOne({
    _id: req.params.id,
    "items.product": { $in: productIds },
  });

  if (!order) throw new ApiError(404, "Order not found");

  order.status = status;
  order.tracking.push({
    status,
    message: message || `Order ${status} by seller`,
  });

  if (status === "delivered") {
    order.deliveredAt = new Date();
    order.paymentStatus = "paid";
  }

  await order.save();

  res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

// ✅ GET SELLER PRODUCTS WITH STATS
export const getSellerProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const query = { seller: req.user._id };
  if (status) query.status = status;

  const [products, total] = await Promise.all([
    ProductModel.find(query)
      .populate("category", "name")
      .populate("brand", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
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
      "Seller products fetched successfully",
    ),
  );
});
