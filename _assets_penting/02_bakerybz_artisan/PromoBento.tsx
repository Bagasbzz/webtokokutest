"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MessageCircle, Tag, Coffee, Heart } from "lucide-react";

const WA_NUMBER = "628123456789";
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo Delycia! Saya mau tanya promo yang sedang berjalan 🎂")}`;

export default function PromoBento() {
  return (
    <section className="py-20 bg-bakery-bg" id="promo">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block text-bakery-accent font-bold tracking-[0.2em] text-xs uppercase mb-4">Penawaran Spesial</span>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
            Selalu Ada Yang <span className="text-bakery-accent italic serif font-light">Istimewa</span>
          </h2>
          <p className="text-bakery-text-secondary max-w-md mx-auto">Nikmati penawaran terbatas dan kreasi musiman yang sayang untuk dilewatkan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-1 md:grid-rows-2 gap-6" style={{ minHeight: "620px" }}>
          
          {/* Hero Promo Card */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="md:col-span-2 md:row-span-2 bg-[#3D2C1E] rounded-[40px] p-10 md:p-14 flex flex-col justify-end text-white relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D241E]/90 via-[#2D241E]/30 to-transparent z-10" />
            <div className="absolute inset-0 z-0">
              <Image src="/chocolate.png" alt="Sweet Weekend Promo" fill className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
            </div>
            <div className="relative z-20">
              <span className="inline-flex items-center gap-2 bg-bakery-accent text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                <Tag size={10} />
                Weekend Exclusive · Hemat 20%
              </span>
              <h3 className="text-4xl md:text-6xl font-black leading-none mb-4">
                Sweet<br/>Weekend!
              </h3>
              <p className="text-white/70 text-base mb-8 max-w-xs">
                Diskon 20% untuk semua signature cake setiap Sabtu & Minggu. Manjakan diri dengan kelezatan terbaik kami.
              </p>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 border-2 border-white/20 hover:bg-white hover:text-bakery-text px-8 py-4 rounded-full font-bold text-sm transition-all"
              >
                <MessageCircle size={16} />
                Klaim Promo via WA
              </a>
            </div>
          </motion.div>

          {/* Coffee Pairing */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-bakery-accent-soft rounded-[40px] p-10 flex flex-col justify-between border border-black/5 cursor-pointer group"
          >
            <div className="w-12 h-12 bg-bakery-accent/10 rounded-2xl flex items-center justify-center text-bakery-accent mb-6 group-hover:scale-110 transition-transform">
              <Coffee size={22} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-bakery-text mb-2">Pairing Kopi</h3>
              <p className="text-bakery-text-secondary text-sm leading-relaxed">Tambah segelas latte ke pastri mana pun, hanya Rp 15k. Pagi yang sempurna dimulai dari sini.</p>
            </div>
          </motion.div>

          {/* Loyalty */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-[40px] p-10 flex flex-col justify-between border border-black/5 cursor-pointer group"
          >
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 transition-transform">
              <Heart size={22} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-bakery-text mb-2">Program Loyalitas</h3>
              <p className="text-bakery-text-secondary text-sm leading-relaxed">Beli 5 roti, gratis 1! Bergabunglah dengan ribuan pelanggan setia keluarga Delycia.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
