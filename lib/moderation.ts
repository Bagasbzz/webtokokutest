export type ModerationLevel = 'safe' | 'low' | 'medium' | 'high'
export type ModerationStatus = 'safe' | 'flagged' | 'pending_review' | 'suspended' | 'blocked'

export type ModerationInput = {
  field: string
  value: unknown
  weight?: number
}

export type ModerationResult = {
  level: ModerationLevel
  status: ModerationStatus
  score: number
  categories: string[]
  matchedTerms: string[]
  reason: string | null
  sellerMessage: string | null
  shouldBlockPublish: boolean
}

const AMBIGUOUS_TERMS = ['slot', 'gacor', 'deposit', 'withdraw', 'bet', 'scatter', 'rtp']

const STRONG_PHRASES = [
  'slot gacor',
  'slot online',
  'situs slot',
  'agen slot',
  'bandar togel',
  'togel online',
  'casino online',
  'deposit 10rb',
  'withdraw cepat',
  'rtp slot',
  'pragmatic play',
  'situs777',
]

const STRONG_SINGLE_TERMS = ['togel', 'casino', 'judi', 'maxwin', 'pragmatic']

const ILLEGAL_TERMS = ['narkoba', 'sabu', 'ganja', 'obat ilegal', 'senjata api']
const ABUSE_TERMS = ['bunuh', 'ancam', 'penipuan', 'phishing', 'bokep', 'pornografi']
const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.monster', '.bet', '.casino']

function normalizeText(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value.toLowerCase()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).toLowerCase()
  if (Array.isArray(value)) return value.map(normalizeText).join(' ')
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).map(normalizeText).join(' ')
  return ''
}

function normalizePhraseText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function compactPhraseText(value: string): string {
  return normalizePhraseText(value).replace(/\s+/g, '')
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values))
}

function hasWord(text: string, term: string) {
  return new RegExp(`(^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i').test(text)
}

function hasStrongPhrase(text: string, phrase: string) {
  const spacedText = normalizePhraseText(text)
  const spacedPhrase = normalizePhraseText(phrase)
  if (!spacedText || !spacedPhrase) return false
  if (spacedText.includes(spacedPhrase)) return true

  const compactText = compactPhraseText(text)
  const compactPhrase = compactPhraseText(phrase)
  return compactPhrase.length >= 7 && compactText.includes(compactPhrase)
}

function findRepeatedSuspiciousTerms(text: string, terms: string[]) {
  const repeated: string[] = []
  for (const term of terms) {
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const count = text.match(regex)?.length || 0
    if (count >= 4) repeated.push(term)
  }
  return repeated
}

export function moderateContent(inputs: ModerationInput[]): ModerationResult {
  let score = 0
  const matchedTerms: string[] = []
  const categories: string[] = []

  for (const input of inputs) {
    const text = normalizeText(input.value)
    if (!text.trim()) continue

    const weight = input.weight ?? 1
    const fieldBoost = /slug|nama|title|judul/i.test(input.field) ? 1.5 : 1

    for (const phrase of STRONG_PHRASES) {
      if (hasStrongPhrase(text, phrase)) {
        score += Math.round(36 * weight * fieldBoost)
        matchedTerms.push(phrase)
        categories.push('judi online/spam')
      }
    }

    for (const term of STRONG_SINGLE_TERMS) {
      if (hasWord(text, term)) {
        score += Math.round(20 * weight * fieldBoost)
        matchedTerms.push(term)
        categories.push('judi online/spam')
      }
    }

    for (const term of AMBIGUOUS_TERMS) {
      if (hasWord(text, term)) {
        score += Math.round(5 * weight * fieldBoost)
        matchedTerms.push(term)
        categories.push('kata ambigu berisiko')
      }
    }

    for (const term of ILLEGAL_TERMS) {
      if (text.includes(term)) {
        score += Math.round(24 * weight * fieldBoost)
        matchedTerms.push(term)
        categories.push('produk ilegal/berbahaya')
      }
    }

    for (const term of ABUSE_TERMS) {
      if (text.includes(term)) {
        score += Math.round(18 * weight * fieldBoost)
        matchedTerms.push(term)
        categories.push('konten berbahaya')
      }
    }

    const externalLinks = text.match(/https?:\/\/[^\s]+/g) || []
    if (externalLinks.length > 0) {
      score += 12 * externalLinks.length
      matchedTerms.push('link eksternal')
      categories.push('link mencurigakan')

      if (externalLinks.some((link: string) => SUSPICIOUS_TLDS.some((tld) => link.includes(tld)))) {
        score += 28
        matchedTerms.push('domain mencurigakan')
      }
    }

    const repeated = findRepeatedSuspiciousTerms(text, [...AMBIGUOUS_TERMS, ...STRONG_SINGLE_TERMS])
    if (repeated.length > 0) {
      score += 18 + repeated.length * 4
      matchedTerms.push(...repeated)
      categories.push('spam SEO')
    }
  }

  const cleanTerms = unique(matchedTerms).slice(0, 12)
  const cleanCategories = unique(categories).slice(0, 6)
  let level: ModerationLevel = 'safe'
  let status: ModerationStatus = 'safe'

  if (score >= 80) {
    level = 'high'
    status = 'suspended'
  } else if (score >= 45) {
    level = 'medium'
    status = 'pending_review'
  } else if (score > 0) {
    level = 'low'
    status = 'flagged'
  }

  const reason = cleanTerms.length
    ? `Terdeteksi konten berisiko ${cleanCategories[0] || 'spam'}: ${cleanTerms.slice(0, 5).join(', ')}`
    : null

  return {
    level,
    status,
    score,
    categories: cleanCategories,
    matchedTerms: cleanTerms,
    reason,
    sellerMessage: createSellerModerationMessage(level, cleanTerms, cleanCategories),
    shouldBlockPublish: level === 'medium' || level === 'high',
  }
}

export function createSellerModerationMessage(level: ModerationLevel, terms: string[], categories: string[]) {
  if (level === 'safe' || terms.length === 0) return null

  const visibleTerms = terms.slice(0, 5).map((term) => `'${term}'`).join(', ')
  const category = categories[0] || 'konten berisiko'

  if (level === 'low') {
    if (terms.includes('slot')) {
      return "Kami mendeteksi kata 'slot'. Jika maksud Anda stok barang atau ruang rak, gunakan kata yang lebih jelas seperti 'stok' atau 'ruang'. Anda tetap bisa melanjutkan jika konteksnya aman."
    }
    if (terms.includes('gacor')) {
      return "Kami mendeteksi kata yang bisa disalahartikan: 'gacor'. Jika maksud Anda produk bagus atau laris, gunakan kata seperti 'laris', 'banyak diminati', atau 'best seller'. Anda tetap bisa melanjutkan."
    }
    return `Kami mendeteksi kata yang bisa disalahartikan: ${visibleTerms}. Jika konteksnya normal, gunakan istilah yang lebih jelas. Anda tetap bisa melanjutkan.`
  }

  if (level === 'medium') {
    return `Konten ini mengandung beberapa kata/frasa yang sering digunakan dalam ${category}: ${visibleTerms}. Silakan ubah konten sebelum toko dipublikasikan, atau ajukan peninjauan jika menurut Anda ini salah deteksi.`
  }

  return `Konten ini terdeteksi berisiko tinggi melanggar pedoman WebTokoku karena mengarah ke ${category}. Toko akan masuk peninjauan admin dan belum bisa dipublikasikan.`
}

export function storeModerationInputs(store: Record<string, unknown>): ModerationInput[] {
  return [
    { field: 'nama_toko', value: store.nama_toko, weight: 1.4 },
    { field: 'slug', value: store.slug, weight: 1.6 },
    { field: 'deskripsi', value: store.deskripsi, weight: 1 },
    { field: 'business_category', value: store.business_category, weight: 1.1 },
    { field: 'hero_title', value: store.hero_title, weight: 1.1 },
    { field: 'hero_subtitle', value: store.hero_subtitle, weight: 1 },
    { field: 'alamat', value: store.alamat, weight: 0.5 },
  ]
}

export function productModerationInputs(product: Record<string, unknown>): ModerationInput[] {
  return [
    { field: 'nama', value: product.nama, weight: 1.25 },
    { field: 'kategori', value: product.kategori, weight: 1 },
    { field: 'deskripsi', value: product.deskripsi, weight: 1 },
    { field: 'badge_label', value: product.badge_label, weight: 0.8 },
    { field: 'product_details', value: product.product_details, weight: 0.8 },
    { field: 'option_groups', value: product.option_groups, weight: 0.8 },
    { field: 'addons', value: product.addons, weight: 0.8 },
  ]
}

export function customizationModerationInputs(snapshot: Record<string, unknown>): ModerationInput[] {
  return Object.entries(snapshot).map(([field, value]) => ({
    field,
    value,
    weight: /title|heading|hero/i.test(field) ? 1.15 : 0.8,
  }))
}

export function moderationPatch(result: ModerationResult) {
  return {
    moderation_status: result.status,
    moderation_reason: result.reason,
    moderation_score: result.score,
    moderation_matched_terms: result.matchedTerms,
    moderation_categories: result.categories,
    moderation_checked_at: new Date().toISOString(),
  }
}

export function isPublicModerationStatus(status?: string | null) {
  return !status || status === 'safe' || status === 'flagged'
}

export function isLockedModerationStatus(status?: string | null) {
  return status === 'pending_review' || status === 'suspended' || status === 'blocked'
}
