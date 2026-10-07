import { Button } from '@/components/ui/button'

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface PricingCardProps {
  items: OrderItem[]
  showBreakdown?: boolean
}

export function PricingCard({ items, showBreakdown = true }: PricingCardProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.1)
  const total = subtotal + tax

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-4">
      <h3 className="font-serif text-lg font-bold text-foreground">Order Summary</h3>

      {/* Items List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm text-foreground/70">
            <span>{item.quantity}x {item.name}</span>
            <span className="font-medium text-foreground">
              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
            </span>
          </div>
        ))}
      </div>

      {showBreakdown && (
        <>
          {/* Breakdown */}
          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-foreground/70">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-foreground/70">
              <span>Tax (10%)</span>
              <span>Rp {tax.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </>
      )}

      {/* Total */}
      <div className="border-t border-border pt-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">Total</span>
          <span className="font-serif text-2xl font-bold text-accent">
            Rp {total.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      <Button className="w-full" size="lg">
        Proceed to Checkout
      </Button>
    </div>
  )
}
