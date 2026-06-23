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
import { LoginRequest } from "@/types/auth.types";
import { ROUTES } from "@/config/constants";

// VALIDATION SCHEMA
const schema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
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

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoginLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginRequest) => {
    await login(data);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* HEADER */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900">Welcome back</h2>
      </motion.div>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* EMAIL */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="email" className="text-zinc-700">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            className={`h-11 ${
              errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </motion.div>

        {/* PASSWORD */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <div className="flex items-center">
            <Label htmlFor="password" className="text-zinc-700">
              Password
            </Label>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={`h-11 pr-10 ${
                errors.password
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
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
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-xs flex justify-end text-zinc-500 hover:text-zinc-900 underline underline-offset-4 transition-colors"
          >
            Forgot password?
          </Link>
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </motion.div>

        {/* SUBMIT */}
        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            disabled={isLoginLoading}
            className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white mt-2"
          >
            {isLoginLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </motion.div>

        {/* Don't have an account */}
        <motion.div variants={itemVariants}>
          <p className="text-zinc-500 text-[13px] text-center">
            Don&apos;t have an account?{" "}
            <Link
              href={ROUTES.REGISTER}
              className="text-zinc-900 font-medium underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </form>

      {/* DIVIDER */}
      <motion.div
        variants={itemVariants}
        className="relative flex items-center gap-4"
      >
        <div className="flex-1 h-px bg-zinc-200" />
        <span className="text-xs text-zinc-400">or continue with</span>
        <div className="flex-1 h-px bg-zinc-200" />
      </motion.div>

      {/* GUEST BROWSE */}
      <motion.div variants={itemVariants}>
        <Link href={ROUTES.HOME}>
          <Button
            variant="outline"
            className="w-full h-11 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
          >
            Browse as guest
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
