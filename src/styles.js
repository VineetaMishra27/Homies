export const C = {
  primary: '#FF5A3C',
  secondary: '#1A1A2E',
  bg: '#FAFAF8',
  text: '#1A1A2E',
  muted: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  info: '#3B82F6',
}

export const btnPrimary = {
  background: C.primary, color: '#fff', border: 'none',
  padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
  fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
  transition: 'opacity 0.2s',
}

export const btnSecondary = {
  background: '#fff', color: C.text,
  border: `1.5px solid ${C.border}`,
  padding: '9px 18px', borderRadius: 10, cursor: 'pointer',
  fontWeight: 600, fontSize: 14, fontFamily: 'inherit',
}

export const inputStyle = {
  width: '100%', border: `1.5px solid ${C.border}`,
  borderRadius: 9, padding: '10px 13px',
  fontSize: 14, color: C.text, background: '#fff',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}

export const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: C.muted, marginBottom: 5,
  textTransform: 'uppercase', letterSpacing: '0.04em',
}

export function badgeColor(badge) {
  if (!badge) return null
  if (badge.includes('Girls')) return '#DB2777'
  if (badge === 'Budget' || badge === 'Budget Pick') return '#059669'
  if (badge === 'Executive') return '#D97706'
  if (badge === 'Co-ed') return '#0891B2'
  if (badge === 'Trending') return '#FF5A3C'
  return '#7C3AED'
}
