"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  MapPin,
  CreditCard,
  Truck,
  ChevronRight,
  ChevronDown,
  Loader2,
  ShoppingBag,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { useOrder } from "@/hooks/useOrder";
import { useAppSelector } from "@/store";
import { formatCurrency } from "@/lib/utils";
import { ShippingAddress } from "@/types/order.types";
import Link from "next/link";

// VALIDATION
const addressSchema = yup.object({
  name: yup.string().required("name is required"),
  phone: yup
    .string()
    .matches(/^[6-9]\d{9}$/, "Enter valid 10 digit phone number")
    .required("Phone is required"),
  addressLine1: yup.string().required("Address is required"),
  addressLine2: yup.string(),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  pincode: yup
    .string()
    .matches(/^\d{6}$/, "Enter valid 6 digit pincode")
    .required("Pincode is required"),
});

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
];

type PaymentMethod = "cod" | "razorpay";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [currentStep, setCurrentStep] = useState<"address" | "payment">(
    "address",
  );

  const router = useRouter();
  const { items, totalPrice, cartData, isCartLoading } = useCart();
  const { placeOrder, isPlacingOrder, isProcessingPayment } = useOrder();
  const user = useAppSelector((state) => state.auth.user);

  const discount = cartData?.coupon?.discountAmount || 0;
  const deliveryCharge = totalPrice > 999 ? 0 : 99;
  const finalTotal = totalPrice - discount + deliveryCharge;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ShippingAddress>({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  const onSubmit = async (address: ShippingAddress) => {
    if (currentStep === "address") {
      setCurrentStep("payment");
      return;
    }
  };

  const handlePlaceOrder = async (address: ShippingAddress) => {
    await placeOrder({
      shippingAddress: address,
      paymentMethod,
    });
  };

  // EMPTY CART
  if (!isCartLoading && (!items || items.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-4">
        <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto">
          <ShoppingBag size={28} className="text-zinc-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Your cart is empty</h2>
        <p className="text-zinc-500 text-sm">
          Add items to your cart before checkout
        </p>
        <Link href="/products">
          <Button className="bg-primary hover:bg-primary-hover text-white">
            Browse products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-zinc-900">Checkout</h1>

        {/* STEPS */}
        <div className="flex items-center gap-2 mt-4">
          {["address", "payment"].map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  currentStep === step
                    ? "text-primary"
                    : index === 0 && currentStep === "payment"
                      ? "text-green-600"
                      : "text-zinc-400"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    currentStep === step
                      ? "bg-primary text-white"
                      : index === 0 && currentStep === "payment"
                        ? "bg-green-500 text-white"
                        : "bg-zinc-200 text-zinc-500"
                  }`}
                >
                  {index === 0 && currentStep === "payment" ? "✓" : index + 1}
                </div>
                {step === "address" ? "Shipping address" : "Payment"}
              </div>
              {index === 0 && (
                <ChevronRight size={16} className="text-zinc-300" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT — FORM */}
        <div className="lg:col-span-2">
          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit(
              currentStep === "address" ? onSubmit : handlePlaceOrder,
            )}
            className="space-y-6"
          >
            {/* ADDRESS SECTION */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-zinc-100 overflow-hidden"
            >
              {/* SECTION HEADER */}
              <button
                type="button"
                onClick={() => setCurrentStep("address")}
                className="w-full flex items-center justify-between p-6 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-zinc-900">
                      Shipping address
                    </p>
                    <p className="text-xs text-zinc-500">
                      Where should we deliver?
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-zinc-400 transition-transform ${
                    currentStep === "address" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* ADDRESS FORM */}
              <AnimatePresence>
                {currentStep === "address" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 space-y-4 border-t border-zinc-100">
                      <div className="grid sm:grid-cols-2 gap-4 pt-4">
                        {/* FULL NAME */}
                        <div className="space-y-1.5">
                          <Label className="text-zinc-700">Full name</Label>
                          <Input
                            placeholder="John Doe"
                            className={`h-11 ${
                              errors.name ? "border-red-500" : "border-zinc-200"
                            }`}
                            {...register("name")}
                          />
                          {errors.name && (
                            <p className="text-red-500 text-xs">
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        {/* PHONE */}
                        <div className="space-y-1.5">
                          <Label className="text-zinc-700">Phone number</Label>
                          <div className="flex gap-2">
                            <div className="w-16 h-11 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center text-sm text-zinc-500 shrink-0">
                              +91
                            </div>
                            <Input
                              placeholder="9876543210"
                              maxLength={10}
                              className={`h-11 flex-1 ${
                                errors.phone
                                  ? "border-red-500"
                                  : "border-zinc-200"
                              }`}
                              {...register("phone")}
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-red-500 text-xs">
                              {errors.phone.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ADDRESS LINE 1 */}
                      <div className="space-y-1.5">
                        <Label className="text-zinc-700">Address line 1</Label>
                        <Input
                          placeholder="House/Flat no., Building, Street"
                          className={`h-11 ${
                            errors.addressLine1
                              ? "border-red-500"
                              : "border-zinc-200"
                          }`}
                          {...register("addressLine1")}
                        />
                        {errors.addressLine1 && (
                          <p className="text-red-500 text-xs">
                            {errors.addressLine1.message}
                          </p>
                        )}
                      </div>

                      {/* ADDRESS LINE 2 */}
                      <div className="space-y-1.5">
                        <Label className="text-zinc-700">
                          Address line 2{" "}
                          <span className="text-zinc-400">(optional)</span>
                        </Label>
                        <Input
                          placeholder="Landmark, Area"
                          className="h-11 border-zinc-200"
                          {...register("addressLine2")}
                        />
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        {/* CITY */}
                        <div className="space-y-1.5">
                          <Label className="text-zinc-700">City</Label>
                          <Input
                            placeholder="Bengaluru"
                            className={`h-11 ${
                              errors.city ? "border-red-500" : "border-zinc-200"
                            }`}
                            {...register("city")}
                          />
                          {errors.city && (
                            <p className="text-red-500 text-xs">
                              {errors.city.message}
                            </p>
                          )}
                        </div>

                        {/* STATE */}
                        <div className="space-y-1.5">
                          <Label className="text-zinc-700">State</Label>
                          <select
                            className={`w-full h-11 px-3 rounded-lg border text-sm text-zinc-900 bg-white outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                              errors.state
                                ? "border-red-500"
                                : "border-zinc-200"
                            }`}
                            {...register("state")}
                          >
                            <option value="">Select state</option>
                            {INDIAN_STATES.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                          {errors.state && (
                            <p className="text-red-500 text-xs">
                              {errors.state.message}
                            </p>
                          )}
                        </div>

                        {/* PINCODE */}
                        <div className="space-y-1.5">
                          <Label className="text-zinc-700">Pincode</Label>
                          <Input
                            placeholder="560001"
                            maxLength={6}
                            className={`h-11 ${
                              errors.pincode
                                ? "border-red-500"
                                : "border-zinc-200"
                            }`}
                            {...register("pincode")}
                          />
                          {errors.pincode && (
                            <p className="text-red-500 text-xs">
                              {errors.pincode.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 bg-primary hover:bg-primary-hover text-white mt-2"
                      >
                        Continue to payment
                        <ChevronRight size={16} className="ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* PAYMENT SECTION */}
            <motion.div
              variants={itemVariants}
              className={`bg-white rounded-2xl border overflow-hidden transition-colors ${
                currentStep === "payment"
                  ? "border-primary/30"
                  : "border-zinc-100"
              }`}
            >
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      currentStep === "payment"
                        ? "bg-primary-light"
                        : "bg-zinc-100"
                    }`}
                  >
                    <CreditCard
                      size={18}
                      className={
                        currentStep === "payment"
                          ? "text-primary"
                          : "text-zinc-400"
                      }
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900">
                      Payment method
                    </p>
                    <p className="text-xs text-zinc-500">Choose how to pay</p>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {currentStep === "payment" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 space-y-4 border-t border-zinc-100 pt-4">
                      {/* RAZORPAY OPTION */}
                      <motion.label
                        whileHover={{ scale: 1.01 }}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === "razorpay"
                            ? "border-primary bg-primary-light"
                            : "border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="razorpay"
                          checked={paymentMethod === "razorpay"}
                          onChange={() => setPaymentMethod("razorpay")}
                          className="accent-primary"
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-zinc-200">
                            <CreditCard size={18} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">
                              Pay online
                            </p>
                            <p className="text-xs text-zinc-500">
                              UPI, Cards, Net Banking via Razorpay
                            </p>
                          </div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-lg font-medium">
                          Recommended
                        </span>
                      </motion.label>

                      {/* COD OPTION */}
                      <motion.label
                        whileHover={{ scale: 1.01 }}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === "cod"
                            ? "border-primary bg-primary-light"
                            : "border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          className="accent-primary"
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-zinc-200">
                            <Truck size={18} className="text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">
                              Cash on delivery
                            </p>
                            <p className="text-xs text-zinc-500">
                              Pay when your order arrives
                            </p>
                          </div>
                        </div>
                      </motion.label>

                      {/* PLACE ORDER BUTTON */}
                      <Button
                        type="submit"
                        disabled={isPlacingOrder || isProcessingPayment}
                        className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-semibold mt-2"
                      >
                        {isPlacingOrder || isProcessingPayment ? (
                          <span className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            {isProcessingPayment
                              ? "Processing payment..."
                              : "Placing order..."}
                          </span>
                        ) : (
                          `Place order • ${formatCurrency(finalTotal)}`
                        )}
                      </Button>

                      <p className="text-xs text-zinc-400 text-center">
                        By placing your order you agree to our{" "}
                        <span className="underline cursor-pointer">
                          Terms of Service
                        </span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.form>
        </div>

        {/* RIGHT — ORDER SUMMARY */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5 sticky top-24">
            <h2 className="font-bold text-zinc-900">
              Order summary ({items?.length} items)
            </h2>

            {/* ITEMS */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items?.map((item) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-14 h-14 bg-zinc-50 rounded-xl overflow-hidden shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-900 line-clamp-2">
                      {item.name}
                    </p>
                    {item.variant && (
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {item.variant.color} {item.variant.size}
                      </p>
                    )}
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-zinc-900 shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="h-px bg-zinc-100" />

            {/* PRICE BREAKDOWN */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-green-600">
                    <Tag size={13} />
                    Coupon discount
                  </span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(discount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Delivery</span>
                <span
                  className={`font-medium ${
                    deliveryCharge === 0 ? "text-green-600" : "text-zinc-900"
                  }`}
                >
                  {deliveryCharge === 0
                    ? "Free"
                    : formatCurrency(deliveryCharge)}
                </span>
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            <div className="flex justify-between">
              <span className="font-bold text-zinc-900">Total</span>
              <span className="font-bold text-xl text-primary">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            {/* SECURE BADGE */}
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 bg-zinc-50 rounded-xl p-3">
              <span>🔒</span>
              <span>Secure checkout powered by Razorpay</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
