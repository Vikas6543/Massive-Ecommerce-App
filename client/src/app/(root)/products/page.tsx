"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Search, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import { useProduct } from "@/hooks/useProduct";
import { useDebounce } from "@/hooks/useDebounce";

const DEFAULT_FILTERS = {
  category: "",
  minPrice: 0,
  maxPrice: 100000,
  rating: 0,
  sort: "newest",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ProductsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);

  const {
    products,
    totalPages,
    totalProducts,
    isProductsLoading,
    isProductsFetching,
  } = useProduct({
    ...filters,
    search: debouncedSearch,
    page: currentPage,
    limit: 12,
  });

  const handleFilterChange = useCallback(
    (key: keyof typeof DEFAULT_FILTERS, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    [],
  );

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput("");
    setCurrentPage(1);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* PAGE HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 space-y-1"
      >
        <h1 className="text-2xl font-bold text-zinc-900">All Products</h1>
        <p className="text-sm text-zinc-500">
          {isProductsLoading
            ? "Loading products..."
            : `${totalProducts} products found`}
        </p>
      </motion.div>

      {/* SEARCH + MOBILE FILTER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center gap-3 mb-8"
      >
        {/* SEARCH */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-11 bg-white border-zinc-200"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* MOBILE FILTER BUTTON */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="lg:hidden h-11 gap-2 border-zinc-200"
            >
              <SlidersHorizontal size={16} />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <div className="pt-6">
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
              />
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>

      <div className="flex gap-8">
        {/* SIDEBAR FILTERS — desktop */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="hidden lg:block w-64 shrink-0"
        >
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 sticky top-24">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>
        </motion.aside>

        {/* PRODUCTS GRID */}
        <div className="flex-1 min-w-0">
          {/* LOADING SKELETON */}
          {isProductsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-zinc-100 rounded-2xl aspect-[3/4] animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            /* EMPTY STATE */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center">
                <PackageX size={28} className="text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900">
                No products found
              </h3>
              <p className="text-sm text-zinc-500 max-w-xs">
                Try adjusting your filters or search term to find what
                you&apos;re looking for.
              </p>
              <Button
                onClick={handleReset}
                className="bg-primary hover:bg-primary-hover text-white"
              >
                Reset filters
              </Button>
            </motion.div>
          ) : (
            <>
              {/* FETCHING OVERLAY */}
              <AnimatePresence>
                {isProductsFetching && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 flex items-center gap-2 text-sm text-primary"
                  >
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Updating results...
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PRODUCTS */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {products.map((product) => (
                  <motion.div key={product._id} variants={itemVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center gap-2 mt-10"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="border-zinc-200"
                  >
                    Previous
                  </Button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;
                    const isNear =
                      Math.abs(page - currentPage) <= 1 ||
                      page === 1 ||
                      page === totalPages;

                    if (!isNear) {
                      if (page === 2 || page === totalPages - 1) {
                        return (
                          <span key={page} className="text-zinc-400 text-sm">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <motion.button
                        key={page}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary text-white"
                            : "bg-white border border-zinc-200 text-zinc-600 hover:border-primary hover:text-primary"
                        }`}
                      >
                        {page}
                      </motion.button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="border-zinc-200"
                  >
                    Next
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
