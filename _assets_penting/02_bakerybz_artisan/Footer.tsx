"use client";

import { ArrowUp, MessageCircle } from "lucide-react";
import Link from "next/link";

const WA_NUMBER = "628123456789";
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo Delycia! Mau order kue nih 🎂")}`;


export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-bakery-text pt-24 pb-12 text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="md:col-span-1">
            <h2 className="text-3xl font-bold tracking-tighter mb-4">Delycia.</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-8">
              Baking memories daily since 2015. We believe in the magic of natural ingredients and traditional techniques.
            </p>
            <div className="flex gap-4">
              {["IG", "FB", "TW"].map((soc) => (
                <div key={soc} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-xs font-bold hover:bg-white hover:text-bakery-text transition-all cursor-pointer">
                  {soc}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-8 uppercase tracking-widest text-xs text-bakery-accent">Shop</h4>
            <ul className="space-y-4 text-white/60 text-sm">
              <li><Link href="#menu" className="hover:text-white transition-colors">Our Menu</Link></li>
              <li><Link href="#order" className="hover:text-white transition-colors">Custom Cakes</Link></li>
              <li><Link href="#promo" className="hover:text-white transition-colors">Promotions</Link></li>
              <li><Link href="#shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-8 uppercase tracking-widest text-xs text-bakery-accent">Company</h4>
            <ul className="space-y-4 text-white/60 text-sm">
              <li><Link href="#story" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="#outlets" className="hover:text-white transition-colors">Locations</Link></li>
              <li><Link href="#careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-8 uppercase tracking-widest text-xs text-bakery-accent">Newsletter</h4>
            <p className="text-white/50 text-sm mb-6">Subscribe to get fresh updates and special offers.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email address" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm flex-grow outline-none focus:border-bakery-accent transition-colors" />
              <button className="bg-bakery-accent px-6 py-3 rounded-xl font-bold text-xs hover:scale-105 transition-all">Join</button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-white/30 text-[10px] uppercase tracking-widest">
            &copy; 2026 Delycia Bakery & Cake. All rights reserved. Created with ❤️ by Bazzcuy.
          </p>
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-4 text-[10px] font-black tracking-[0.2em] uppercase hover:text-bakery-accent transition-colors group"
          >
            Back to Top
            <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center group-hover:border-bakery-accent transition-colors">
              <ArrowUp size={16} />
            </div>
          </button>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white px-6 py-4 rounded-full flex items-center gap-3 shadow-2xl shadow-[#25D366]/40 hover:scale-105 active:scale-95 transition-all font-bold text-sm"
      >
        <MessageCircle size={22} fill="white" />
        <span className="hidden sm:inline">Chat WhatsApp</span>
      </a>
    </footer>
  );
}
