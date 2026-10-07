'use client'

import React, { useEffect, useRef, useState } from 'react'
import styles from './ScrollReveal.module.css'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
}

export function ScrollReveal({ children, className = '' }: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentRef = ref.current

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (currentRef) {
            observer.unobserve(currentRef)
          }
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${isVisible ? styles.visible : ''} ${className}`}
    >
      {children}
    </div>
  )
}
