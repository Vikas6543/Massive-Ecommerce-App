import { api } from "./api";
import {
  PlaceOrderRequest,
  PlaceOrderResponse,
  VerifyPaymentRequest,
  OrdersResponse,
  Order,
} from "@/types/order.types";
import { clearCart } from "@/store/slices/cartSlice";

export const orderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // PLACE ORDER
    placeOrder: builder.mutation<PlaceOrderResponse, PlaceOrderRequest>({
      query: (data) => ({
        url: "/orders",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearCart());
        } catch {}
      },
      invalidatesTags: ["Orders", "Cart"],
    }),

    // VERIFY PAYMENT
    verifyPayment: builder.mutation<
      { success: boolean; data: { order: Order } },
      VerifyPaymentRequest
    >({
      query: (data) => ({
        url: "/orders/verify-payment",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Orders"],
    }),

    // GET MY ORDERS
    getMyOrders: builder.query<
      OrdersResponse,
      { page?: number; limit?: number; status?: string }
    >({
      query: ({ page = 1, limit = 10, status } = {}) => {
        const params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(limit));
        if (status) params.append("status", status);
        return `/orders/my-orders?${params.toString()}`;
      },
      providesTags: ["Orders"],
    }),

    // GET SINGLE ORDER
    getOrder: builder.query<{ success: boolean; data: Order }, string>({
      query: (id) => `/orders/${id}`,
      providesTags: ["Orders"],
    }),

    // CANCEL ORDER
    cancelOrder: builder.mutation<
      { success: boolean; data: Order },
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/cancel`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  usePlaceOrderMutation,
  useVerifyPaymentMutation,
  useGetMyOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
} = orderApi;
