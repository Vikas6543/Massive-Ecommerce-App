"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  X,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { useAppSelector } from "@/store";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/config/constants";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export default function CartPage() {
  const [couponInput, setCouponInput] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);

  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  const {
    cartData,
    items,
    totalItems,
    totalPrice,
    isCartLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    isUpdatingCart,
    isRemovingFromCart,
    isClearingCart,
    isApplyingCoupon,
  } = useCart();

  const discount = cartData?.coupon?.discountAmount || 0;
  const deliveryCharge = totalPrice > 499 ? 0 : 49;
  const finalTotal = totalPrice - discount + deliveryCharge;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    const success = await applyCoupon(couponInput.trim());
    if (success) {
      setCouponInput("");
      setShowCouponInput(false);
    }
  };

  // NOT LOGGED IN
  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center space-y-5"
        >
          <div className="w-20 h-20 bg-primary-light rounded-3xl flex items-center justify-center">
            <ShoppingCart size={36} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">
            Sign in to view your cart
          </h2>
          <p className="text-zinc-500 text-sm max-w-xs">
            Please sign in to access your cart and continue shopping.
          </p>
          <Link href={ROUTES.LOGIN}>
            <Button className="bg-primary hover:bg-primary-hover text-white h-11 px-8">
              Sign in
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // LOADING
  if (isCartLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-zinc-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
          <div className="h-80 bg-zinc-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // EMPTY CART
  if (!items || items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center space-y-5"
        >
          <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center">
            <ShoppingBag size={36} className="text-zinc-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">
            Your cart is empty
          </h2>
          <p className="text-zinc-500 text-sm max-w-xs">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Link href={ROUTES.PRODUCTS}>
            <Button className="bg-primary hover:bg-primary-hover text-white h-11 px-8">
              Browse products
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Your cart</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={clearCart}
          disabled={isClearingCart}
          className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {isClearingCart ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
          Clear cart
        </motion.button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* CART ITEMS */}
        <div className="lg:col-span-2">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  variants={itemVariants}
                  exit="exit"
                  layout
                  className="bg-white rounded-2xl border border-zinc-100 p-4 sm:p-5"
                >
                  <div className="flex gap-4">
                    {/* PRODUCT IMAGE */}
                    <Link href={`/products/${item.productId}`}>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="w-24 h-24 sm:w-28 sm:h-28 bg-zinc-50 rounded-xl overflow-hidden shrink-0"
                      >
                        <img
                          src={item.images}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    </Link>

                    {/* DETAILS */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/products/${item.productId}`}>
                          <h3 className="text-sm font-semibold text-zinc-900 hover:text-primary transition-colors line-clamp-2">
                            {item.name}
                          </h3>
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeFromCart(item.productId)}
                          disabled={isRemovingFromCart}
                          className="text-zinc-300 hover:text-red-400 transition-colors shrink-0"
                        >
                          <X size={18} />
                        </motion.button>
                      </div>

                      {/* VARIANT */}
                      {item.variant && (
                        <div className="flex items-center gap-2">
                          {item.variant.color && (
                            <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-lg">
                              {item.variant.color}
                            </span>
                          )}
                          {item.variant.size && (
                            <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-lg">
                              {item.variant.size}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {/* QUANTITY */}
                        <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              item.quantity > 1
                                ? updateQuantity(
                                    item.productId,
                                    item.quantity - 1,
                                  )
                                : removeFromCart(item.productId)
                            }
                            disabled={isUpdatingCart}
                            className="w-8 h-8 flex items-center justify-center hover:bg-zinc-50 transition-colors disabled:opacity-50"
                          >
                            <Minus size={14} className="text-zinc-600" />
                          </motion.button>
                          <span className="w-10 text-center text-sm font-semibold text-zinc-900">
                            {item.quantity}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            disabled={
                              isUpdatingCart || item.quantity >= item.stock
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-zinc-50 transition-colors disabled:opacity-50"
                          >
                            <Plus size={14} className="text-zinc-600" />
                          </motion.button>
                        </div>

                        {/* PRICE */}
                        <div className="text-right">
                          <p className="text-base font-bold text-zinc-900">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* CONTINUE SHOPPING */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Link href={ROUTES.PRODUCTS}>
              <Button
                variant="outline"
                className="border-zinc-200 text-zinc-600 hover:text-zinc-900 gap-2"
              >
                <ShoppingBag size={16} />
                Continue shopping
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* ORDER SUMMARY */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5 sticky top-24">
            <h2 className="font-bold text-zinc-900 text-lg">Order summary</h2>

            {/* PRICE BREAKDOWN */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">
                  Subtotal ({totalItems} items)
                </span>
                <span className="font-medium text-zinc-900">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              {discount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex justify-between text-sm"
                >
                  <div className="flex items-center gap-1.5 text-green-600">
                    <Tag size={13} />
                    <span>Coupon ({cartData?.coupon?.code})</span>
                    <button
                      onClick={removeCoupon}
                      className="text-zinc-400 hover:text-red-400 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(discount)}
                  </span>
                </motion.div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Delivery</span>
                <span
                  className={`font-medium ${
                    deliveryCharge === 0 ? "text-green-600" : "text-zinc-900"
                  }`}
                >
                  {deliveryCharge === 0
                    ? "Free"
                    : formatCurrency(deliveryCharge)}
                </span>
              </div>

              {deliveryCharge > 0 && (
                <p className="text-xs text-zinc-400">
                  Add{" "}
                  <span className="text-primary font-medium">
                    {formatCurrency(499 - totalPrice)}
                  </span>{" "}
                  more for free delivery
                </p>
              )}
            </div>

            <div className="h-px bg-zinc-100" />

            {/* TOTAL */}
            <div className="flex justify-between">
              <span className="font-bold text-zinc-900">Total</span>
              <span className="font-bold text-xl text-zinc-900">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            {/* COUPON */}
            <div className="space-y-2">
              {!cartData?.coupon?.code && (
                <>
                  {showCouponInput ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex gap-2"
                    >
                      <Input
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) =>
                          setCouponInput(e.target.value.toUpperCase())
                        }
                        className="h-10 text-sm border-zinc-200 uppercase"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyCoupon()
                        }
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="h-10 bg-primary hover:bg-primary-hover text-white shrink-0"
                      >
                        {isApplyingCoupon ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => setShowCouponInput(true)}
                      className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover transition-colors"
                    >
                      <Tag size={14} />
                      Have a coupon code?
                    </button>
                  )}
                </>
              )}
            </div>

            {/* CHECKOUT BUTTON */}
            <Link href={ROUTES.CHECKOUT}>
              <Button className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-semibold gap-2">
                Proceed to checkout
                <ArrowRight size={16} />
              </Button>
            </Link>

            {/* SECURE BADGE */}
            <p className="text-xs text-zinc-400 text-center flex items-center justify-center gap-1.5">
              <span>🔒</span>
              Secure checkout powered by Razorpay
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
