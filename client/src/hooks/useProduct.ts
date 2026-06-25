import {
  useGetProductsQuery,
  useGetProductQuery,
  useGetFeaturedProductsQuery,
  useGetCategoriesQuery,
  useSearchProductsQuery,
} from "@/services/productApi";
import { ProductFilters } from "@/types/product.types";

export function useProduct(filters: ProductFilters = {}) {
  const {
    data,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
  } = useGetProductsQuery(filters);

  return {
    products: data?.data?.products || [],
    totalPages: data?.data?.pagination?.totalPages || 0,
    currentPage: data?.data?.pagination?.page || 1,
    totalProducts: data?.data?.pagination?.total || 0,
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
    searchResults: data?.data?.products || [],
    isSearchLoading,
  };
}
