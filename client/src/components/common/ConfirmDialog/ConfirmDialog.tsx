"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmDialogVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  isLoading?: boolean;
  icon?: "trash" | "logout" | "warning";
}

const iconMap = {
  trash: Trash2,
  logout: LogOut,
  warning: AlertTriangle,
};

const variantStyles = {
  danger: {
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    confirmBtn: "bg-red-500 hover:bg-red-600 text-white",
  },
  warning: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    confirmBtn: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  info: {
    iconBg: "bg-primary-light",
    iconColor: "text-primary",
    confirmBtn: "bg-primary hover:bg-primary-hover text-white",
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  icon = "warning",
}: ConfirmDialogProps) {
  const styles = variantStyles[variant];
  const Icon = iconMap[icon];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* DIALOG */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              {/* CLOSE BUTTON */}
              <div className="flex justify-end p-4 pb-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </motion.button>
              </div>

              {/* CONTENT */}
              <div className="px-6 pb-6 space-y-5">
                <div className="flex flex-col items-center gap-4 text-center">
                  {/* ICON */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className={`w-12 h-12 ${styles.iconBg} rounded-2xl flex items-center justify-center`}
                  >
                    <Icon size={19} className={styles.iconColor} />
                  </motion.div>

                  {/* TEXT */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-2"
                  >
                    <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      {description}
                    </p>
                  </motion.div>
                </div>

                {/* ACTIONS */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3 pt-2"
                >
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 h-11 border-zinc-200 text-zinc-600 hover:text-zinc-900"
                  >
                    {cancelText}
                  </Button>
                  <Button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`flex-1 h-11 ${styles.confirmBtn}`}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Please wait...
                      </span>
                    ) : (
                      confirmText
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
