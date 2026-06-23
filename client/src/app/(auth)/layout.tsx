// src/app/(auth)/layout.tsx

"use client";

import type { Metadata } from "next";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-950 p-12 text-white overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-zinc-950 font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-lg">ShopZone</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-zinc-400 text-sm uppercase tracking-widest font-medium">
              Trusted by thousands
            </p>
            <h1 className="text-4xl font-bold leading-tight">
              Everything you need,
              <br />
              <span className="text-zinc-400">delivered fast.</span>
            </h1>
          </div>
          <p className="text-zinc-400 text-base leading-relaxed max-w-sm">
            Shop from thousands of products across every category. Fast
            delivery, easy returns, and real-time order tracking.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {["A", "B", "C", "D"].map((letter, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-950 flex items-center justify-center text-xs font-medium text-zinc-300"
              >
                {letter}
              </div>
            ))}
          </div>
          <p className="text-zinc-400 text-sm">
            <span className="text-white font-medium">10,000+</span> happy
            customers
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — always white background forced */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-white text-zinc-900 min-h-screen">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-lg text-zinc-900">
              ShopZone
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
