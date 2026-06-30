"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Package,
  Heart,
  Bell,
  Monitor,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const sidebarLinks = [
  { label: "My Profile", href: "/profile", icon: User },
  { label: "My Orders", href: "/orders", icon: Package },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Active Sessions", href: "/sessions", icon: Monitor },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading, logoutUser } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="h-64 bg-zinc-100 rounded-2xl animate-pulse" />
          <div className="lg:col-span-3 h-96 bg-zinc-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* SIDEBAR */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {/* USER CARD */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary-light text-primary font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-zinc-500 truncate pb-2">
                  {user.email}
                </p>
                <div className="flex items-center gap-1.5 border border-zinc-400 rounded-full px-2 py-1 w-fit">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-zinc-500 capitalize">
                    {user.role} account
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* NAV LINKS */}
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            {sidebarLinks.map(({ label, href, icon: Icon }, index) => {
              const isActive = pathname === href;
              return (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={href}
                    className={`flex items-center justify-between px-4 py-3.5 transition-colors border-b border-zinc-50 last:border-0 ${
                      isActive
                        ? "bg-primary-light text-primary"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <ChevronRight
                      size={14}
                      className={isActive ? "text-primary" : "text-zinc-300"}
                    />
                  </Link>
                </motion.div>
              );
            })}

            {/* LOGOUT */}
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={logoutUser}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={17} />
              <span className="text-sm font-medium">Logout</span>
            </motion.button>
          </div>
        </motion.aside>

        {/* MAIN CONTENT */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-3"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
