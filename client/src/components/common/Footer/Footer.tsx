"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Track Order", href: "/orders" },
    { label: "Returns", href: "/returns" },
    { label: "Contact Us", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Refund Policy", href: "/refund" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "Youtube" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    toast.success("Subscribed successfully!");
    setEmail("");
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400">
      {/* NEWSLETTER SECTION */}
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-white text-xl font-bold">Stay in the loop</h3>
              <p className="text-zinc-400 text-sm">
                Get the latest deals and product updates straight to your inbox.
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-primary w-full md:w-72"
              />
              <Button
                onClick={handleSubscribe}
                className="h-11 bg-primary hover:bg-primary-hover text-white px-5 shrink-0"
              >
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* BRAND COLUMN */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-white text-lg">ShopZone</span>
            </Link>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
              Your one-stop destination for everything you need. Quality
              products, fast delivery, and exceptional service.
            </p>

            {/* CONTACT INFO */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-primary shrink-0" />
                <span>support@shopzone.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-primary shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-primary shrink-0" />
                <span>Bengaluru, Karnataka, India</span>
              </div>
            </div>

            {/* SOCIAL LINKS */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-primary flex items-center justify-center transition-colors"
                >
                  <Icon size={16} className="text-zinc-400 hover:text-white" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* LINKS COLUMNS */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} ShopZone. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Image
                src="/visa.svg"
                alt="Visa"
                className="h-6 opacity-40 hover:opacity-70 transition-opacity"
              />
              <Image
                src="/mastercard.svg"
                alt="Mastercard"
                className="h-6 opacity-40 hover:opacity-70 transition-opacity"
              />
              <Image
                src="/razorpay.svg"
                alt="Razorpay"
                className="h-6 opacity-40 hover:opacity-70 transition-opacity"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
