export default function Toast({ msg, type }) {
  const bg = type === 'error' ? '#EF4444' : type === 'info' ? '#3B82F6' : '#10B981'
  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      background: bg, color: '#fff', padding: '12px 20px',
      borderRadius: 12, fontWeight: 600, fontSize: 14,
      maxWidth: 340, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      lineHeight: 1.5, animation: 'fadeIn 0.3s ease',
    }}>
      {msg}
    </div>
  )
}
