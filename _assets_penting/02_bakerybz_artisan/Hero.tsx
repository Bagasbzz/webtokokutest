"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { MessageCircle } from "lucide-react";

const WA_NUMBER = "628123456789";
const WA_MSG = encodeURIComponent("Halo Delycia! Saya mau order kue 🎂");
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;
import Image from "next/image";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section ref={ref} className="relative min-h-[100vh] pt-32 pb-10 bg-bakery-bg flex items-center overflow-hidden">
      {/* Massive Background Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden h-full z-0">
        <h1 className="text-[25vw] font-black tracking-tighter leading-none text-bakery-text whitespace-nowrap select-none">DELYCIA</h1>
      </div>

      <div className="container mx-auto px-6 h-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[75vh]">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center relative">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center gap-4 mb-8">
                <span className="w-12 h-[2px] bg-bakery-accent"></span>
                <span className="text-bakery-accent font-bold tracking-[0.2em] text-xs uppercase">Est. 2015 • Jakarta</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black tracking-tighter text-bakery-text leading-[0.85] mb-8">
                Taste <br/>
                <span className="text-bakery-accent italic font-light serif text-5xl md:text-7xl lg:text-[100px] mr-4 relative top-[-10px]">the</span> 
                Artisan <br/>
                Difference.
              </h1>
              
              <div className="border-l-4 border-bakery-accent pl-6 ml-2 mb-12">
                <p className="text-lg md:text-xl text-bakery-text-secondary max-w-md leading-relaxed font-medium">
                  Experience the true art of baking. Every loaf and cake is crafted with 100% natural ingredients and recipes passed down through generations.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 items-center">
                <button className="bg-bakery-text text-white px-10 py-5 rounded-full font-bold hover:bg-bakery-accent transition-all duration-300 shadow-2xl hover:shadow-bakery-accent/30 hover:-translate-y-1">
                  Explore Menu
                </button>
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-5 rounded-full font-bold hover:bg-[#1ebe5a] transition-all hover:-translate-y-1 shadow-xl shadow-[#25D366]/20"
                >
                  <MessageCircle size={18} fill="white" />
                  Chat WA
                </a>
                <div className="flex items-center">
                  <div className="flex -space-x-4">
                    <div className="w-14 h-14 rounded-full border-4 border-bakery-bg overflow-hidden relative shadow-md">
                       <Image src="/matcha.png" alt="Matcha" fill className="object-cover" />
                    </div>
                    <div className="w-14 h-14 rounded-full border-4 border-bakery-bg overflow-hidden relative shadow-md">
                       <Image src="/cheese.png" alt="Cheese" fill className="object-cover" />
                    </div>
                    <div className="w-14 h-14 rounded-full border-4 border-bakery-bg bg-bakery-accent flex items-center justify-center text-white text-sm font-bold relative z-10 shadow-md">
                       50+
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col">
                    <span className="text-sm font-black text-bakery-text">Daily Items</span>
                    <span className="text-xs text-bakery-text-secondary font-medium">Freshly baked</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Visual Composition */}
          <div className="lg:col-span-5 relative h-[60vh] lg:h-[85vh] w-full mt-12 lg:mt-0">
            {/* Main Hero Image (Arch) */}
            <motion.div 
              style={{ y: y1 }}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="absolute right-0 top-0 w-[85%] h-[90%] rounded-t-[200px] rounded-b-[40px] overflow-hidden shadow-2xl z-10 border-8 border-white/50"
            >
              <Image 
                src="/hero.png" 
                alt="Signature Bakery" 
                fill 
                className="object-cover object-center"
                priority
              />
            </motion.div>

            {/* Overlapping Parallax Image */}
            <motion.div 
              style={{ y: y2 }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              className="absolute left-0 bottom-[5%] w-[55%] h-[45%] rounded-[40px] overflow-hidden shadow-2xl z-20 border-8 border-bakery-bg"
            >
              <Image 
                src="/chocolate.png" 
                alt="Chocolate Detail" 
                fill 
                className="object-cover"
              />
            </motion.div>

            {/* Rotating SVG Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8, type: "spring" }}
              className="absolute -left-6 lg:left-[-10%] top-[20%] w-36 h-36 bg-bakery-accent rounded-full flex items-center justify-center z-30 shadow-2xl border-8 border-bakery-bg"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="w-full h-full relative"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                  <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
                  <text className="text-[12px] font-black tracking-widest uppercase fill-white">
                    <textPath href="#circlePath" startOffset="0%">
                      BAKED FRESH DAILY • ARTISAN HEART • 
                    </textPath>
                  </text>
                </svg>
              </motion.div>
              {/* Inner Circle Dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
