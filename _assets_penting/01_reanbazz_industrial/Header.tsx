"use client";

import { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "About", href: "#about" },
    { name: "Products", href: "#products" },
    { name: "Brand", href: "#brands" },
    { name: "Service", href: "#services" },
    { name: "Article", href: "#articles" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "bg-darker py-4 border-border shadow-lg shadow-black/50"
          : "bg-transparent py-5 border-transparent"
      }`}
    >
      <div className="container-custom flex justify-between items-center">
        {/* Logo */}
        <div className="logo z-50">
          <Link href="#">
            <h2 className="!mb-0 text-white font-bai font-bold text-2xl tracking-wider">
              Rean<span className="text-primary">.</span>
            </h2>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:block">
          <ul className="flex gap-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-[0.95rem] font-medium uppercase tracking-wide hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-5 z-50">
          <button className="text-white hover:text-primary transition-colors">
            <Search size={20} />
          </button>
          
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <div
        className={`fixed inset-0 bg-darker/95 backdrop-blur-md z-40 transition-transform duration-300 flex flex-col items-center justify-center lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <ul className="flex flex-col gap-8 text-center">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className="text-2xl font-bai font-semibold uppercase hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
