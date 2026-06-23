"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { RegisterRequest } from "@/types/auth.types";
import { ROUTES } from "@/config/constants";

// VALIDATION SCHEMA
const schema = yup.object({
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .required("Password is required"),
});

// ANIMATION VARIANTS
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isRegisterLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterRequest) => {
    await registerUser(data);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* HEADER */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h2 className="text-2xl font-bold text-zinc-900">
          Create your account
        </h2>
      </motion.div>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* NAME */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="name" className="text-zinc-700">
            Full name
          </Label>
          <Input
            id="name"
            placeholder="John Doe"
            className={`h-11 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}
        </motion.div>

        {/* EMAIL */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="email" className="text-zinc-700">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            className={`h-11 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </motion.div>

        {/* PASSWORD */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="password" className="text-zinc-700">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              className={`h-11 pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </motion.div>

        {/* SUBMIT */}
        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            disabled={isRegisterLoading}
            className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white mt-2"
          >
            {isRegisterLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </Button>
        </motion.div>

        {/* Already have an account */}
        <motion.div variants={itemVariants}>
          <p className="text-zinc-500 text-[13px] text-center">
            Already have an account?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="text-zinc-900 font-medium underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </form>

      {/* TERMS */}
      <motion.p
        variants={itemVariants}
        className="text-xs text-zinc-400 text-center"
      >
        By creating an account you agree to our{" "}
        <span className="underline cursor-pointer">Terms of Service</span> and{" "}
        <span className="underline cursor-pointer">Privacy Policy</span>
      </motion.p>
    </motion.div>
  );
}
