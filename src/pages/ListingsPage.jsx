import PGCard from '../components/PGCard'
import { C, inputStyle, labelStyle, btnSecondary } from '../styles'

export default function ListingsPage({ pgs, filters, setFilters, setSelectedPG, totalCount, loading, liveCount, user, setPage }) {
  const upd = (k, v) => setFilters(f => ({ ...f, [k]: v }))
  const clear = () => setFilters({ search: '', city: '', gender: '', bhk: '', maxRent: 35000 })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '26px 20px' }}>

      {/* Owner warning banner */}
      {user?.role === 'owner' && (
        <div style={{ background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:12, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <div>
            <p style={{ fontWeight:700, fontSize:13, color:'#92400E', margin:'0 0 3px' }}>You are logged in as a Property Owner</p>
            <p style={{ fontSize:12, color:'#B45309', margin:0 }}>
              This section is for students finding PGs. As an owner,
              <span onClick={() => setPage('dashboard')} style={{ color:C.primary, fontWeight:700, cursor:'pointer', marginLeft:4 }}>go to your Dashboard →</span>
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontWeight: 800, fontSize: 22, color: '#1A1A2E', marginBottom: 4 }}>
          {filters.city ? `PGs in ${filters.city}` : 'All PGs Across India'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>
            Showing {pgs.length} of {totalCount} {filters.city ? `properties in ${filters.city}` : 'properties across 8 cities'}
          </p>
          {loading && (
            <span style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                display: 'inline-block', width: 10, height: 10,
                border: '2px solid #E5E7EB', borderTopColor: C.primary,
                borderRadius: '50%', animation: 'spin 0.7s linear infinite',
              }} />
              Loading live listings...
            </span>
          )}
          {!loading && liveCount > 0 && (
            <span style={{ background: '#F0FDF4', color: '#16A34A', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, border: '1px solid #BBF7D0' }}>
              🟢 {liveCount} new owner {liveCount === 1 ? 'listing' : 'listings'} live
            </span>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 13, padding: 16, marginBottom: 22, border: `1px solid ${C.border}`, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={labelStyle}>Search Area / Name</label>
          <input
            value={filters.search}
            onChange={e => upd('search', e.target.value)}
            placeholder="Andheri, Vashi, Hinjewadi..."
            style={inputStyle}
          />
        </div>
        <div style={{ minWidth: 130 }}>
          <label style={labelStyle}>City</label>
          <select value={filters.city || ''} onChange={e => upd('city', e.target.value)} style={inputStyle}>
            <option value="">All Cities</option>
            <option>Mumbai</option>
            <option>Navi Mumbai</option>
            <option>Pune</option>
            <option>Delhi</option>
            <option>Bangalore</option>
            <option>Hyderabad</option>
            <option>Chennai</option>
            <option>Noida</option>
            <option>Kolkata</option>
            <option>Ahmedabad</option>
            <option>Chandigarh</option>
            <option>Jaipur</option>
          </select>
        </div>
        <div style={{ minWidth: 115 }}>
          <label style={labelStyle}>Gender</label>
          <select value={filters.gender} onChange={e => upd('gender', e.target.value)} style={inputStyle}>
            <option value="">All</option>
            <option>Boys</option>
            <option>Girls</option>
            <option>Co-ed</option>
          </select>
        </div>
        <div style={{ minWidth: 100 }}>
          <label style={labelStyle}>BHK</label>
          <select value={filters.bhk} onChange={e => upd('bhk', e.target.value)} style={inputStyle}>
            <option value="">Any</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3+ BHK</option>
          </select>
        </div>
        <div style={{ minWidth: 190 }}>
          <label style={labelStyle}>Max Rent: ₹{filters.maxRent.toLocaleString()}/mo</label>
          <input
            type="range" min={3000} max={35000} step={500}
            value={filters.maxRent}
            onChange={e => upd('maxRent', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: C.primary }}
          />
        </div>
        <button onClick={clear} style={{ ...btnSecondary, height: 40, fontSize: 12 }}>Clear</button>
      </div>

      {/* Results */}
      {pgs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <p style={{ fontSize: 48, margin: '0 0 14px' }}>🏠</p>
          <h3 style={{ fontWeight: 700, fontSize: 18, color: '#1A1A2E', marginBottom: 6 }}>No PGs found</h3>
          <p style={{ color: C.muted, fontSize: 14 }}>Try adjusting your filters or search for a different area.</p>
          <button onClick={clear} style={{ marginTop: 16, background: C.primary, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Owner-listed PGs section (if any) */}
          {pgs.some(p => p.isOwnerListed) && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🟢</span>
              <p style={{ margin: 0, fontSize: 13, color: '#166534', fontWeight: 600 }}>
                New owner-submitted listings are shown first — verified by Homies team
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 20 }}>
            {/* Owner live listings first */}
            {pgs.filter(p => p.isOwnerListed).map(pg => (
              <PGCard key={pg.id} pg={pg} onClick={() => setSelectedPG(pg)} />
            ))}
            {/* Then static data.js listings */}
            {pgs.filter(p => !p.isOwnerListed).map(pg => (
              <PGCard key={pg.id} pg={pg} onClick={() => setSelectedPG(pg)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}