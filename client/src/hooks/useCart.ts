import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearCart as clearCartAction } from "@/store/slices/cartSlice";
import {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
} from "@/services/cartApi";
import { AddToCartRequest } from "@/types/cart.types";

export function useCart() {
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const { items, totalItems, totalPrice } = useAppSelector(
    (state) => state.cart,
  );

  // FETCH CART — only if logged in
  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery(
    undefined,
    { skip: !isLoggedIn },
  );

  const [addToCartMutation, { isLoading: isAddingToCart }] =
    useAddToCartMutation();
  const [updateCartItemMutation, { isLoading: isUpdatingCart }] =
    useUpdateCartItemMutation();
  const [removeFromCartMutation, { isLoading: isRemovingFromCart }] =
    useRemoveFromCartMutation();
  const [clearCartMutation, { isLoading: isClearingCart }] =
    useClearCartMutation();
  const [applyCouponMutation, { isLoading: isApplyingCoupon }] =
    useApplyCouponMutation();
  const [removeCouponMutation, { isLoading: isRemovingCoupon }] =
    useRemoveCouponMutation();

  // ADD TO CART
  const addToCart = async (data: AddToCartRequest) => {
    if (!isLoggedIn) {
      toast.error("Please login to add items to cart");
      return;
    }
    try {
      await addToCartMutation(data).unwrap();
      toast.success("Added to cart!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add to cart");
    }
  };

  // UPDATE QUANTITY
  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      await updateCartItemMutation({ productId, quantity }).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update quantity");
    }
  };

  // REMOVE FROM CART
  const removeFromCart = async (productId: string) => {
    try {
      await removeFromCartMutation(productId).unwrap();
      toast.success("Item removed from cart");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove item");
    }
  };

  // CLEAR CART
  const clearCart = async () => {
    try {
      await clearCartMutation().unwrap();
      toast.success("Cart cleared");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to clear cart");
    }
  };

  // APPLY COUPON
  const applyCoupon = async (code: string) => {
    try {
      const result = await applyCouponMutation({ code }).unwrap();
      toast.success(result.message || "Coupon applied!");
      return true;
    } catch (error: any) {
      toast.error(error?.data?.message || "Invalid coupon code");
      return false;
    }
  };

  // REMOVE COUPON
  const removeCoupon = async () => {
    try {
      await removeCouponMutation().unwrap();
      toast.success("Coupon removed");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove coupon");
    }
  };

  return {
    // STATE
    items,
    totalItems,
    totalPrice,
    cartData: cartData?.data,
    isCartLoading,

    // ACTIONS
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,

    // LOADING STATES
    isAddingToCart,
    isUpdatingCart,
    isRemovingFromCart,
    isClearingCart,
    isApplyingCoupon,
    isRemovingCoupon,
  };
}
