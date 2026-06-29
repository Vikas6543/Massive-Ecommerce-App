"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  TrendingUp,
  Clock,
  PackageX,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/product/ProductCard";
import {
  useSearchProductsQuery,
  useGetSearchSuggestionsQuery,
} from "@/services/searchApi";
import { useDebounce } from "@/hooks/useDebounce";

const TRENDING_SEARCHES = [
  "iPhone",
  "Nike shoes",
  "Laptop",
  "Headphones",
  "Smart watch",
  "Camera",
];

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

const RECENT_SEARCHES_KEY = "recent_searches";

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  const recent = getRecentSearches();
  const updated = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedInput = useDebounce(inputValue, 300);

  // FETCH SUGGESTIONS
  const { data: suggestionsData } = useGetSearchSuggestionsQuery(
    debouncedInput,
    { skip: debouncedInput.length < 2 },
  );

  // FETCH SEARCH RESULTS
  const { data: resultsData, isLoading: isSearchLoading } =
    useSearchProductsQuery(submittedQuery, {
      skip: !submittedQuery,
    });

  const suggestions =
    suggestionsData?.data?.map((s: any) =>
      typeof s === "string" ? s : s.name,
    ) || [];
  const products = resultsData?.data?.products || [];
  const totalProducts = resultsData?.data?.pagination?.total || 0;

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    inputRef.current?.focus();
  }, []);

  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    setInputValue(term);
    setSubmittedQuery(term);
    setShowSuggestions(false);
    saveRecentSearch(term);
    setRecentSearches(getRecentSearches());
    router.replace(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleClear = () => {
    setInputValue("");
    setSubmittedQuery("");
    setShowSuggestions(false);
    inputRef.current?.focus();
    router.replace("/search");
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* SEARCH INPUT */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <div className="relative flex items-center">
          <Search
            size={20}
            className="absolute left-4 text-zinc-400 shrink-0"
          />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(inputValue);
              if (e.key === "Escape") setShowSuggestions(false);
            }}
            placeholder="Search for products, brands and more..."
            className="pl-12 pr-12 h-14 text-base rounded-2xl border-zinc-200 bg-white shadow-sm focus-visible:ring-primary"
          />
          {inputValue && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={handleClear}
              className="absolute right-4 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X size={18} />
            </motion.button>
          )}
        </div>

        {/* SUGGESTIONS DROPDOWN */}
        <AnimatePresence>
          {showSuggestions &&
            (inputValue.length >= 2 || recentSearches.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-zinc-100 shadow-lg overflow-hidden z-50"
              >
                {/* SUGGESTIONS FROM API */}
                {suggestions.length > 0 && (
                  <div className="p-2">
                    {suggestions.map((suggestion, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => handleSearch(suggestion)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors text-left"
                      >
                        <Search size={14} className="text-zinc-400 shrink-0" />
                        <span className="text-sm text-zinc-700">
                          {suggestion}
                        </span>
                        <ArrowRight
                          size={14}
                          className="text-zinc-300 ml-auto"
                        />
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* RECENT SEARCHES */}
                {recentSearches.length > 0 && !inputValue && (
                  <div className="p-2">
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Recent
                      </span>
                      <button
                        onClick={handleClearRecent}
                        className="text-xs text-primary hover:text-primary-hover transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    {recentSearches.map((term, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => handleSearch(term)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors text-left"
                      >
                        <Clock size={14} className="text-zinc-400 shrink-0" />
                        <span className="text-sm text-zinc-700">{term}</span>
                        <ArrowRight
                          size={14}
                          className="text-zinc-300 ml-auto"
                        />
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
        </AnimatePresence>
      </motion.div>

      {/* NO QUERY — show trending */}
      {!submittedQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-10 space-y-6"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="font-semibold text-zinc-900">Trending searches</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {TRENDING_SEARCHES.map((term, i) => (
              <motion.button
                key={term}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSearch(term)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 hover:border-primary hover:text-primary transition-all"
              >
                <TrendingUp size={13} className="text-zinc-400" />
                {term}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* SEARCH RESULTS */}
      {submittedQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-8 space-y-6"
        >
          {/* RESULTS HEADER */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {isSearchLoading ? (
                "Searching..."
              ) : (
                <>
                  <span className="font-semibold text-zinc-900">
                    {totalProducts}
                  </span>{" "}
                  results for{" "}
                  <span className="font-semibold text-zinc-900">
                    "{submittedQuery}"
                  </span>
                </>
              )}
            </p>
          </div>

          {/* LOADING */}
          {isSearchLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
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
              className="flex flex-col items-center text-center py-20 space-y-4"
            >
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center">
                <PackageX size={28} className="text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900">
                No results found
              </h3>
              <p className="text-sm text-zinc-500 max-w-xs">
                We couldn't find anything for "{submittedQuery}". Try different
                keywords or check spelling.
              </p>

              {/* TRENDING SUGGESTIONS */}
              <div className="pt-4 space-y-3">
                <p className="text-sm font-medium text-zinc-700">
                  Try searching for:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {TRENDING_SEARCHES.slice(0, 4).map((term) => (
                    <motion.button
                      key={term}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSearch(term)}
                      className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-xs hover:bg-primary-light hover:text-primary transition-colors"
                    >
                      {term}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            /* PRODUCTS GRID */
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {products.map((product: any) => (
                <motion.div key={product._id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
