import { api } from "./api";
import {
  Product,
  ProductsResponse,
  ProductFilters,
  Category,
} from "@/types/product.types";

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL PRODUCTS
    getProducts: builder.query<ProductsResponse, ProductFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            params.append(key, String(value));
          }
        });
        return `/products?${params.toString()}`;
      },
      providesTags: ["Products"],
    }),

    // GET SINGLE PRODUCT
    getProduct: builder.query<{ success: boolean; data: Product }, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: ["Products"],
    }),

    // GET FEATURED PRODUCTS
    getFeaturedProducts: builder.query<{ data: Product[] }, void>({
      query: () => "/products/featured",
      providesTags: ["Products"],
    }),

    // GET CATEGORIES
    getCategories: builder.query<{ data: Category[] }, void>({
      query: () => "/categories",
      providesTags: ["Categories"],
    }),

    // SEARCH PRODUCTS
    searchProducts: builder.query<ProductsResponse, string>({
      query: (searchTerm) => `/search?q=${searchTerm}`,
      providesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetFeaturedProductsQuery,
  useGetCategoriesQuery,
  useSearchProductsQuery,
} = productApi;
