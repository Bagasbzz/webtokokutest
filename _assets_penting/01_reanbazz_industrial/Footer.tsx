"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="py-12 md:py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {/* Col 1 */}
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Rean<span className="text-primary">.</span>
              </h3>
              <p className="text-text-muted mb-6">
                Trusted heavy equipment supplier in Indonesia since 2014, providing quality products, services, and spare parts.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-primary hover:text-black hover:-translate-y-1 transition-all">
                  <FaFacebookF size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-primary hover:text-black hover:-translate-y-1 transition-all">
                  <FaInstagram size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-primary hover:text-black hover:-translate-y-1 transition-all">
                  <FaLinkedinIn size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-primary hover:text-black hover:-translate-y-1 transition-all">
                  <FaTiktok size={18} />
                </a>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-xl mb-6">Quick Links</h4>
              <ul className="flex flex-col gap-4">
                <li><Link href="#" className="text-text-muted hover:text-primary hover:pl-2 transition-all">Home</Link></li>
                <li><Link href="#about" className="text-text-muted hover:text-primary hover:pl-2 transition-all">About</Link></li>
                <li><Link href="#products" className="text-text-muted hover:text-primary hover:pl-2 transition-all">Products</Link></li>
                <li><Link href="#brands" className="text-text-muted hover:text-primary hover:pl-2 transition-all">Brand</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-xl mb-6">Explore</h4>
              <ul className="flex flex-col gap-4">
                <li><Link href="#services" className="text-text-muted hover:text-primary hover:pl-2 transition-all">Service</Link></li>
                <li><Link href="#articles" className="text-text-muted hover:text-primary hover:pl-2 transition-all">Article</Link></li>
                <li><Link href="#contact" className="text-text-muted hover:text-primary hover:pl-2 transition-all">Contact</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="text-xl mb-6">Brochure</h4>
              <p className="text-text-muted mb-6">Download our latest company profile and product catalog.</p>
              <button className="btn btn-outline py-3 px-6 text-sm">Download Brochure</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[#050505] py-5 text-center text-sm text-text-muted">
        <div className="container-custom">
          <p>Copyright &copy; PT Rean Alat Berat 2025</p>
        </div>
      </div>
    </footer>
  );
}
