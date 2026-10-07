"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function FloatingButtons() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/628123456789"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[999] w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/40 hover:scale-110 hover:bg-[#1ebe5d] transition-all duration-300"
      >
        <FaWhatsapp size={32} />
      </a>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 left-8 z-[999] w-14 h-14 bg-card border border-border text-white rounded-full flex items-center justify-center hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 ${
          isVisible ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <ArrowUp size={24} />
      </button>
    </>
  );
}
