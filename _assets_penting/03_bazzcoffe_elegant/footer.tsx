import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-primary">BazzCafe</h3>
            <p className="text-sm text-foreground/70">
              Ngopi Santai, Rasa Juara. Experience premium coffee and authentic Indonesian cafe culture.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-foreground/70 hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-sm text-foreground/70 hover:text-accent transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-foreground/70 hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/reservation" className="text-sm text-foreground/70 hover:text-accent transition-colors">
                  Reservation
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Hours</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>Monday - Friday</li>
              <li className="font-medium text-foreground">8:00 AM - 9:00 PM</li>
              <li className="mt-3">Saturday - Sunday</li>
              <li className="font-medium text-foreground">9:00 AM - 10:00 PM</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-foreground/70">
                <Phone className="w-4 h-4 text-accent" />
                +62 812 3456 7890
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground/70">
                <Mail className="w-4 h-4 text-accent" />
                hello@bazzcafe.com
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground/70">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span>Jl. Kopi Premium No. 42<br />Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-foreground/70">
              &copy; 2024 BazzCafe. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-foreground/70 hover:text-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-foreground/70 hover:text-accent transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-foreground/70 hover:text-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
