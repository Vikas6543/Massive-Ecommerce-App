"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/config/constants";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { verifyEmailToken, isVerifyEmailTokenLoading } = useAuth();

  useEffect(() => {
    if (token) verifyEmailToken(token);
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center space-y-4"
    >
      <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center">
        {isVerifyEmailTokenLoading ? (
          <Loader2 className="text-zinc-700 animate-spin" size={26} />
        ) : (
          <CheckCircle className="text-green-600" size={26} />
        )}
      </div>

      <h2 className="text-2xl font-bold text-zinc-900">
        {isVerifyEmailTokenLoading
          ? "Verifying your email..."
          : "Email verified!"}
      </h2>

      <p className="text-zinc-500 text-sm">
        {isVerifyEmailTokenLoading
          ? "Please wait while we verify your email."
          : "Redirecting you to login..."}
      </p>
    </motion.div>
  );
}
