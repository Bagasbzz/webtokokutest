'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, X, Check, Loader2 } from 'lucide-react'

interface ImageCropperModalProps {
  src: string
  aspectRatio?: number // e.g. 1 for square/circle, 16/9 for landscape
  cropShape?: 'circle' | 'rect'
  onCrop: (blob: Blob) => void
  onClose: () => void
  title?: string
}

export function ImageCropperModal({
  src,
  aspectRatio = 1,
  cropShape = 'circle',
  onCrop,
  onClose,
  title = 'Sesuaikan Posisi Foto'
}: ImageCropperModalProps) {
  const [scale, setScale] = useState(1.2)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentShape, setCurrentShape] = useState<'circle' | 'rect' | 'oval' | 'pentagon'>(
    cropShape === 'circle' ? 'circle' : (cropShape === 'rect' ? 'rect' : 'circle')
  )

  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Viewport display dimensions in CSS pixels
  const viewWidth = 280
  const currentAspectRatio = currentShape === 'oval' ? 1.5 : (currentShape === 'circle' || currentShape === 'pentagon' ? 1 : aspectRatio)
  const viewHeight = viewWidth / currentAspectRatio

  // Reset states when source changes
  useEffect(() => {
    setScale(1.2)
    setPosition({ x: 0, y: 0 })
    setImageLoaded(false)
    setError(null)
  }, [src])

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    e.preventDefault()
    
    // Boundary calculations can be done here, but simple panning is more fluid
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId)
    }
  }

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 4))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 1))
  }

  const handleReset = () => {
    setScale(1.2)
    setPosition({ x: 0, y: 0 })
  }

  const handleApply = async () => {
    if (!imageRef.current) return
    setIsProcessing(true)

    try {
      const img = imageRef.current
      const canvas = document.createElement('canvas')
      
      // We set target width for high res
      const targetWidth = currentAspectRatio === 1 ? 500 : 1200
      const targetHeight = targetWidth / currentAspectRatio
      
      canvas.width = targetWidth
      canvas.height = targetHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      // Clear background for transparent WebP support
      ctx.clearRect(0, 0, targetWidth, targetHeight)
      if (currentShape === 'rect') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, targetWidth, targetHeight)
      }

      // Clip canvas context to matching shapes
      ctx.save()
      ctx.beginPath()
      if (currentShape === 'circle') {
        ctx.arc(targetWidth / 2, targetHeight / 2, targetWidth / 2, 0, Math.PI * 2)
        ctx.clip()
      } else if (currentShape === 'oval') {
        ctx.ellipse(targetWidth / 2, targetHeight / 2, targetWidth / 2, targetHeight / 2, 0, 0, Math.PI * 2)
        ctx.clip()
      } else if (currentShape === 'pentagon') {
        ctx.moveTo(targetWidth * 0.5, 0)
        ctx.lineTo(targetWidth, targetHeight * 0.38)
        ctx.lineTo(targetWidth * 0.82, targetHeight)
        ctx.lineTo(targetWidth * 0.18, targetHeight)
        ctx.lineTo(0, targetHeight * 0.38)
        ctx.closePath()
        ctx.clip()
      }

      // Calculate source image fitting
      const naturalWidth = img.naturalWidth
      const naturalHeight = img.naturalHeight
      
      // Calculate fit scale factor (matching object-fit: contain)
      const fitScale = Math.min(viewWidth / naturalWidth, viewHeight / naturalHeight)
      
      // Apply scale and translation matching the CSS display
      const currentWidth = naturalWidth * fitScale * scale
      const currentHeight = naturalHeight * fitScale * scale
      
      // Calculate top-left corner coordinates relative to CSS viewport
      const displayX = viewWidth / 2 + position.x - currentWidth / 2
      const displayY = viewHeight / 2 + position.y - currentHeight / 2
      
      // Project to high-resolution canvas size
      const ratio = targetWidth / viewWidth
      
      ctx.drawImage(
        img,
        displayX * ratio,
        displayY * ratio,
        currentWidth * ratio,
        currentHeight * ratio
      )
      
      ctx.restore()

      canvas.toBlob((blob) => {
        if (blob) {
          onCrop(blob)
        } else {
          setError('Gagal memproses file gambar.')
          setIsProcessing(false)
        }
      }, 'image/webp', 0.85) // High-quality webp compression
    } catch (err) {
      console.error(err)
      setError('Terjadi kesalahan saat memotong gambar. Coba format gambar lain.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative bg-zinc-900 border border-zinc-800 text-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="font-semibold text-sm tracking-wide text-zinc-100">{title}</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewport Box */}
        <div className="relative flex items-center justify-center p-6 bg-zinc-950/50 min-h-[300px]">
          {/* Crop Boundary */}
          <div 
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`relative overflow-hidden cursor-move bg-zinc-950 border border-zinc-800 select-none touch-none`}
            style={{ 
              width: `${viewWidth}px`, 
              height: `${viewHeight}px`,
              borderRadius: currentShape === 'circle' || currentShape === 'oval' ? '50%' : '12px',
              clipPath: currentShape === 'pentagon' ? 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' : 'none',
              boxShadow: currentShape !== 'pentagon' ? '0 0 0 9999px rgba(9, 9, 11, 0.65)' : 'none'
            }}
          >
            <img
              ref={imageRef}
              src={src}
              alt="Crop Source"
              onLoad={() => setImageLoaded(true)}
              className="absolute pointer-events-none select-none origin-center"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: imageLoaded ? 1 : 0,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out, opacity 0.3s ease'
              }}
            />
          </div>

          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-500" size={24} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex flex-col gap-4">
          {error && (
            <div className="bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs px-3 py-2 rounded-lg text-center font-medium animate-fade-in">
              {error}
            </div>
          )}

          {/* Shape Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-zinc-400 text-xs font-semibold">Pilih Bentuk Masker:</span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'circle', label: 'Bulat' },
                { id: 'oval', label: 'Oval' },
                { id: 'pentagon', label: 'Segilima' },
                { id: 'rect', label: 'Persegi' }
              ].map(shape => (
                <button
                  key={shape.id}
                  type="button"
                  onClick={() => setCurrentShape(shape.id as any)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    currentShape === shape.id
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750 hover:text-white'
                  }`}
                >
                  {shape.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={handleZoomOut} 
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <ZoomOut size={16} />
            </button>
            <input
              type="range"
              min="1"
              max="4"
              step="0.01"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <button 
              type="button" 
              onClick={handleZoomIn} 
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <RotateCcw size={12} />
              Reset
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!imageLoaded || isProcessing}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/50 disabled:text-zinc-500 text-xs font-semibold text-white transition-colors shadow-lg shadow-emerald-950/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    Gunakan Foto
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}} />
    </div>
  )
}
