import React from 'react'

interface QuantityStepperProps {
  quantity: number
  onChange: (newQuantity: number) => void
  disabled?: boolean
  max?: number
}

export function QuantityStepper({ quantity, onChange, disabled, max = 999 }: QuantityStepperProps) {
  const handleMinus = () => {
    if (quantity > 1) onChange(quantity - 1)
  }

  const handlePlus = () => {
    if (quantity < max) onChange(quantity + 1)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10)
    if (isNaN(val)) return
    if (val < 1) val = 1
    if (val > max) val = max
    onChange(val)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10)
    if (isNaN(val) || val < 1) {
      onChange(1)
    } else if (val > max) {
      onChange(max)
    }
  }

  return (
    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden h-12 w-32">
      <button 
        onClick={handleMinus} 
        disabled={disabled || quantity <= 1}
        className="px-4 h-full text-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        -
      </button>
      <input 
        type="number" 
        value={quantity}
        onChange={handleInput}
        onBlur={handleBlur}
        disabled={disabled}
        className="flex-1 w-full text-center text-base font-bold border-x border-gray-200 h-full focus:outline-none appearance-none"
        style={{ MozAppearance: 'textfield' }}
      />
      <button 
        onClick={handlePlus} 
        disabled={disabled || quantity >= max}
        className="px-4 h-full text-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        +
      </button>
      <style dangerouslySetInnerHTML={{__html: `
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
      `}} />
    </div>
  )
}
