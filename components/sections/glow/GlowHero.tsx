'use client'
import React from 'react'
import Image from 'next/image'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getEditableAttr } from '@/lib/editor-mapping'
import { sanitizeCssUrlForInlineBackground, sanitizeUrl } from '@/lib/customization-security'

interface GlowHeroProps {
  title: string
  subtitle: string
  imageUrl: string
  storeName: string
  previewMode?: boolean
  bgImageUrl?: string
  textureImageUrl?: string
  badge?: string
  note1?: string
  note2?: string
  note3?: string
}

const premiumEase = [0.32, 0.72, 0, 1] as const

export function GlowHero({ 
  title, 
  subtitle, 
  imageUrl, 
  storeName, 
  previewMode, 
  bgImageUrl, 
  textureImageUrl, 
  badge,
  note1,
  note2,
  note3
}: GlowHeroProps) {
  const { scrollY } = useScroll()
  const shouldReduceMotion = useReducedMotion()
  const yMain = useSpring(useTransform(scrollY, [0, 800], [0, 110]), { stiffness: 60, damping: 20, mass: 0.5 })
  const yTexture = useSpring(useTransform(scrollY, [0, 800], [0, -70]), { stiffness: 60, damping: 20, mass: 0.5 })
  const safeBgImageUrl = sanitizeCssUrlForInlineBackground(bgImageUrl || '')
  const safeImageUrl = sanitizeUrl(imageUrl) || '/template-previews/glow-desktop.jpg'
  const safeTextureImageUrl = sanitizeUrl(textureImageUrl) || '/template-previews/glow-mobile.jpg'

  return (
    <section 
      className={`glow-hero ${safeBgImageUrl ? 'has-bg' : ''}`}
      style={safeBgImageUrl ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.55)), url(${safeBgImageUrl})`,
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      } : undefined}
    >
      <div className="glow-hero-inner">
        <motion.div
          className="glow-hero-copy"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: premiumEase }}
        >
          {badge && <span className="glow-kicker" {...getEditableAttr(previewMode, 'hero.badge')}>{badge}</span>}
          <h1 {...getEditableAttr(previewMode, 'hero.title')}>{title}</h1>
          <p {...getEditableAttr(previewMode, 'hero.subtitle')}>{subtitle}</p>

          <div className="glow-note-row">
            <span {...getEditableAttr(previewMode, 'hero.note1')}>{note1 || 'Tanpa parfum'}</span>
            <span {...getEditableAttr(previewMode, 'hero.note2')}>{note2 || 'Untuk pemakaian harian'}</span>
            <span {...getEditableAttr(previewMode, 'hero.note3')}>{note3 || 'Chat admin sebelum order'}</span>
          </div>

          <a href="#catalog" className="glow-cta">
            Lihat katalog
          </a>
        </motion.div>

        <div className="glow-hero-media">
          <motion.div className="glow-product-stage" style={{ y: shouldReduceMotion ? 0 : yMain }} {...getEditableAttr(previewMode, 'hero.image_url')}>
            <Image
              src={safeImageUrl}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 90vw, 620px"
            />
          </motion.div>

          <motion.div
            className="glow-texture-card"
            style={{ y: shouldReduceMotion ? 0 : yTexture }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.9, ease: premiumEase }}
            {...getEditableAttr(previewMode, 'hero.texture_image_url')}
          >
            <Image
              src={safeTextureImageUrl}
              alt="Tekstur produk skincare"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 45vw, 320px"
            />
          </motion.div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .glow-hero {
          position: relative;
          min-height: clamp(100vh, 110vh, 1100px);
          width: 100%;
          background:
            linear-gradient(90deg, color-mix(in srgb, var(--color-primary, #7f9287) 8%, transparent) 1px, transparent 1px),
            linear-gradient(180deg, color-mix(in srgb, var(--color-primary, #7f9287) 2%, #fbfaf7) 0%, color-mix(in srgb, var(--color-primary, #7f9287) 4%, #f7f1e9) 100%);
          background-size: 96px 96px, auto;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: clamp(100px, 14vw, 180px) clamp(24px, 5vw, 80px) clamp(60px, 10vw, 120px);
        }
        .glow-hero.has-bg {
          /* Keep the background image set via inline style! */
        }
        .glow-hero.has-bg h1 {
          color: #fff !important;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }
        .glow-hero.has-bg p {
          color: #f3f4f6 !important;
          text-shadow: 0 1px 10px rgba(0,0,0,0.4);
        }
        .glow-hero.has-bg .glow-kicker {
          color: #e5e7eb !important;
          text-shadow: 0 1px 4px rgba(0,0,0,0.4);
        }
        .glow-hero.has-bg .glow-note-row {
          color: #e5e7eb !important;
        }
        .glow-hero.has-bg .glow-note-row span {
          border-left: 1px solid rgba(255,255,255,0.3) !important;
        }
        .glow-hero-inner {
          width: 100%;
          max-width: 1280px;
          display: grid;
          grid-template-columns: minmax(0, .9fr) minmax(460px, 1fr);
          gap: clamp(48px, 8vw, 96px);
          align-items: center;
        }
        .glow-hero-copy {
          max-width: 680px;
          position: relative;
          z-index: 2;
        }
        .glow-kicker {
          display: block;
          margin-bottom: clamp(20px, 3vw, 32px);
          color: var(--color-primary, #7f9287);
          font-size: clamp(11px, 1vw, 12px);
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
        }
        .glow-hero h1 {
          font-size: clamp(2.5rem, 8vw, 6.5rem);
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: 0;
          color: #111;
          margin: 0 0 clamp(20px, 3vw, 32px);
        }
        .glow-hero p {
          max-width: 460px;
          margin: 0 0 clamp(32px, 5vw, 52px);
          color: color-mix(in srgb, var(--color-primary, #111) 60%, #5f625c);
          font-size: clamp(1rem, 1.5vw, 1.2rem);
          line-height: 1.75;
        }
        .glow-note-row {
          display: flex;
          flex-wrap: wrap;
          margin: -20px 0 36px;
          color: color-mix(in srgb, var(--color-primary, #7f9287) 80%, #5f625c);
          font-size: 14px;
        }
        .glow-note-row span {
          padding: 0 16px;
          border-left: 1px solid color-mix(in srgb, var(--color-primary, #7f9287) 20%, rgba(17,17,17,.14));
        }
        .glow-note-row span:first-child {
          padding-left: 0;
          border-left: 0;
        }
        .glow-cta {
          display: inline-flex;
          min-height: 54px;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: var(--color-primary, #111);
          color: #fff;
          padding: 14px 32px;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          transition: background 180ms ease, transform 180ms ease;
        }
        .glow-cta:hover {
          background: var(--color-secondary, #30352f);
          transform: translateY(-1px);
        }
        .glow-hero-media {
          position: relative;
          min-height: clamp(480px, 65vw, 700px);
        }
        .glow-product-stage {
          position: absolute;
          top: 0;
          right: 0;
          width: 82%;
          height: 80%;
          border-radius: 36px 36px 90px 36px;
          overflow: hidden;
          background: color-mix(in srgb, var(--color-primary, #7f9287) 8%, #ebe7df);
          border: 1px solid rgba(17,17,17,.08);
          box-shadow: 0 28px 70px rgba(35,31,25,.12);
        }
        .glow-texture-card {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 48%;
          aspect-ratio: 4/5;
          border-radius: 28px;
          overflow: hidden;
          border: 10px solid color-mix(in srgb, var(--color-primary, #7f9287) 2%, #fbfaf7);
          box-shadow: 0 22px 54px rgba(0,0,0,.1);
        }
        @media (max-width: 1023px) {
          .glow-hero-inner { grid-template-columns: 1fr; }
          .glow-hero-media { min-height: clamp(420px, 80vw, 560px); }
        }
        @media (max-width: 720px) {
          .glow-note-row { margin-top: -12px; }
          .glow-note-row span {
            width: 100%;
            padding: 8px 0;
            border-left: 0;
            border-top: 1px solid color-mix(in srgb, var(--color-primary, #7f9287) 20%, rgba(17,17,17,.12));
          }
          .glow-hero.has-bg .glow-note-row span {
            border-top: 1px solid rgba(255,255,255,0.2) !important;
          }
        }
      `}} />
    </section>
  )
}
