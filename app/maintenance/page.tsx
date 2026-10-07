import React from 'react'
import { Hammer } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-8 text-primary animate-pulse">
        <Hammer size={40} />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Under Maintenance</h1>
      <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
        Kami sedang melakukan pemeliharaan sistem untuk memberikan pengalaman terbaik. 
        Silakan kembali beberapa saat lagi.
      </p>
      
      <div className="mt-12 pt-8 border-t border-gray-100 w-full max-w-xs text-[10px] uppercase tracking-widest text-gray-400 font-bold">
        WebTokoku Platform Status: Updating
      </div>
    </div>
  )
}
