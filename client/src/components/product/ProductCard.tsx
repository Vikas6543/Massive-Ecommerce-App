"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, Loader2 } from "lucide-react";
import { Product } from "@/types/product.types";
import { formatCurrency, calculateDiscount } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const { addToCart, isAddingToCart } = useCart();

  console.log("product", product.images[0]);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please login to add to wishlist");
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addToCart({
      productId: product._id,
      quantity: 1,
      price: product.salePrice || product.price,
      variant: undefined,
    });
  };

  const discount = product.salePrice
    ? calculateDiscount(product.price, product.salePrice)
    : 0;

  return (
    <Link href={`/products/${product.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group bg-white rounded-2xl border border-zinc-100 overflow-hidden hover:shadow-md hover:border-zinc-200 transition-all"
      >
        {/* IMAGE */}
        <div className="relative aspect-square bg-zinc-50 overflow-hidden">
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* DISCOUNT BADGE */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{discount}%
            </div>
          )}

          {/* OUT OF STOCK */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-zinc-900 text-xs font-bold px-3 py-1.5 rounded-lg">
                Out of stock
              </span>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* WISHLIST */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors"
            >
              <Heart
                size={16}
                className={
                  isWishlisted ? "fill-red-500 text-red-500" : "text-zinc-600"
                }
              />
            </motion.button>

            {/* ADD TO CART */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
              className="w-9 h-9 bg-primary rounded-xl shadow-sm flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isAddingToCart ? (
                <Loader2 size={14} className="text-white animate-spin" />
              ) : (
                <ShoppingCart size={16} className="text-white" />
              )}
            </motion.button>
          </div>
        </div>

        {/* DETAILS */}
        <div className="p-4 space-y-2">
          <p className="text-xs text-zinc-400 font-medium">
            {product.category?.name}
          </p>

          <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* RATING */}
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-zinc-700">
              {product.ratings.average.toFixed(1)}
            </span>
            <span className="text-xs text-zinc-400">
              ({product.ratings.count})
            </span>
          </div>

          {/* PRICE */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-zinc-900">
              {formatCurrency(product.discountPrice)}
            </span>
            <span className="text-xs text-zinc-400 line-through">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
