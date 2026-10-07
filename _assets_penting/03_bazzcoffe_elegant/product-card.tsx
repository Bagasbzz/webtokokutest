import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  onAddToCart?: () => void
}

export function ProductCard({
  id,
  name,
  description,
  price,
  image,
  category,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500">
      {/* Image Container with Hover Effect */}
      <div className="relative overflow-hidden h-64 bg-muted">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Category Badge */}
        <div className="inline-block">
          <span className="text-[10px] uppercase tracking-widest font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">
            {category}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-serif text-xl font-bold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
          {name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-medium">Price</span>
            <span className="font-serif text-xl font-bold text-primary">
              Rp {price.toLocaleString('id-ID')}
            </span>
          </div>
          <Button
            size="icon"
            className="rounded-full w-10 h-10 shadow-lg hover:shadow-accent/40 transition-all"
            onClick={onAddToCart}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
