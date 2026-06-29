"use client";

import { motion } from "framer-motion";
import { X, SlidersHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useProduct";

interface FiltersState {
  category: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
  sort: string;
}

interface ProductFiltersProps {
  filters: FiltersState;
  onFilterChange: (key: keyof FiltersState, value: any) => void;
  onReset: () => void;
}

const ratings = [4, 3, 2, 1];

const sortOptions = [
  { label: "Newest first", value: "newest" },
  { label: "Price: Low to high", value: "price-low" },
  { label: "Price: High to low", value: "price-high" },
  { label: "Most popular", value: "popular" },
  { label: "Top rated", value: "rating" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function ProductFilters({
  filters,
  onFilterChange,
  onReset,
}: ProductFiltersProps) {
  const { categories, isCategoriesLoading } = useCategories();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* HEADER */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-primary" />
          <h3 className="font-semibold text-zinc-900">Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors"
        >
          <X size={12} />
          Reset all
        </button>
      </motion.div>

      {/* DIVIDER */}
      <div className="h-px bg-zinc-100" />

      {/* SORT */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h4 className="text-sm font-semibold text-zinc-800">Sort by</h4>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="sort"
                value={option.value}
                checked={filters.sort === option.value}
                onChange={() => onFilterChange("sort", option.value)}
                className="accent-primary"
              />
              <span
                className={`text-sm transition-colors ${
                  filters.sort === option.value
                    ? "text-primary font-medium"
                    : "text-zinc-600 group-hover:text-zinc-900"
                }`}
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </motion.div>

      <div className="h-px bg-zinc-100" />

      {/* CATEGORIES */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h4 className="text-sm font-semibold text-zinc-800">Category</h4>
        {isCategoriesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 bg-zinc-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <Checkbox
                checked={filters.category === ""}
                onCheckedChange={() => onFilterChange("category", "")}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm text-zinc-600 group-hover:text-zinc-900 transition-colors">
                All categories
              </span>
            </label>
            {categories.map((category) => (
              <motion.label
                key={category._id}
                whileHover={{ x: 2 }}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <Checkbox
                  checked={filters.category === category.slug}
                  onCheckedChange={() =>
                    onFilterChange("category", category.slug)
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span
                  className={`text-sm transition-colors ${
                    filters.category === category.slug
                      ? "text-primary font-medium"
                      : "text-zinc-600 group-hover:text-zinc-900"
                  }`}
                >
                  {category.name}
                </span>
              </motion.label>
            ))}
          </div>
        )}
      </motion.div>

      <div className="h-px bg-zinc-100" />

      {/* PRICE RANGE */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h4 className="text-sm font-semibold text-zinc-800">Price range</h4>
        <Slider
          min={0}
          max={100000}
          step={500}
          value={[filters.minPrice ?? 0, filters.maxPrice ?? 100000]}
          onValueChange={([min, max]) => {
            onFilterChange("minPrice", min);
            onFilterChange("maxPrice", max);
          }}
          className="w-full"
        />
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>₹{(filters.minPrice ?? 0).toLocaleString()}</span>
          <span>₹{(filters.maxPrice ?? 100000).toLocaleString()}</span>
        </div>
      </motion.div>

      <div className="h-px bg-zinc-100" />

      {/* RATING */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h4 className="text-sm font-semibold text-zinc-800">Minimum rating</h4>
        <div className="space-y-2">
          {ratings.map((rating) => (
            <motion.label
              key={rating}
              whileHover={{ x: 2 }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={filters.rating === rating}
                onChange={() => onFilterChange("rating", rating)}
                className="accent-primary"
              />
              <span
                className={`text-sm flex items-center gap-1 transition-colors ${
                  filters.rating === rating
                    ? "text-primary font-medium"
                    : "text-zinc-600 group-hover:text-zinc-900"
                }`}
              >
                {"★".repeat(rating)}
                {"☆".repeat(5 - rating)}
                <span className="text-zinc-400 ml-1">& above</span>
              </span>
            </motion.label>
          ))}
        </div>
      </motion.div>

      {/* APPLY BUTTON — mobile */}
      <motion.div variants={itemVariants} className="lg:hidden">
        <Button className="w-full bg-primary hover:bg-primary-hover text-white">
          Apply filters
        </Button>
      </motion.div>
    </motion.div>
  );
}
