'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/menu', label: 'Menu' },
    { href: '/about', label: 'Tentang' },
    { href: '/contact', label: 'Kontak' },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-tight text-primary transition-colors group-hover:text-accent">
              BazzCafe
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-accent transition-all hover:translate-y-[-1px]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />
            <Link href="/feedback" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
              Feedback
            </Link>
            <Link href="/reservation">
              <Button variant="outline" size="sm" className="rounded-full border-accent text-accent hover:bg-accent hover:text-white transition-all">
                Reserve
              </Button>
            </Link>
            <Link href="/menu">
              <Button size="sm" className="gap-2 rounded-full shadow-md hover:shadow-lg transition-all">
                <ShoppingCart className="w-4 h-4" />
                Menu
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-border pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm font-medium text-foreground/80 hover:text-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/feedback" className="block text-sm font-medium text-foreground/80 hover:text-accent transition-colors">
              Feedback
            </Link>
            <Link href="/reservation" onClick={() => setIsOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">
                Reserve
              </Button>
            </Link>
            <Link href="/menu" onClick={() => setIsOpen(false)}>
              <Button size="sm" className="w-full gap-2">
                <ShoppingCart className="w-4 h-4" />
                Menu
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
