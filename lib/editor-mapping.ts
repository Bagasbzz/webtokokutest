/**
 * Returns data-editable attribute ONLY in preview mode.
 * In production storefront, returns empty object (no attribute rendered).
 */
export function getEditableAttr(
  previewMode: boolean | undefined,
  editableKey: string
): Record<string, string> {
  if (!previewMode) return {}
  return { 'data-editable': editableKey }
}

/**
 * Returns data-section-id attribute ONLY in preview mode.
 * Used by InlineSectionToolbar to identify & control sections.
 */
export function getSectionAttr(
  previewMode: boolean | undefined,
  sectionId: string
): Record<string, string> {
  if (!previewMode) return {}
  return { 'data-section-id': sectionId }
}
