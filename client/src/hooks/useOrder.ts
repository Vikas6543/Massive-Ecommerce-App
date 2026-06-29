import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  usePlaceOrderMutation,
  useVerifyPaymentMutation,
  useGetMyOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
} from "@/services/orderApi";
import { PlaceOrderRequest, ShippingAddress } from "@/types/order.types";
import { ROUTES } from "@/config/constants";

export function useOrder() {
  const router = useRouter();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [placeOrderMutation, { isLoading: isPlacingOrder }] =
    usePlaceOrderMutation();
  const [verifyPaymentMutation, { isLoading: isVerifyingPayment }] =
    useVerifyPaymentMutation();
  const [cancelOrderMutation, { isLoading: isCancellingOrder }] =
    useCancelOrderMutation();

  // PLACE ORDER
  const placeOrder = async (data: PlaceOrderRequest) => {
    try {
      const result = await placeOrderMutation(data).unwrap();

      if (data.paymentMethod === "cod") {
        toast.success("Order placed successfully!");
        router.push(`/orders/${result.data.order._id}`);
        return;
      }

      // RAZORPAY FLOW
      if (data.paymentMethod === "razorpay" && result.data.razorpayOrder) {
        await initiateRazorpayPayment({
          razorpayOrder: result.data.razorpayOrder,
          key: result.data.key!,
          orderId: result.data.order._id,
        });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to place order");
    }
  };

  // INITIATE RAZORPAY
  const initiateRazorpayPayment = async ({
    razorpayOrder,
    key,
    orderId,
  }: {
    razorpayOrder: any;
    key: string;
    orderId: string;
  }) => {
    setIsProcessingPayment(true);

    const options = {
      key,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "ShopZone",
      description: "Order Payment",
      order_id: razorpayOrder.id,
      handler: async (response: any) => {
        try {
          await verifyPaymentMutation({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId,
          }).unwrap();
          toast.success("Payment successful! Order confirmed.");
          router.push(`/orders/${orderId}`);
        } catch {
          toast.error("Payment verification failed. Contact support.");
        } finally {
          setIsProcessingPayment(false);
        }
      },
      prefill: {
        name: "",
        email: "",
        contact: "",
      },
      theme: {
        color: "#4F46E5",
      },
      modal: {
        ondismiss: () => {
          setIsProcessingPayment(false);
          toast.error("Payment cancelled");
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  // CANCEL ORDER
  const cancelOrder = async (id: string, reason: string) => {
    try {
      await cancelOrderMutation({ id, reason }).unwrap();
      toast.success("Order cancelled successfully");
      return true;
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to cancel order");
      return false;
    }
  };

  return {
    placeOrder,
    cancelOrder,
    isPlacingOrder,
    isVerifyingPayment,
    isCancellingOrder,
    isProcessingPayment,
  };
}

export function useMyOrders(params = {}) {
  const { data, isLoading } = useGetMyOrdersQuery(params);
  return {
    orders: data?.data?.orders || [],
    pagination: data?.data?.pagination,
    isLoading,
  };
}

export function useOrderDetail(id: string) {
  const { data, isLoading } = useGetOrderQuery(id, { skip: !id });
  return {
    order: data?.data || null,
    isLoading,
  };
}
