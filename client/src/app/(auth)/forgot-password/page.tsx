"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { Loader2, KeyRound } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/config/constants";

const schema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const { forgotPassword, isForgotPasswordLoading } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    const success = await forgotPassword(data.email);
    if (success) {
      reset();
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* HEADER */}
      <motion.div variants={itemVariants} className="flex gap-4">
        <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mb-3">
          <KeyRound className="text-zinc-700" size={26} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">
            Forgot your password?
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>
      </motion.div>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            disabled={isForgotPasswordLoading}
            className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white"
          >
            {isForgotPasswordLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Sending reset link...
              </span>
            ) : (
              "Send reset link"
            )}
          </Button>
        </motion.div>
      </form>

      {/* BACK TO LOGIN */}
      <motion.div variants={itemVariants} className="text-center">
        <Link
          href={ROUTES.LOGIN}
          className="text-sm text-zinc-500 hover:text-zinc-900 underline underline-offset-4 transition-colors"
        >
          Back to login
        </Link>
      </motion.div>
    </motion.div>
  );
}
