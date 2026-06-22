import CartModel from "../models/CartModel.js";
import ProductModel from "../models/ProductModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ✅ ADD TO CART
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variant } = req.body;

  // validate product
  const product = await ProductModel.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.status !== "active")
    throw new ApiError(400, "Product is not available");

  // check stock
  const availableStock =
    product.variants?.length > 0
      ? product.variants.find(
          (v) => v.size === variant?.size && v.color === variant?.color,
        )?.stock || 0
      : product.stock;

  if (availableStock < quantity) {
    throw new ApiError(400, `Only ${availableStock} items available in stock`);
  }

  // get or create cart
  let cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) {
    cart = await CartModel.create({ user: req.user._id, items: [] });
  }

  // check if same product+variant already in cart
  const existingItemIndex = cart.items.findIndex((item) => {
    const sameProduct = String(item.product) === String(productId);
    const sameVariant =
      item.variant?.size === variant?.size &&
      item.variant?.color === variant?.color;
    return sameProduct && sameVariant;
  });

  if (existingItemIndex > -1) {
    // update quantity
    cart.items[existingItemIndex].quantity += Number(quantity);
  } else {
    // add new item
    cart.items.push({
      product: productId,
      quantity: Number(quantity),
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      variant: variant || {},
    });
  }

  await cart.save();

  // populate before sending
  await cart.populate(
    "items.product",
    "name images price discountPrice stock status",
  );

  res
    .status(200)
    .json(new ApiResponse(200, cart, "Item added to cart successfully"));
});

// ✅ GET MY CART
export const getCart = asyncHandler(async (req, res) => {
  const cart = await CartModel.findOne({ user: req.user._id }).populate(
    "items.product",
    "name images price discountPrice stock status slug",
  );

  if (!cart) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { items: [], subtotal: 0, totalItems: 0 },
          "Cart is empty",
        ),
      );
  }

  res.status(200).json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

// ✅ UPDATE CART ITEM QUANTITY
export const updateCartItem = asyncHandler(async (req, res) => {
  const { cartItemId, quantity } = req.body;

  if (quantity < 1) throw new ApiError(400, "Quantity must be at least 1");

  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  const item = cart.items.id(cartItemId);
  if (!item) throw new ApiError(404, "Item not found in cart");

  // check stock
  const product = await ProductModel.findById(item.product);
  if (product.stock < quantity) {
    throw new ApiError(400, `Only ${product.stock} items available`);
  }

  item.quantity = Number(quantity);
  await cart.save();

  await cart.populate(
    "items.product",
    "name images price discountPrice stock status",
  );

  res.status(200).json(new ApiResponse(200, cart, "Cart updated successfully"));
});

// ✅ REMOVE ITEM FROM CART
export const removeCartItem = asyncHandler(async (req, res) => {
  const { cartItemId } = req.params;

  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = cart.items.filter(
    (item) => String(item._id) !== String(cartItemId),
  );

  await cart.save();
  await cart.populate(
    "items.product",
    "name images price discountPrice stock status",
  );

  res
    .status(200)
    .json(new ApiResponse(200, cart, "Item removed from cart successfully"));
});

// ✅ CLEAR CART
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = [];
  cart.coupon = undefined;
  await cart.save();

  res.status(200).json(new ApiResponse(200, null, "Cart cleared successfully"));
});
