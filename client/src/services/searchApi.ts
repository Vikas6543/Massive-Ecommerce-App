import { api } from "./api";
import { ProductsResponse } from "@/types/product.types";

export const searchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // SEARCH PRODUCTS
    searchProducts: builder.query<ProductsResponse, string>({
      query: (searchTerm) => {
        // wrap in quotes for exact phrase matching
        const encoded = encodeURIComponent(`"${searchTerm}"`);
        return `/search?q=${encoded}`;
      },
      providesTags: ["Products"],
    }),

    // SEARCH SUGGESTIONS — autocomplete
    getSearchSuggestions: builder.query<
      { success: boolean; data: { name: string; slug: string; _id: string }[] },
      string
    >({
      query: (searchTerm: string) => `/search/suggestions?q=${searchTerm}`,
    }),
  }),
});

export const { useSearchProductsQuery, useGetSearchSuggestionsQuery } =
  searchApi;
