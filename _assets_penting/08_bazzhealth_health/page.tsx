"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Pill, 
  Activity, 
  ShieldCheck, 
  Truck, 
  Search, 
  Menu, 
  ArrowRight, 
  Syringe,
  HeartPulse,
  Sparkles,
  PhoneCall,
  ShoppingBag
} from 'lucide-react';
import PromoPopup from '@/components/PromoPopup';
import LoginDemoModal from '@/components/LoginDemoModal';
import { products, formatPrice } from '@/lib/products';

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
      <LoginDemoModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <PromoPopup />
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white shadow-[0_2px_10px_rgb(0,0,0,0.05)] border-b border-slate-100/50">
        <nav className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-[88px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl leading-none">+</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a] tracking-tight">bazzhealth</h1>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            <div className="relative group">
              <a href="#" className="text-[15px] font-bold text-[#23A455]">Beranda</a>
              <div className="absolute -bottom-[32px] left-0 w-full h-[3px] bg-[#23A455] rounded-t-full"></div>
            </div>
            <a href="#produk" className="text-[15px] font-semibold text-slate-600 hover:text-[#23A455] transition-colors">Produk</a>
            <a href="#kategori" className="text-[15px] font-semibold text-slate-600 hover:text-[#23A455] transition-colors">Kategori</a>
            <a href="/penawaran" className="text-[15px] font-semibold text-slate-600 hover:text-[#23A455] transition-colors">Promo</a>
            <a href="#tentang" className="text-[15px] font-semibold text-slate-600 hover:text-[#23A455] transition-colors">Tentang Kami</a>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button className="text-slate-600 hover:text-[#23A455] transition-colors p-2">
              <Search className="w-[22px] h-[22px]" />
            </button>
            <Link href="/keranjang" className="relative cursor-pointer text-slate-600 hover:text-[#23A455] transition-colors p-2">
              <ShoppingBag className="w-[22px] h-[22px]" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#23A455] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white box-content">
                0
              </span>
            </Link>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-3 bg-[#23A455] text-white text-[15px] font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 active:scale-95 ml-2">
              Masuk / Daftar
            </button>
          </div>
          
          <div className="md:hidden flex items-center gap-4">
            <div className="relative cursor-pointer text-slate-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <button className="text-slate-600 p-2">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        className="relative pb-16 md:pb-20"
        style={{
          backgroundImage: "url('/images/hero-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">
          <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[520px] md:min-h-[600px]">

            {/* Layer 2 — Left: Text Content */}
            <div className="max-w-[540px] relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-green-100 text-[#23A455] text-sm font-bold mb-6 shadow-sm">
                <ShieldCheck className="w-[18px] h-[18px]" strokeWidth={2.5} />
                <span>Apotek Online Terpercaya</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-[58px] font-extrabold text-[#1a1a1a] tracking-tight leading-[1.1] mb-5">
                Sehat itu mudah,<br />
                <span className="text-[#23A455]">bazzhealth</span> solusinya.
              </h2>

              <p className="text-[16px] md:text-[17px] text-[#4a5568] mb-10 leading-relaxed font-medium max-w-[440px]">
                Dapatkan obat, vitamin, dan kebutuhan kesehatan lengkap dengan harga terbaik dan pengiriman cepat langsung ke rumah Anda.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-14 lg:mb-16">
                <button className="px-8 py-[17px] bg-[#23A455] text-white font-bold rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(35,164,85,0.35)]">
                  <ShoppingBag className="w-5 h-5" strokeWidth={2.5} />
                  Belanja Sekarang
                </button>
                <button className="px-8 py-[17px] bg-white text-[#1a1a1a] font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-[0_4px_14px_rgba(0,0,0,0.08)] border border-white">
                  <ShieldCheck className="w-5 h-5 text-[#23A455]" strokeWidth={2.5} />
                  100% Original
                </button>
              </div>
            </div>

            {/* Layer 3 — Right: 3D Object Image */}
            <div className="relative z-10 flex items-center justify-center">
              {/* Desktop: large, positioned to bleed out */}
              <img
                src="/images/hero-3d-obj.png"
                alt="Bazzhealth 3D Product Mockup"
                className="
                  w-[340px] sm:w-[420px] md:w-[520px] lg:w-[620px] xl:w-[700px]
                  h-auto object-contain
                  lg:translate-x-8 xl:translate-x-16
                  drop-shadow-2xl
                "
              />
            </div>

          </div>
        </div>

        {/* Removed floating bar from inside section */}
      </section>

      {/* Info Bar — standalone, overlapping hero bottom */}
      <div className="relative z-20 px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-14">
        <div className="max-w-[1100px] mx-auto">
          <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 overflow-hidden border border-slate-100">
            
            <div className="flex items-center gap-5 px-8 py-6 group hover:bg-green-50/40 transition-colors">
              <div className="w-12 h-12 bg-[#23A455]/10 text-[#23A455] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#23A455] group-hover:text-white transition-all duration-300">
                <Truck className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-[15px] leading-tight">Pengiriman Cepat</p>
                <p className="text-[13px] text-slate-500 mt-0.5">Sampai di hari yang sama</p>
              </div>
            </div>

            <div className="flex items-center gap-5 px-8 py-6 group hover:bg-green-50/40 transition-colors">
              <div className="w-12 h-12 bg-[#23A455]/10 text-[#23A455] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#23A455] group-hover:text-white transition-all duration-300">
                <ShieldCheck className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-[15px] leading-tight">100% Original</p>
                <p className="text-[13px] text-slate-500 mt-0.5">Jaminan produk asli</p>
              </div>
            </div>

            <div className="flex items-center gap-5 px-8 py-6 group hover:bg-green-50/40 transition-colors">
              <div className="w-12 h-12 bg-[#23A455]/10 text-[#23A455] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#23A455] group-hover:text-white transition-all duration-300">
                <PhoneCall className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-[15px] leading-tight">Layanan 24/7</p>
                <p className="text-[13px] text-slate-500 mt-0.5">Siap membantu Anda</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Gap between info bar and products */}
      <div className="h-12 md:h-16 bg-white"></div>


      {/* Global Search Bar */}
      <section className="relative z-20 hidden">
         {/* Hidden since navbar search and hero is enough, per mockup this is not prominent here */}
      </section>

      {/* Popular Products */}
      <section id="produk" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Paling Sering Dicari</h2>
            <p className="text-slate-600">Obat dan vitamin yang paling banyak dibeli minggu ini.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all">
                <Link href={`/produk/${product.id}`} className="h-48 bg-slate-50 relative flex items-center justify-center p-6 block">
                  {product.label && (
                    <span className="absolute top-4 left-4 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider z-10">
                      {product.label}
                    </span>
                  )}
                  <img src={product.img} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 drop-shadow-md" />
                </Link>
                <div className="p-5 flex flex-col flex-1">
                  <Link href={`/produk/${product.id}`}>
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 hover:text-[#23A455] transition-colors">{product.name}</h3>
                  </Link>
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      {product.originalPrice && (
                        <p className="text-xs text-slate-400 line-through mb-0.5">{formatPrice(product.originalPrice)}</p>
                      )}
                      <p className="text-lg font-bold text-[#23A455]">{formatPrice(product.price)}</p>
                    </div>
                    <Link href={`/produk/${product.id}`}
                      className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-[#23A455] transition-colors">
                      <ShoppingBag className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Jelajahi Kategori</h2>
              <p className="text-slate-600">Ribuan produk kesehatan siap dikirim ke alamat Anda hari ini juga.</p>
            </div>
            <button className="text-[#23A455] font-semibold hover:text-emerald-700 flex items-center gap-1 group">
              Lihat Semua <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: Pill, name: 'Obat Resep', count: '1.2k+ Produk' },
              { icon: Syringe, name: 'Suplemen', count: '850+ Produk' },
              { icon: ShieldCheck, name: 'P3K', count: '420+ Produk' },
              { icon: Sparkles, name: 'Perawatan Diri', count: '930+ Produk' },
              { icon: Activity, name: 'Alat Medis', count: '150+ Produk' }
            ].map((cat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer group flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-50 transition-colors">
                  <cat.icon className="w-6 h-6 text-slate-600 group-hover:text-[#23A455] transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{cat.name}</h3>
                <p className="text-xs text-slate-500">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-[#1a1a1a] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://api.dicebear.com/7.x/shapes/svg?seed=health&backgroundColor=0f172a')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Siap untuk Pengalaman Baru?</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
            Bergabunglah dengan puluhan ribu pelanggan lainnya. Instal aplikasi bazzhealth sekarang dan nikmati ongkos kirim gratis untuk pesanan pertama Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-[#23A455] text-white font-bold rounded-full hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25">
              Unduh Aplikasi
            </button>
            <button className="px-8 py-4 bg-[#2a2a2a] text-white font-bold rounded-full hover:bg-[#333] transition-colors border border-[#444]">
              Lihat Promo Tersedia
            </button>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <HeartPulse className="text-[#23A455] w-6 h-6" />
            <span className="font-bold text-slate-900 text-lg">bazzhealth</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-slate-500 font-medium">
            <a href="#" className="hover:text-slate-900 transition-colors">Tentang Kami</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Bantuan</a>
          </div>
          <p className="text-sm text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} bazzhealth Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
