"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      {/* Background Image with Zoom Animation via Tailwind/CSS */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero_banner.png"
          alt="Rean Heavy Equipment Background"
          fill
          priority
          className="object-cover animate-[zoomOut_10s_ease_infinite_alternate]"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/90 via-[#0b0b0b]/60 to-[#0b0b0b]/30"></div>
      </div>

      {/* Content */}
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="mb-6">
            LEADERS IN HEAVY EQUIPMENT FOR GROWING INDUSTRIES
          </h1>
          <p className="text-xl md:text-2xl text-text-muted mb-10 max-w-2xl font-light">
            Supplying world class brands and tailored solutions to meet your
            unique project needs.
          </p>
          <a href="#products" className="btn btn-primary inline-flex items-center gap-2">
            Explore Product <ArrowRight size={20} />
          </a>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes zoomOut {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.0); }
        }
      `}</style>
    </section>
  );
}
