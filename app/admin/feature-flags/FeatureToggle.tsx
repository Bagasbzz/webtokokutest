'use client'

import React, { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { toggleGlobalFeature } from './actions'
import styles from '../admin.module.css'

interface FeatureToggleProps {
  flagId: string
  initialValue: boolean
  flagKey: string
}

export function FeatureToggle({ flagId, initialValue, flagKey }: FeatureToggleProps) {
  const [isPending, startTransition] = useTransition()
  const [enabled, setEnabled] = useState(initialValue)

  const handleToggle = () => {
    const newValue = !enabled
    setEnabled(newValue)

    startTransition(async () => {
      try {
        await toggleGlobalFeature(flagId, newValue, flagKey)
      } catch (error) {
        console.error('Failed to toggle feature:', error)
        setEnabled(initialValue)
        alert('Gagal mengubah fitur. Silakan coba lagi.')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`${styles.toggle} ${enabled ? styles.toggleOn : ''}`}
      aria-label={`Toggle ${flagKey}`}
      aria-pressed={enabled}
    >
      <span className={`${styles.toggleKnob} ${enabled ? styles.toggleKnobOn : ''}`}>
        {isPending && <Loader2 size={12} color="#10b981" />}
      </span>
    </button>
  )
}
