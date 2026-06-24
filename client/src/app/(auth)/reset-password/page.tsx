"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/config/constants";

const schema = yup.object({
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { resetPassword, isResetPasswordLoading } = useAuth();

  // REDIRECT IF NO TOKEN
  useEffect(() => {
    if (!token) router.push(ROUTES.FORGOT_PASSWORD);
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    await resetPassword(token, data.password);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ICON */}
      <motion.div variants={itemVariants}>
        <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6">
          <KeyRound className="text-zinc-700" size={26} />
        </div>
      </motion.div>

      {/* HEADER */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900">
          Reset your password
        </h2>
        <p className="text-zinc-500 text-sm leading-relaxed">
          Enter your new password below.
        </p>
      </motion.div>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* NEW PASSWORD */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="password" className="text-zinc-700">
            New password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
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
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </motion.div>

        {/* CONFIRM PASSWORD */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-zinc-700">
            Confirm new password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repeat your password"
              className={`h-11 pr-10 ${
                errors.confirmPassword
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs">
              {errors.confirmPassword.message}
            </p>
          )}
        </motion.div>

        {/* SUBMIT */}
        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            disabled={isResetPasswordLoading}
            className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white"
          >
            {isResetPasswordLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Resetting password...
              </span>
            ) : (
              "Reset password"
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
