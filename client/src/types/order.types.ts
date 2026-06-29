export interface ShippingAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

export interface TrackingEntry {
  status: string;
  message: string;
  createdAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  coupon?: {
    code: string;
    discountAmount: number;
  };
  paymentMethod: "cod" | "razorpay";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  tracking: TrackingEntry[];
  estimatedDelivery: string;
  cancelReason?: string;
  cancelledAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface PlaceOrderRequest {
  shippingAddress: ShippingAddress;
  paymentMethod: "cod" | "razorpay";
  coupon?: string;
}

export interface PlaceOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: Order;
    razorpayOrder?: {
      id: string;
      amount: number;
      currency: string;
    };
    key?: string;
  };
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
