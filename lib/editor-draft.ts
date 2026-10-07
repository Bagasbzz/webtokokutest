const DRAFT_PREFIX = 'editor-draft-'

export function saveDraft(storeId: string, data: Record<string, string>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DRAFT_PREFIX + storeId, JSON.stringify({
      data,
      savedAt: Date.now()
    }))
  } catch (err) {
    console.error('Failed to save draft:', err)
  }
}

export function loadDraft(storeId: string): Record<string, string> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + storeId)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    
    // Draft expired after 24 hours
    if (Date.now() - parsed.savedAt > 86_400_000) {
      clearDraft(storeId)
      return null
    }
    return parsed.data
  } catch (err) {
    console.error('Failed to load draft:', err)
    return null
  }
}

export function clearDraft(storeId: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(DRAFT_PREFIX + storeId)
  } catch (err) {
    console.error('Failed to clear draft:', err)
  }
}

export function getDraftAge(storeId: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + storeId)
    if (!raw) return null
    const { savedAt } = JSON.parse(raw)
    const mins = Math.floor((Date.now() - savedAt) / 60000)
    if (mins < 1) return 'baru saja'
    if (mins < 60) return `${mins} menit lalu`
    return `${Math.floor(mins/60)} jam lalu`
  } catch {
    return null
  }
}
