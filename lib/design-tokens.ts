/**
 * WEBTOKOKU — GLOBAL DESIGN TOKEN SYSTEM
 *
 * Semua template dan komponen editor harus mengacu pada token ini.
 * Jangan hardcode nilai spacing, easing, radius, atau warna di luar file ini.
 *
 * Usage (JS/TS):
 *   import { tokens } from '@/lib/design-tokens'
 *   style={{ padding: tokens.space[8], borderRadius: tokens.radius.xl }}
 *
 * Usage (CSS variable injection):
 *   import { injectTokens } from '@/lib/design-tokens'
 *   <style>{injectTokens()}</style>
 */

export const tokens = {
  /** ── Spacing Scale (px) ── */
  space: {
    0:   '0px',
    1:   '4px',
    2:   '8px',
    3:   '12px',
    4:   '16px',
    5:   '20px',
    6:   '24px',
    8:   '32px',
    10:  '40px',
    12:  '48px',
    16:  '64px',
    20:  '80px',
    24:  '96px',
    32:  '128px',
    // Fluid section gaps (clamp)
    section: 'clamp(60px, 10vw, 120px)',
    hero:    'clamp(80px, 14vw, 180px)',
  },

  /** ── Typography Scale ── */
  font: {
    // Size
    size: {
      '2xs': '10px',
      xs:    '11px',
      sm:    '12px',
      base:  '14px',
      md:    '16px',
      lg:    '18px',
      xl:    '20px',
      '2xl': '24px',
      '3xl': 'clamp(1.75rem, 3vw, 2.5rem)',
      '4xl': 'clamp(2rem, 4vw, 3.5rem)',
      '5xl': 'clamp(2.5rem, 6vw, 5rem)',
      hero:  'clamp(3rem, 7vw, 6.5rem)',
    },
    // Weight
    weight: {
      light:   300,
      normal:  400,
      medium:  500,
      semibold:600,
      bold:    700,
    },
    // Tracking
    tracking: {
      tight:   '-0.04em',
      normal:  '0',
      wide:    '0.05em',
      wider:   '0.1em',
      widest:  '0.2em',
    },
    // Line height
    leading: {
      tight:   1.1,
      snug:    1.3,
      normal:  1.6,
      relaxed: 1.8,
    }
  },

  /** ── Border Radius ── */
  radius: {
    sm:   '4px',
    md:   '8px',
    lg:   '12px',
    xl:   '16px',
    '2xl':'24px',
    '3xl':'32px',
    '4xl':'40px',
    full: '9999px',
  },

  /** ── Motion / Easing ── */
  motion: {
    // Apple-like cinematic (used for GlowLab, Butik Hana)
    cinematic: 'cubic-bezier(0.32, 0.72, 0, 1)',
    // Snappy & precise (used for BazzHealth, UI interactions)
    snappy:    'cubic-bezier(0, 0.71, 0.2, 1.01)',
    // Standard ease-out for micro-interactions
    ease:      'cubic-bezier(0.2, 0, 0, 1)',
    // Duration scale
    duration: {
      instant:   '80ms',
      fast:      '150ms',
      normal:    '250ms',
      slow:      '450ms',
      cinematic: '900ms',
    }
  },

  /** ── Z-Index Layers ── */
  z: {
    base:        0,
    overlay:     10,
    fixed:       20,
    cart:        50,
    drawer:      60,
    toolbar:     9985,
    editorHover: 9990,
    editorLabel: 10000,
    floatInput:  10001,
    toast:       10010,
    modal:       10020,
  },

  /** ── Shadows ── */
  shadow: {
    sm:     '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    md:     '0 4px 12px rgba(0,0,0,0.08)',
    lg:     '0 8px 24px rgba(0,0,0,0.10)',
    xl:     '0 20px 40px rgba(0,0,0,0.12)',
    float:  '0 12px 32px rgba(59,130,246,0.18), 0 2px 8px rgba(0,0,0,0.12)',
    inset:  'inset 0 1px 2px rgba(0,0,0,0.06)',
  },

  /** ── Editor Overlay Colors ── */
  editor: {
    text: {
      outline:    'rgba(59, 130, 246, 0.9)',   // blue
      fill:       'rgba(59, 130, 246, 0.04)',
    },
    image: {
      outline:    'rgba(168, 85, 247, 0.9)',   // purple
      fill:       'rgba(168, 85, 247, 0.04)',
    },
    section: {
      outline:    'rgba(59, 130, 246, 0.18)',
      toolbar:    'rgba(17, 24, 39, 0.88)',
    }
  }
} as const

/**
 * Generates a CSS variable string to inject into a <style> tag.
 * Allows CSS files to consume tokens via var(--wt-space-section), etc.
 */
export function injectTokens(): string {
  return `
    :root {
      /* Spacing */
      --wt-space-section: ${tokens.space.section};
      --wt-space-hero: ${tokens.space.hero};

      /* Motion */
      --wt-ease-cinematic: ${tokens.motion.cinematic};
      --wt-ease-snappy: ${tokens.motion.snappy};
      --wt-ease: ${tokens.motion.ease};
      --wt-dur-fast: ${tokens.motion.duration.fast};
      --wt-dur-normal: ${tokens.motion.duration.normal};
      --wt-dur-slow: ${tokens.motion.duration.slow};
      --wt-dur-cinematic: ${tokens.motion.duration.cinematic};

      /* Radius */
      --wt-radius-xl: ${tokens.radius.xl};
      --wt-radius-2xl: ${tokens.radius['2xl']};
      --wt-radius-3xl: ${tokens.radius['3xl']};

      /* Shadows */
      --wt-shadow-float: ${tokens.shadow.float};
    }
  `
}
