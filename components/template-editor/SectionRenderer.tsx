'use client'

/**
 * Section Renderer Component
 * 
 * Render section content berdasarkan type.
 * Ini adalah simplified renderer untuk editor mode.
 */

import type { SectionContent } from '@/lib/template-editor/types'

interface SectionRendererProps {
  type: string
  content: SectionContent
  sectionId: string
}

export function SectionRenderer({ type, content, sectionId }: SectionRendererProps) {
  switch (type) {
    case 'hero':
      return <HeroSection content={content as any} />
    case 'about':
      return <AboutSection content={content as any} />
    case 'contact':
      return <ContactSection content={content as any} />
    case 'footer':
      return <FooterSection content={content as any} />
    case 'menu_highlights':
      return <MenuHighlightsSection content={content as any} />
    case 'featured_products':
      return <FeaturedProductsSection content={content as any} />
    case 'benefits':
      return <BenefitsSection content={content as any} />
    case 'ingredients':
      return <IngredientsSection content={content as any} />
    case 'product_showcase':
      return <ProductShowcaseSection content={content as any} />
    case 'testimonials':
      return <TestimonialsSection content={content as any} />
    case 'services':
      return <ServicesSection content={content as any} />
    case 'certifications':
      return <CertificationsSection content={content as any} />
    default:
      return <div>Unknown section type: {type}</div>
  }
}

// Hero Section
function HeroSection({ content }: { content: any }) {
  return (
    <div 
      className="hero-section p-12 rounded-lg text-white"
      style={{ backgroundColor: content.background_color || '#16a34a' }}
    >
      <div className="max-w-4xl mx-auto">
        {content.image_url && (
          <div className="mb-8">
            <img 
              src={content.image_url} 
              alt="Hero" 
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}
        <h1 className="text-4xl font-bold mb-4">
          {content.title || 'Hero Title'}
        </h1>
        <h2 className="text-2xl mb-4 opacity-90">
          {content.subtitle || 'Hero Subtitle'}
        </h2>
        <p className="text-lg mb-6 opacity-80">
          {content.description || 'Hero description goes here'}
        </p>
        {content.cta_text && (
          <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            {content.cta_text}
          </button>
        )}
      </div>
    </div>
  )
}

// About Section
function AboutSection({ content }: { content: any }) {
  return (
    <div className="about-section p-8 bg-gray-50 rounded-lg">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">
          {content.title || 'Tentang Kami'}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-gray-700 leading-relaxed">
              {content.text || 'Tentang kami text goes here'}
            </p>
          </div>
          {content.image_url && (
            <div>
              <img 
                src={content.image_url} 
                alt="About" 
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Contact Section
function ContactSection({ content }: { content: any }) {
  return (
    <div className="contact-section p-8 bg-white border rounded-lg">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">
          {content.title || 'Hubungi Kami'}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Alamat</h3>
                <p className="text-gray-600">
                  {content.address || 'Alamat belum diisi'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Telepon</h3>
                <p className="text-gray-600">
                  {content.phone || 'Telepon belum diisi'}
                </p>
              </div>
            </div>
          </div>
          {content.show_map && (
            <div>
              <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Map Preview</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Footer Section
function FooterSection({ content }: { content: any }) {
  return (
    <div className="footer-section p-6 bg-gray-900 text-white rounded-lg">
      <div className="max-w-4xl mx-auto text-center">
        <p className="mb-4">
          {content.copyright || '© 2024 All rights reserved'}
        </p>
        {content.social_links && content.social_links.length > 0 && (
          <div className="flex justify-center gap-4">
            {content.social_links.map((link: any, index: number) => (
              <a 
                key={index}
                href={link.url}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {link.platform}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Menu Highlights Section
function MenuHighlightsSection({ content }: { content: any }) {
  return (
    <div className="menu-highlights-section p-8 bg-white rounded-lg">
      <h2 className="text-3xl font-bold mb-6">
        {content.title || 'Menu Unggulan'}
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {content.items?.map((item: any, index: number) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
            <p className="text-green-600 font-bold mb-2">{item.price}</p>
            <p className="text-gray-600 text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Featured Products Section
function FeaturedProductsSection({ content }: { content: any }) {
  return (
    <div className="featured-products-section p-8 bg-gray-50 rounded-lg">
      <h2 className="text-3xl font-bold mb-6">
        {content.title || 'Produk Unggulan'}
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {content.products?.map((product: any, index: number) => (
          <div key={index} className="bg-white rounded-lg overflow-hidden shadow">
            {product.image && (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-green-600 font-bold">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Benefits Section
function BenefitsSection({ content }: { content: any }) {
  return (
    <div className="benefits-section p-8 bg-emerald-50 rounded-lg">
      <h2 className="text-3xl font-bold mb-6">
        {content.title || 'Manfaat'}
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {content.items?.map((item: any, index: number) => (
          <div key={index} className="bg-white p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Ingredients Section
function IngredientsSection({ content }: { content: any }) {
  return (
    <div className="ingredients-section p-8 bg-green-50 rounded-lg">
      <h2 className="text-3xl font-bold mb-6">
        {content.title || 'Bahan Aktif'}
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {content.items?.map((item: any, index: number) => (
          <div key={index} className="bg-white p-4 rounded-lg text-center">
            <h3 className="font-semibold mb-2">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.benefit}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Product Showcase Section
function ProductShowcaseSection({ content }: { content: any }) {
  return <FeaturedProductsSection content={content} />
}

// Testimonials Section
function TestimonialsSection({ content }: { content: any }) {
  return (
    <div className="testimonials-section p-8 bg-emerald-50 rounded-lg">
      <h2 className="text-3xl font-bold mb-6">
        {content.title || 'Testimoni'}
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {content.testimonials?.map((testimonial: any, index: number) => (
          <div key={index} className="bg-white p-6 rounded-lg">
            <div className="flex mb-2">
              {[...Array(testimonial.rating || 5)].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
            <p className="text-gray-700 mb-3 italic">{testimonial.text}</p>
            <p className="font-semibold">- {testimonial.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Services Section
function ServicesSection({ content }: { content: any }) {
  return (
    <div className="services-section p-8 bg-orange-50 rounded-lg">
      <h2 className="text-3xl font-bold mb-6">
        {content.title || 'Layanan'}
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {content.services?.map((service: any, index: number) => (
          <div key={index} className="bg-white p-6 rounded-lg text-center">
            <div className="text-3xl mb-3">{service.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
            <p className="text-gray-600">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Certifications Section
function CertificationsSection({ content }: { content: any }) {
  return (
    <div className="certifications-section p-8 bg-green-50 rounded-lg">
      <h2 className="text-3xl font-bold mb-6">
        {content.title || 'Sertifikasi'}
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {content.certifies?.map((cert: any, index: number) => (
          <div key={index} className="bg-white p-4 rounded-lg text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <h3 className="font-semibold mb-1">{cert.name}</h3>
            <p className="text-sm text-gray-600">{cert.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
