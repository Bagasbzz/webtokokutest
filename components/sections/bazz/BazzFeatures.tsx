'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { getEditableAttr } from '@/lib/editor-mapping'

const bazzEase = [0.32, 0.72, 0, 1] as const

interface BazzFeaturesProps {
  customizations?: Record<string, string>
  previewMode?: boolean
}

export function BazzFeatures({ customizations, previewMode }: BazzFeaturesProps) {
  const visible = customizations?.['features.visible'] !== 'false'

  const feat1Title = customizations?.['features.feat1_title'] || 'Produk jelas'
  const feat1Desc = customizations?.['features.feat1_desc'] || 'Kategori, harga, stok, dan catatan pemakaian ditulis ringkas supaya pembeli tidak menebak-nebak.'
  
  const feat2Title = customizations?.['features.feat3_title'] || 'Tanya admin'
  const feat2Desc = customizations?.['features.feat3_desc'] || 'Pembeli bisa cek kecocokan produk dan ketersediaan lewat WhatsApp sebelum order.'

  const feat3Title = customizations?.['features.feat2_title'] || 'Info pengiriman'
  const feat3Desc = customizations?.['features.feat2_desc'] || 'Tambahkan area layanan, estimasi kirim, dan catatan khusus untuk produk tertentu.'

  if (!visible) return null

  const features = [
    { num: '01', title: feat1Title, desc: feat1Desc, keyTitle: 'features.feat1_title', keyDesc: 'features.feat1_desc' },
    { num: '02', title: feat2Title, desc: feat2Desc, keyTitle: 'features.feat3_title', keyDesc: 'features.feat3_desc' },
    { num: '03', title: feat3Title, desc: feat3Desc, keyTitle: 'features.feat2_title', keyDesc: 'features.feat2_desc' },
  ]

  return (
    <section className="bazz-feature-section" id="features">
      <div className="bazz-feature-wrap">
        <div className="bazz-feature-split">
          {/* Left Column: Heading Info */}
          <div className="bazz-feature-left">
            <h2 className="bazz-feature-heading">Informasi produk dibuat gampang dicek.</h2>
            <p className="bazz-feature-lead">
              Kami menghadirkan produk kesehatan pilihan terbaik yang teruji, aman, dan berkhasiat nyata untuk keluarga Anda.
            </p>
            <div className="bazz-feature-accent-box">
              <p>Layanan terintegrasi langsung dengan konsultasi admin WhatsApp untuk memastikan produk yang Anda pilih sesuai dengan kebutuhan tubuh Anda.</p>
            </div>
          </div>

          {/* Right Column: Staggered Features with Large Numbers */}
          <div className="bazz-feature-right">
            {features.map((feature, index) => (
              <motion.article
                key={index}
                className="bazz-feature-item"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: bazzEase }}
              >
                <div className="bazz-feature-num">{feature.num}</div>
                <div className="bazz-feature-content">
                  <h3 {...getEditableAttr(previewMode, feature.keyTitle)}>{feature.title}</h3>
                  <p {...getEditableAttr(previewMode, feature.keyDesc)}>{feature.desc}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bazz-feature-section {
          padding: clamp(72px, 11vw, 128px) clamp(20px, 5vw, 72px);
          background: #f8faf5;
          color: #1f332b;
        }
        .bazz-feature-wrap {
          width: min(1180px, 100%);
          margin: 0 auto;
        }
        .bazz-feature-split {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
          gap: clamp(40px, 8vw, 80px);
          align-items: start;
        }
        .bazz-feature-left {
          position: sticky;
          top: 120px;
        }
        .bazz-feature-heading {
          font-family: var(--font-heading);
          font-size: clamp(2.25rem, 4.5vw, 3.25rem);
          line-height: 1.1;
          color: #193126;
          margin-bottom: 24px;
        }
        .bazz-feature-lead {
          font-size: clamp(1rem, 1.35vw, 1.12rem);
          line-height: 1.7;
          color: #55635c;
          margin-bottom: 32px;
        }
        .bazz-feature-accent-box {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: rgba(45, 106, 79, 0.04);
          border-radius: 12px;
          border-left: 3px solid var(--color-primary);
        }
        .bazz-feature-accent-box p {
          font-size: 14px;
          line-height: 1.6;
          color: #1f332b;
          margin: 0;
        }
        .bazz-feature-right {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .bazz-feature-item {
          display: flex;
          gap: 24px;
          padding-bottom: 32px;
          border-bottom: 1px solid rgba(25, 49, 38, 0.08);
        }
        .bazz-feature-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
          parent-color: inherit;
        }
        .bazz-feature-num {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 4vw, 3rem);
          color: var(--color-primary);
          opacity: 0.6;
          line-height: 1;
          font-weight: 700;
        }
        .bazz-feature-content h3 {
          margin: 0 0 8px;
          font-size: clamp(1.2rem, 1.8vw, 1.45rem);
          color: #193126;
          font-weight: 700;
        }
        .bazz-feature-content p {
          margin: 0;
          color: #65746d;
          line-height: 1.7;
          font-size: 14px;
        }
        @media (max-width: 860px) {
          .bazz-feature-split { grid-template-columns: 1fr; gap: 48px; }
          .bazz-feature-left { position: relative; top: 0; }
        }
      `}} />
    </section>
  )
}
