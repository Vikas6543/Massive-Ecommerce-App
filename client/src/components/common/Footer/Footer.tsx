"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

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

// const socialLinks = [
//   { icon: Facebook, href: "#", label: "Facebook" },
//   { icon: Twitter, href: "#", label: "Twitter" },
//   { icon: Instagram, href: "#", label: "Instagram" },
//   { icon: Youtube, href: "#", label: "Youtube" },
// ];

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400">
      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* BRAND COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-5"
          >
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
              {/* <div className="flex items-center gap-3">
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
            </div> */}
            </div>
          </motion.div>

          {/* LINKS COLUMNS */}
          {Object.entries(footerLinks).map(([title, links], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="space-y-4"
            >
              <div key={title} className="space-y-4">
                <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
                  {title}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <motion.li
                      key={link.href}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </footer>
  );
}
