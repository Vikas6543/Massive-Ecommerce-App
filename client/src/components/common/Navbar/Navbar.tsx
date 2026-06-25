"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Bell,
  Search,
  Menu,
  X,
  User,
  Package,
  Heart,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";
import { ROUTES } from "@/config/constants";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const { user, isLoggedIn, logoutUser } = useAuth();
  const cartCount = useAppSelector((state) => state.cart.totalItems);
  const unreadCount = useAppSelector((state) => state.notification.unreadCount);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-zinc-900 text-lg">ShopZone</span>
          </Link>

          {/* NAV LINKS — desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    pathname === link.href
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-2">
            {/* SEARCH */}
            <Link href={ROUTES.SEARCH}>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-600 hover:text-zinc-900"
              >
                <Search size={20} />
              </Button>
            </Link>

            {/* CART */}
            <Link href={ROUTES.CART}>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-zinc-600 hover:text-zinc-900"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </Button>
            </Link>

            {isLoggedIn && user ? (
              <>
                {/* NOTIFICATIONS */}
                <Link href="/notifications">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-zinc-600 hover:text-zinc-900"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </motion.span>
                    )}
                  </Button>
                </Link>

                {/* USER DROPDOWN */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-50 transition-colors">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium text-zinc-700">
                        {user.name.split(" ")[0]}
                      </span>
                      <ChevronDown size={14} className="text-zinc-400" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-3 py-2 border-b border-zinc-100">
                      <p className="text-sm font-medium text-zinc-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <DropdownMenuItem asChild>
                      <Link
                        href={ROUTES.PROFILE}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <User size={15} className="text-zinc-500" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href={ROUTES.ORDERS}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Package size={15} className="text-zinc-500" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href={ROUTES.WISHLIST}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Heart size={15} className="text-zinc-500" />
                        Wishlist
                      </Link>
                    </DropdownMenuItem>

                    {/* SELLER / ADMIN DASHBOARD */}
                    {(user.role === "seller" || user.role === "admin") && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href={
                              user.role === "admin"
                                ? ROUTES.ADMIN_DASHBOARD
                                : ROUTES.SELLER_DASHBOARD
                            }
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <LayoutDashboard
                              size={15}
                              className="text-indigo-500"
                            />
                            <span className="text-indigo-600 font-medium">
                              {user.role === "admin"
                                ? "Admin Panel"
                                : "Seller Dashboard"}
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={logoutUser}
                      className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer"
                    >
                      <LogOut size={15} />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* NOT LOGGED IN */
              <div className="hidden sm:flex items-center gap-2">
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm" className="text-zinc-600">
                    Sign in
                  </Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-indigo-700 text-white"
                  >
                    Sign up
                  </Button>
                </Link>
              </div>
            )}

            {/* MOBILE MENU BUTTON */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-zinc-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      pathname === link.href
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              {!isLoggedIn && (
                <div className="flex gap-2 pt-2">
                  <Link href={ROUTES.LOGIN} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Sign in
                    </Button>
                  </Link>
                  <Link href={ROUTES.REGISTER} className="flex-1">
                    <Button
                      className="w-full bg-primary hover:bg-indigo-700 text-white"
                      size="sm"
                    >
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
