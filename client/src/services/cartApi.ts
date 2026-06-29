import { api } from "./api";
import { CartResponse } from "@/types/cart.types";
import { MessageResponse } from "@/types/auth.types";
import {
  AddToCartRequest,
  UpdateCartRequest,
  ApplyCouponRequest,
} from "@/types/cart.types";
import { setCart, clearCart, removeFromCart } from "@/store/slices/cartSlice";

export const cartApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET CART
    getCart: builder.query<CartResponse, void>({
      query: () => "/cart",
      providesTags: ["Cart"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data }: any = await queryFulfilled;
          if (data?.data?.items) {
            // sync cart with Redux
            const cartItems = data.data.items.map((item: any) => ({
              productId: item.product._id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              image: item.product.images[0]?.url,
              stock: item.product.stock,
              variant: item.variant,
              slug: item.product.slug,
              cartId: item._id,
              discountPrice: item.product.discountPrice,
            }));
            dispatch(setCart(cartItems));
          }
        } catch {}
      },
    }),

    // ADD TO CART
    addToCart: builder.mutation<CartResponse, AddToCartRequest>({
      query: (data) => ({
        url: "/cart/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),

    // UPDATE QUANTITY
    updateCartItem: builder.mutation<CartResponse, UpdateCartRequest>({
      query: ({ productId, quantity }) => ({
        url: `/cart/update`,
        method: "PUT",
        body: { cartItemId: productId, quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    // REMOVE ITEM
    removeFromCart: builder.mutation<MessageResponse, string>({
      query: (productId) => ({
        url: `/cart/remove/${productId}`,
        method: "DELETE",
      }),
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(removeFromCart(productId));
        } catch {}
      },
      invalidatesTags: ["Cart"],
    }),

    // CLEAR CART
    clearCart: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: "/cart/clear",
        method: "DELETE",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearCart());
        } catch {}
      },
      invalidatesTags: ["Cart"],
    }),

    // APPLY COUPON
    applyCoupon: builder.mutation<CartResponse, ApplyCouponRequest>({
      query: (data) => ({
        url: "/cart/coupon",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),

    // REMOVE COUPON
    removeCoupon: builder.mutation<CartResponse, void>({
      query: () => ({
        url: "/cart/coupon",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
} = cartApi;
