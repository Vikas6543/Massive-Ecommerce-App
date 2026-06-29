export interface CartVariant {
  size?: string;
  color?: string;
  sku?: string;
}

export interface CartProduct {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  stock: number;
  status: string;
  slug: string;
}

export interface CartItem {
  _id: string;
  product: CartProduct;
  quantity: number;
  price: number; // snapshot price at time of adding
  variant?: CartVariant;
}

export interface Coupon {
  code: string;
  discountAmount: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  coupon?: Coupon;
  subtotal: number;
  totalItems: number;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: Cart;
}

// REQUEST TYPES
export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartRequest {
  productId: string;
  quantity: number;
}

export interface ApplyCouponRequest {
  code: string;
}
