import { useState, memo } from 'react'
import { C, badgeColor } from '../styles'

const FALLBACK_COLORS = ['#FFE4E1', '#E8F4FD', '#F0FDF4', '#FFF7ED', '#F5F3FF', '#FDF2F8']

const PGCard = memo(function PGCard({ pg, onClick }) {
  const [hov, setHov] = useState(false)
  const [imgError, setImgError] = useState(false)
  const bc = badgeColor(pg.badge)
  const fallbackBg = FALLBACK_COLORS[pg.id % FALLBACK_COLORS.length] || '#F9FAFB'

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff', borderRadius: 16, overflow: 'hidden',
        border: '1px solid #E5E7EB', cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.11)' : '0 2px 6px rgba(0,0,0,0.04)',
      }}
    >
      {/* Image area */}
      <div style={{ position: 'relative', height: 195, background: fallbackBg, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!imgError ? (
          <img
            src={pg.images[0]}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setImgError(true)}
          />
        ) : (
          /* Clean fallback when image fails */
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 44, marginBottom: 6 }}>🏠</div>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, fontWeight: 500 }}>{pg.area}</p>
          </div>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {pg.badge && (
            <span style={{ background: bc || '#374151', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>
              {pg.badge}
            </span>
          )}
          {pg.verified && (
            <span style={{ background: '#10B981', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>
              ✓ Verified
            </span>
          )}
        </div>

        {/* City chip */}
        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 12 }}>
          {pg.city}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, color: '#1A1A2E', flex: 1, paddingRight: 8, lineHeight: 1.35, margin: 0 }}>
            {pg.name}
          </h3>
          {pg.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap', flexShrink: 0 }}>
              <span style={{ color: '#FBBF24', fontSize: 12 }}>★</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1A1A2E' }}>{pg.rating}</span>
              <span style={{ color: '#6B7280', fontSize: 11 }}>({pg.reviews})</span>
            </div>
          )}
        </div>

        <p style={{ color: '#6B7280', fontSize: 12, margin: '0 0 2px' }}>📍 {pg.area}</p>
        <p style={{ color: '#3B82F6', fontSize: 12, fontWeight: 600, margin: '0 0 11px' }}>🏫 {pg.distance}</p>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 11 }}>
          {pg.amenities.slice(0, 3).map(a => (
            <span key={a} style={{ background: '#F9FAFB', color: '#6B7280', fontSize: 11, padding: '3px 7px', borderRadius: 6, fontWeight: 500, border: '0.5px solid #E5E7EB' }}>
              {a}
            </span>
          ))}
          {pg.amenities.length > 3 && (
            <span style={{ background: '#F9FAFB', color: '#6B7280', fontSize: 11, padding: '3px 7px', borderRadius: 6, fontWeight: 500, border: '0.5px solid #E5E7EB' }}>
              +{pg.amenities.length - 3}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: 19, color: '#FF5A3C' }}>₹{pg.rent.toLocaleString()}</span>
            <span style={{ color: '#6B7280', fontSize: 12 }}>/mo</span>
          </div>
          <span style={{
            background: pg.gender === 'Girls' ? '#FDF2F8' : pg.gender === 'Boys' ? '#EFF6FF' : '#F0FDF4',
            color: pg.gender === 'Girls' ? '#9D174D' : pg.gender === 'Boys' ? '#1E40AF' : '#14532D',
            fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
          }}>
            {pg.gender}
          </span>
        </div>
      </div>
    </div>
  )
})

export default PGCard