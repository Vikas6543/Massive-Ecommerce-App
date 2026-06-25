import {
  useGetProductsQuery,
  useGetProductQuery,
  useGetFeaturedProductsQuery,
  useGetCategoriesQuery,
  useSearchProductsQuery,
} from "@/services/productApi";
import { ProductFilters } from "@/types/product.types";

export function useProduct(filters: ProductFilters = {}) {
  // GET ALL PRODUCTS WITH FILTERS
  const {
    data: productsData,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
  } = useGetProductsQuery(filters, {
    skip: false,
  });

  return {
    products: productsData?.products || [],
    totalPages: productsData?.totalPages || 0,
    currentPage: productsData?.currentPage || 1,
    totalProducts: productsData?.totalProducts || 0,
    isProductsLoading,
    isProductsFetching,
  };
}

export function useProductDetail(slug: string) {
  const { data, isLoading: isProductLoading } = useGetProductQuery(slug, {
    skip: !slug,
  });

  return {
    product: data?.data || null,
    isProductLoading,
  };
}

export function useFeaturedProducts() {
  const { data, isLoading: isFeaturedLoading } = useGetFeaturedProductsQuery();

  return {
    featuredProducts: data?.data || [],
    isFeaturedLoading,
  };
}

export function useCategories() {
  const { data, isLoading: isCategoriesLoading } = useGetCategoriesQuery();

  return {
    categories: data?.data || [],
    isCategoriesLoading,
  };
}

export function useSearch(searchTerm: string) {
  const { data, isLoading: isSearchLoading } = useSearchProductsQuery(
    searchTerm,
    {
      skip: !searchTerm,
    },
  );

  return {
    searchResults: data?.products || [],
    isSearchLoading,
  };
}
