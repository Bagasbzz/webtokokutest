import React from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  images: string[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-50 flex items-center justify-center text-gray-400">
        <span className="text-sm">Tidak ada gambar</span>
      </div>
    )
  }

  return (
    <div 
      data-gallery 
      className="flex overflow-x-auto snap-x snap-mandatory w-full relative" 
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {images.map((img, idx) => (
        <div key={idx} className="w-full flex-none snap-center aspect-square relative bg-gray-50">
          <Image 
            src={img} 
            alt={`${title} - image ${idx + 1}`} 
            fill 
            className="object-cover"
            priority={idx === 0}
          />
        </div>
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        div[data-gallery]::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  )
}
