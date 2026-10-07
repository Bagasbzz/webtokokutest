'use client'
import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { getEditableAttr } from '@/lib/editor-mapping'
import { sanitizeCssUrlForInlineBackground, sanitizeRichHtml, sanitizeUrl } from '@/lib/customization-security'

interface BazzHeroProps {
  title: string
  subtitle: string
  imageUrl: string
  previewMode?: boolean
  bgImageUrl?: string
  badge?: string
}

const bazzEase = [0.32, 0.72, 0, 1] as const

export function BazzHero({ title, subtitle, imageUrl, previewMode, bgImageUrl, badge }: BazzHeroProps) {
  const safeBgImageUrl = sanitizeCssUrlForInlineBackground(bgImageUrl || '')
  const safeImageUrl = sanitizeUrl(imageUrl) || '/template-assets/bazz-health-logo.svg'

  return (
    <section 
      className={`bazz-health-hero ${safeBgImageUrl ? 'has-bg' : ''}`}
      style={safeBgImageUrl ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.6)), url(${safeBgImageUrl})`,
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      } : undefined}
    >
      <div className="bazz-health-grid">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: bazzEase }}
          className="bazz-health-copy"
        >
          {badge && <span className="bazz-health-kicker" {...getEditableAttr(previewMode, 'hero.badge')}>{badge}</span>}
          <h1 {...getEditableAttr(previewMode, 'hero.title')} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(title) }} />
          <p {...getEditableAttr(previewMode, 'hero.subtitle')}>{subtitle}</p>
          <div className="bazz-health-actions">
            <a href="#catalog" style={{ backgroundColor: 'var(--color-primary, #2d6a4f)' }}>Lihat produk</a>
            <span>Cek stok dan tanya admin lewat WhatsApp.</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: bazzEase }}
          className="bazz-health-media"
        >
          <div className="bazz-health-photo" {...getEditableAttr(previewMode, 'hero.image_url')}>
            <Image src={safeImageUrl} alt="Produk kesehatan" fill className="object-cover" priority />
          </div>
          <div className="bazz-health-ruler" aria-hidden="true" style={{ borderColor: 'var(--color-primary, #2d6a4f)' }} />
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bazz-health-hero {
          min-height: 80vh;
          padding: clamp(100px, 10vw, 130px) clamp(20px, 5vw, 72px) clamp(48px, 6vw, 70px);
          background:
            linear-gradient(90deg, rgba(38,92,74,.07) 1px, transparent 1px),
            linear-gradient(180deg, #f8faf5 0%, #eef4ec 100%);
          background-size: 84px 84px, auto;
          color: #1f332b;
          display: flex;
          align-items: center;
        }
        .bazz-health-hero.has-bg {
          /* Keep background image set inline! */
        }
        .bazz-health-hero.has-bg h1 {
          color: #fff !important;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }
        .bazz-health-hero.has-bg p {
          color: #f3f4f6 !important;
          text-shadow: 0 1px 10px rgba(0,0,0,0.4);
        }
        .bazz-health-hero.has-bg .bazz-health-kicker {
          color: var(--color-secondary, #40916c) !important;
          text-shadow: 0 1px 4px rgba(0,0,0,0.4);
        }
        .bazz-health-hero.has-bg .bazz-health-actions span {
          color: #e5e7eb !important;
        }
        .bazz-health-grid {
          width: min(1240px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, .9fr) minmax(420px, 1fr);
          gap: clamp(40px, 8vw, 92px);
          align-items: center;
        }
        .bazz-health-kicker {
          display: inline-flex;
          margin-bottom: 22px;
          color: var(--color-primary, #2d6a4f);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .bazz-health-copy h1 {
          margin: 0 0 22px;
          font-size: clamp(2.2rem, 6vw, 4.2rem);
          line-height: .98;
          letter-spacing: 0;
          color: #193126;
        }
        .bazz-health-copy p {
          max-width: 520px;
          margin: 0 0 32px;
          color: #55635c;
          font-size: clamp(1rem, 1.45vw, 1.18rem);
          line-height: 1.75;
        }
        .bazz-health-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
        }
        .bazz-health-actions a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 54px;
          padding: 14px 28px;
          border-radius: 14px;
          background: var(--color-primary, #2d6a4f);
          color: #fff;
          font-weight: 800;
          text-decoration: none;
          transition: transform 180ms ease, filter 180ms ease;
        }
        .bazz-health-actions a:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }
        .bazz-health-actions span {
          max-width: 250px;
          color: #65746d;
          font-size: 14px;
          line-height: 1.5;
        }
        .bazz-health-media {
          position: relative;
          min-height: clamp(340px, 42vw, 480px);
        }
        .bazz-health-photo {
          position: absolute;
          inset: 0 0 0 12%;
          overflow: hidden;
          border-radius: 0 96px 0 96px;
          border: 1px solid rgba(25,49,38,.1);
          box-shadow: 0 36px 90px rgba(45,106,79,.14);
          background: #dfeae2;
        }
        .bazz-health-photo::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(248,250,245,0) 48%, rgba(17,45,35,.18));
          pointer-events: none;
        }
        .bazz-health-ruler {
          position: absolute;
          left: 0;
          bottom: 8%;
          width: 58%;
          height: 22%;
          border-left: 2px solid var(--color-primary, #2d6a4f);
          border-bottom: 2px solid var(--color-primary, #2d6a4f);
          opacity: .42;
        }
        @media (max-width: 980px) {
          .bazz-health-grid { grid-template-columns: 1fr; }
          .bazz-health-media { min-height: 500px; }
        }
        @media (max-width: 640px) {
          .bazz-health-hero {
            padding-top: 80px;
            padding-bottom: 30px;
            min-height: 70vh;
          }
          .bazz-health-media {
            min-height: 320px;
            margin-top: 20px;
          }
          .bazz-health-photo {
            position: relative;
            inset: auto;
            height: 320px;
            border-radius: 0 64px 0 64px;
          }
          .bazz-health-ruler { display: none; }
        }
      `}} />
    </section>
  )
}
