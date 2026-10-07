'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { getEditableAttr } from '@/lib/editor-mapping'

const premiumEase = [0.32, 0.72, 0, 1] as const

interface ReviewItem {
  text: string
  author: string
  index: number
}

interface GlowReviewProps {
  title: string
  text?: string
  author?: string
  reviews?: ReviewItem[]
  previewMode?: boolean
}

export function GlowReview({ title, text, author, reviews, previewMode }: GlowReviewProps) {
  const items = reviews && reviews.length > 0 
    ? reviews 
    : (text ? [{ text, author: author || '', index: 1 }] : [])

  const styleCss = `
    .glow-review-section {
      min-height: 72vh;
      padding: clamp(80px, 12vw, 140px) 24px;
      background: #F5F3EE; /* Warm ivory skincare tone */
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #171717;
    }
    .glow-review-wrap {
      width: min(900px, 100%);
    }
    .glow-review-wrap span {
      display: inline-flex;
      margin-bottom: 34px;
      color: var(--color-primary, #059669);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .glow-review-wrap h2 {
      margin: 0;
      font-size: clamp(2.25rem, 6vw, 4.5rem);
      line-height: 1.12;
      letter-spacing: 0;
      font-weight: 400;
    }
    .glow-review-wrap p {
      margin: 34px 0 0;
      color: #5A5A5A;
      font-size: 15px;
    }

    /* Grid layout for multiple reviews */
    .glow-review-grid-wrap {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .glow-grid-title {
      display: inline-flex;
      margin-bottom: 50px;
      color: var(--color-primary, #059669);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
      text-align: center;
    }
    .glow-reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      width: 100%;
    }
    .glow-review-card {
      background: #ffffff;
      padding: 40px;
      border-radius: 24px;
      border: 1px solid rgba(0, 0, 0, 0.03);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      text-align: left;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .glow-review-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    }
    .glow-stars {
      color: var(--color-primary, #059669);
      font-size: 16px;
      margin-bottom: 20px;
      letter-spacing: 2px;
    }
    .glow-card-text {
      font-size: 16px;
      line-height: 1.6;
      color: #4b5563;
      margin-bottom: 20px;
      flex-grow: 1;
      font-weight: 400;
    }
    .glow-card-author {
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 600;
      color: #111;
    }
    
    @media (max-width: 768px) {
      .glow-reviews-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      .glow-review-card {
        padding: 30px;
      }
    }
  `

  if (items.length === 1) {
    return (
      <section className="glow-review-section" id="reviews">
        <style dangerouslySetInnerHTML={{ __html: styleCss }} />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: premiumEase }}
          className="glow-review-wrap"
        >
          <span {...getEditableAttr(previewMode, 'reviews.title')}>{title}</span>
          <h2 {...getEditableAttr(previewMode, `reviews.item${items[0].index}_text`)}>{items[0].text}</h2>
          <p {...getEditableAttr(previewMode, `reviews.item${items[0].index}_name`)}>{items[0].author}</p>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="glow-review-section" id="reviews">
      <style dangerouslySetInnerHTML={{ __html: styleCss }} />
      <div className="glow-review-grid-wrap">
        <span className="glow-grid-title" {...getEditableAttr(previewMode, 'reviews.title')}>{title}</span>
        <div className="glow-reviews-grid">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: premiumEase }}
              className="glow-review-card"
            >
              <div className="glow-stars">★★★★★</div>
              <p className="glow-card-text" {...getEditableAttr(previewMode, `reviews.item${item.index}_text`)}>{item.text}</p>
              <h4 className="glow-card-author" {...getEditableAttr(previewMode, `reviews.item${item.index}_name`)}>{item.author}</h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
