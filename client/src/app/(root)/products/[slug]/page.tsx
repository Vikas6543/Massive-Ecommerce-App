"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Loader2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Share2,
  ChevronRight,
  Minus,
  Plus,
  PackageX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductImages from "@/components/product/ProductImages";
import ProductVariants from "@/components/product/ProductVariants";
import ProductReviews from "@/components/product/ProductReviews";
import ProductCard from "@/components/product/ProductCard";
import { useProductDetail, useProduct } from "@/hooks/useProduct";
import { useCart } from "@/hooks/useCart";
import { useAppSelector } from "@/store";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [selectedVariant, setSelectedVariant] = useState<{
    color?: string;
    size?: string;
  }>({});
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { product, isProductLoading } = useProductDetail(slug);
  const { addToCart, isAddingToCart } = useCart();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  // RELATED PRODUCTS
  const { products: relatedProducts } = useProduct({
    category: product?.category?.slug || "",
    limit: 4,
  });

  const handleAddToCart = async () => {
    if (!product) return;
    if (
      product.variants?.length &&
      (!selectedVariant.color || !selectedVariant.size)
    ) {
      toast.error("Please select all variants");
      return;
    }
    await addToCart({
      productId: product._id,
      quantity,
      price: product.discountPrice || product.price,
      variant: selectedVariant,
    });
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/checkout");
  };

  const handleWishlist = () => {
    if (!isLoggedIn) {
      toast.error("Please login to add to wishlist");
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  // LOADING STATE
  if (isProductLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-zinc-100 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`h-6 bg-zinc-100 rounded animate-pulse ${
                  i === 0 ? "w-3/4" : i === 1 ? "w-1/2" : "w-full"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // NOT FOUND STATE
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-4">
        <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto">
          <PackageX size={28} className="text-zinc-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Product not found</h2>
        <p className="text-zinc-500 text-sm">
          The product you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link href="/products">
          <Button className="bg-primary hover:bg-primary-hover text-white">
            Browse products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* BREADCRUMB */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 text-sm text-zinc-500"
      >
        <Link href="/" className="hover:text-zinc-900 transition-colors">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link
          href="/products"
          className="hover:text-zinc-900 transition-colors"
        >
          Products
        </Link>
        <ChevronRight size={14} />
        <Link
          href={`/categories/${product.category?.slug}`}
          className="hover:text-zinc-900 transition-colors"
        >
          {product.category?.name}
        </Link>
        <ChevronRight size={14} />
        <span className="text-zinc-900 font-medium truncate max-w-xs">
          {product.name}
        </span>
      </motion.nav>

      {/* MAIN CONTENT */}
      <div className="grid lg:grid-cols-2 gap-12 -mt-8">
        {/* LEFT — IMAGES */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProductImages
            images={product.images.map((image) => image.url)}
            productName={product.name}
          />
        </motion.div>

        {/* RIGHT — DETAILS */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {/* BRAND + CATEGORY */}
          {/* <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary bg-primary-light px-2.5 py-1 rounded-lg">
              {product.category?.name}
            </span>
            <span className="text-xs text-zinc-400">{product.brand?.name}</span>
          </div> */}

          {/* NAME */}
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
            {product.name}
          </h1>

          {/* DESCRIPTION */}
          <p className="text-sm text-zinc-600 leading-relaxed">
            {product.description}
          </p>

          {/* RATING */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.round(product.ratings.average)
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-300"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-zinc-400">
              ({product.ratings.count} reviews)
            </span>
          </div>

          {/* PRICE */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-zinc-900">
              {formatCurrency(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <>
                <span className="text-lg text-zinc-400 line-through mb-0.5">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg mb-0.5">
                  {product.discountPercentage}% off
                </span>
              </>
            )}
          </div>

          {/* STOCK STATUS */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                product.stock > 0 ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                product.stock > 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {product.stock > 10
                ? "In stock"
                : product.stock > 0
                  ? `Only ${product.stock} left`
                  : "Out of stock"}
            </span>
          </div>

          {/* VARIANTS */}
          {product.variants && product.variants.length > 0 && (
            <ProductVariants
              variants={product.variants}
              selected={selectedVariant}
              onSelect={setSelectedVariant}
            />
          )}

          {/* QUANTITY */}
          <div className="space-y-2 flex items-center gap-2">
            <label className="text-sm font-semibold text-zinc-800">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 transition-colors"
                >
                  <Minus size={16} className="text-zinc-600" />
                </motion.button>
                <span className="w-12 text-center text-sm font-semibold text-zinc-900">
                  {quantity}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 transition-colors"
                >
                  <Plus size={16} className="text-zinc-600" />
                </motion.button>
              </div>
              <span className="text-xs text-zinc-400">
                Max {product.stock} units
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock === 0}
              variant="outline"
              className="flex-1 h-12 border-primary text-primary hover:bg-primary-light gap-2"
            >
              {isAddingToCart ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShoppingCart size={16} />
              )}
              Add to cart
            </Button>

            <Button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 h-12 bg-primary hover:bg-primary-hover text-white"
            >
              Buy now
            </Button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWishlist}
              className="w-12 h-12 border-2 border-zinc-200 rounded-xl flex items-center justify-center hover:border-red-300 transition-colors"
            >
              <Heart
                size={18}
                className={
                  isWishlisted ? "fill-red-500 text-red-500" : "text-zinc-400"
                }
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="w-12 h-12 border-2 border-zinc-200 rounded-xl flex items-center justify-center hover:border-zinc-400 transition-colors"
            >
              <Share2 size={18} className="text-zinc-400" />
            </motion.button>
          </div>

          {/* DELIVERY INFO */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-zinc-50 rounded-2xl">
            {[
              { icon: Truck, text: "Free delivery", sub: "Above ₹499" },
              { icon: Shield, text: "Secure payment", sub: "100% safe" },
              { icon: RotateCcw, text: "Easy returns", sub: "30 days" },
            ].map(({ icon: Icon, text, sub }) => (
              <div
                key={text}
                className="flex flex-col items-center text-center gap-1"
              >
                <Icon size={18} className="text-primary" />
                <span className="text-xs font-medium text-zinc-700">
                  {text}
                </span>
                <span className="text-xs text-zinc-400">{sub}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* TABS — description + reviews */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Tabs defaultValue="description">
          <TabsList className="bg-zinc-100 rounded-xl p-1">
            <TabsTrigger
              value="description"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary"
            >
              Reviews ({product.ratings.count})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <div className="bg-white rounded-2xl border border-zinc-100 p-6">
              <p className="text-zinc-600 leading-relaxed text-sm">
                {product.description}
              </p>
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="bg-white rounded-2xl border border-zinc-100 p-6">
              <ProductReviews
                productId={product._id}
                reviews={[]}
                ratings={product.ratings.average}
                reviewCount={product.ratings.count}
              />
            </div>
          </TabsContent>
        </Tabs>
      </motion.div> */}

      {/* RELATED PRODUCTS */}
      {/* {relatedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">
              Related products
            </h2>
            <Link
              href="/products"
              className="text-sm text-primary font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts
              .filter((p) => p._id !== product._id)
              .slice(0, 4)
              .map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
          </div>
        </motion.div>
      )} */}
    </div>
  );
}
