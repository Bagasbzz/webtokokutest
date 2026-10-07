"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageCircle } from "lucide-react";
import Link from "next/link";

const WA_NUMBER = "628123456789";
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo Delycia! Saya mau order kue 🎂")}`;

const navItems = [
  { label: "Menu", href: "#menu" },
  { label: "Promo", href: "#promo" },
  { label: "Custom Cake", href: "#custom" },
  { label: "Outlet", href: "#outlets" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "py-3 glass shadow-sm" : "py-6 bg-transparent"}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="group flex flex-col">
          <span className="text-2xl font-black tracking-tighter text-bakery-text group-hover:text-bakery-accent transition-colors leading-none">
            Delycia.
          </span>
          <span className="text-[9px] uppercase tracking-[0.25em] text-bakery-text-secondary font-medium">
            Artisanal Bakery
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-bakery-text/70 hover:text-bakery-accent transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#1ebe5a] transition-all"
          >
            <MessageCircle size={15} fill="white" />
            Order WA
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-bakery-bg-alt text-bakery-text"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-bakery-bg border-b border-black/5 px-6 py-8 flex flex-col gap-6 md:hidden shadow-2xl"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-xl font-bold text-bakery-text hover:text-bakery-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-[#25D366] text-white w-full py-4 rounded-2xl font-bold mt-2"
            >
              <MessageCircle size={18} fill="white" />
              Order via WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
