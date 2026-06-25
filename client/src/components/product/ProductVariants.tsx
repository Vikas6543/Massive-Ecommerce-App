"use client";

import { motion } from "framer-motion";
import { ProductVariant } from "@/types/product.types";

interface SelectedVariant {
  color?: string;
  size?: string;
}

interface ProductVariantsProps {
  variants: ProductVariant[];
  selected: SelectedVariant;
  onSelect: (variant: SelectedVariant) => void;
}

export default function ProductVariants({
  variants,
  selected,
  onSelect,
}: ProductVariantsProps) {
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];

  const isOutOfStock = (color?: string, size?: string) => {
    return !variants.some(
      (v) =>
        (!color || v.color === color) &&
        (!size || v.size === size) &&
        v.stock > 0,
    );
  };

  return (
    <div className="space-y-5">
      {/* COLORS */}
      {colors.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-800">Color</span>
            {selected.color && (
              <span className="text-sm text-zinc-500">— {selected.color}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const outOfStock = isOutOfStock(color, selected.size);
              const isSelected = selected.color === color;

              return (
                <motion.button
                  key={color}
                  whileHover={{ scale: outOfStock ? 1 : 1.05 }}
                  whileTap={{ scale: outOfStock ? 1 : 0.95 }}
                  onClick={() =>
                    !outOfStock && onSelect({ ...selected, color })
                  }
                  disabled={outOfStock}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary-light text-primary"
                      : outOfStock
                        ? "border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed line-through"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                  }`}
                >
                  {color}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* SIZES */}
      {sizes.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-800">Size</span>
            {selected.size && (
              <span className="text-sm text-zinc-500">— {selected.size}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const outOfStock = isOutOfStock(selected.color, size);
              const isSelected = selected.size === size;

              return (
                <motion.button
                  key={size}
                  whileHover={{ scale: outOfStock ? 1 : 1.05 }}
                  whileTap={{ scale: outOfStock ? 1 : 0.95 }}
                  onClick={() => !outOfStock && onSelect({ ...selected, size })}
                  disabled={outOfStock}
                  className={`w-12 h-12 rounded-xl text-sm font-medium border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary-light text-primary"
                      : outOfStock
                        ? "border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed line-through"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                  }`}
                >
                  {size}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
