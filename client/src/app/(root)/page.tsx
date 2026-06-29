"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeaturedProducts, useCategories } from "@/hooks/useProduct";
import ProductCard from "@/components/product/ProductCard";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/config/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    icon: Truck,
    title: "Free Delivery",
    desc: "On orders above ₹499",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    desc: "100% secure transactions",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    desc: "30 day return policy",
  },
  {
    icon: ShoppingBag,
    title: "Wide Selection",
    desc: "10,000+ products",
  },
];

export default function HomePage() {
  const { featuredProducts, isFeaturedLoading } = useFeaturedProducts();
  const { categories, isCategoriesLoading } = useCategories();

  return (
    <div className="space-y-20 pb-20">
      {/* ======================== HERO SECTION ======================== */}
      <section className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-800/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* LEFT — text */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 bg-primary/20 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full border border-primary/30">
                  🎉 New arrivals every week
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              >
                Shop the
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  {" "}
                  latest{" "}
                </span>
                trends
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-zinc-400 text-lg leading-relaxed max-w-md"
              >
                Discover thousands of products at unbeatable prices. Fast
                delivery, easy returns, and 24/7 support.
              </motion.p>

              <motion.div variants={fadeUp} className="flex items-center gap-4">
                <Link href={ROUTES.PRODUCTS}>
                  <Button className="h-12 px-8 bg-primary hover:bg-primary-hover text-white font-medium">
                    Shop now
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button
                    variant="outline"
                    className="h-12 px-8 border-zinc-700 text-white hover:bg-zinc-800 bg-transparent"
                  >
                    Browse categories
                  </Button>
                </Link>
              </motion.div>

              {/* STATS */}
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-8 pt-4 border-t border-zinc-800"
              >
                {[
                  { value: "10K+", label: "Products" },
                  { value: "50K+", label: "Customers" },
                  { value: "4.8★", label: "Rating" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-zinc-500">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT — hero image placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-primary/10 rounded-3xl border border-primary/20 flex items-center justify-center">
                  <ShoppingBag size={120} className="text-primary/40" />
                </div>
                {/* Floating cards */}
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-white text-zinc-900 rounded-2xl px-4 py-3 shadow-lg"
                >
                  <p className="text-xs text-zinc-500">New arrival</p>
                  <p className="text-sm font-bold">Nike Air Max</p>
                  <p className="text-primary font-bold">
                    {formatCurrency(4999)}
                  </p>
                </motion.div>
                <motion.div
                  animate={{ y: [8, -8, 8] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 bg-white text-zinc-900 rounded-2xl px-4 py-3 shadow-lg"
                >
                  <p className="text-xs text-zinc-500">⭐ Top rated</p>
                  <p className="text-sm font-bold">4.9 / 5.0</p>
                  <p className="text-xs text-zinc-400">2,340 reviews</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======================== FEATURES BAR ======================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-zinc-100 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="w-11 h-11 bg-primary-light rounded-xl flex items-center justify-center shrink-0">
                <Icon size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">{title}</p>
                <p className="text-xs text-zinc-500">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ======================== CATEGORIES ======================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* HEADER */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-primary text-sm font-medium mb-1">
                Shop by category
              </p>
              <h2 className="text-2xl font-bold text-zinc-900">
                Browse categories
              </h2>
            </div>
            <Link
              href="/categories"
              className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* CATEGORY GRID */}
          {isCategoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-zinc-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category, i) => (
                <motion.div key={category._id} variants={fadeUp}>
                  <Link href={`/categories/${category.slug}`}>
                    <div className="group aspect-square bg-white rounded-2xl border border-zinc-100 hover:border-primary/30 hover:shadow-md transition-all overflow-hidden flex flex-col items-center justify-center gap-3 p-4">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-14 h-14 object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                      <p className="text-xs font-medium text-zinc-700 text-center">
                        {category.name}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* ======================== FEATURED PRODUCTS ======================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* HEADER */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-primary text-sm font-medium mb-1">
                Handpicked for you
              </p>
              <h2 className="text-2xl font-bold text-zinc-900">
                Featured products
              </h2>
            </div>
            <Link
              href={ROUTES.PRODUCTS}
              className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* PRODUCTS GRID */}
          {isFeaturedLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-zinc-100 rounded-2xl aspect-[3/4] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product, i) => (
                <motion.div key={product._id} variants={fadeUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* ======================== PROMO BANNER ======================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl overflow-hidden p-10 lg:p-16 text-white"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/10 rounded-full" />
          </div>

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left">
              <span className="inline-block bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                Limited time offer
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold">
                Get 20% off your
                <br />
                first order
              </h2>
              <p className="text-indigo-200 text-sm">
                Use code{" "}
                <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">
                  FIRST20
                </span>{" "}
                at checkout
              </p>
            </div>
            <Link href={ROUTES.PRODUCTS}>
              <Button className="h-12 px-8 bg-white text-indigo-600 hover:bg-zinc-100 font-semibold shrink-0">
                Shop now
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
