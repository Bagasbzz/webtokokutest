"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MessageCircle } from "lucide-react";

const WA_NUMBER = "628123456789";
const makeWaUrl = (item: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Halo Delycia! Saya mau order ${item} 🎂`)}`;

const products = [
  { id: 1, name: "Artisan Sourdough", category: "bread", price: "45k", desc: "Slow-fermented for 24 hours, extra crunchy crust.", img: "/hero.png" },
  { id: 2, name: "Dark Chocolate Ganache", category: "cake", price: "250k", desc: "70% Belgian chocolate, rich and decadent.", img: "/chocolate.png" },
  { id: 3, name: "Matcha Croissant", category: "pastry", price: "35k", desc: "Buttery layers with premium Uji matcha glaze.", img: "/matcha.png" },
  { id: 4, name: "Basque Cheesecake", category: "cake", price: "180k", desc: "Creamy, burnt-top perfection from Spain.", img: "/cheese.png" },
  { id: 5, name: "Red Velvet Special", category: "cake", price: "230k", desc: "Velvety sponge with cream cheese frosting.", img: "/redvelvet.png" },
  { id: 6, name: "Butter Fudge Brownies", category: "pastry", price: "25k", desc: "Fudgy, chocolatey, and incredibly soft.", img: "/chocolate.png" },
];

export default function MenuSection() {
  const [filter, setFilter] = useState("all");

  const filteredProducts = products.filter(p => filter === "all" || p.category === filter);

  return (
    <section className="py-24 bg-bakery-bg" id="menu">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="max-w-xl">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">Our Signature <span className="text-bakery-accent italic serif font-light">Menu</span></h2>
            <p className="text-bakery-text-secondary">From crusty sourdoughs to velvety cakes, discover the art of baking in every bite.</p>
          </div>
          
          <div className="flex gap-2 bg-bakery-bg-alt p-1.5 rounded-full border border-black/5 w-full md:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {["all", "bread", "cake", "pastry"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`shrink-0 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${filter === cat ? "bg-white text-bakery-accent shadow-sm" : "text-bakery-text-secondary hover:text-bakery-text"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-[32px] overflow-hidden border border-black/5 hover:shadow-2xl hover:shadow-black/5 transition-all group"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <Image 
                    src={product.img} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-bakery-accent">
                    {product.category}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-bakery-accent transition-colors">{product.name}</h3>
                  <p className="text-sm text-bakery-text-secondary mb-8 leading-relaxed">{product.desc}</p>
                  <div className="flex justify-between items-center pt-6 border-top border-black/5">
                    <span className="text-2xl font-black text-bakery-text">Rp {product.price}</span>
                    <a
                      href={makeWaUrl(product.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-2xl text-xs font-bold hover:bg-[#1ebe5a] transition-colors"
                    >
                      <MessageCircle size={14} fill="white" />
                      Order WA
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
