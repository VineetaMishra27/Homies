import { useState, useEffect } from 'react'
import { C, btnPrimary, btnSecondary } from '../styles'
import { supabase } from '../supabase'
import PGCard from '../components/PGCard'

export default function StudentDashboard({ user, setPage, showToast, wishlist, setWishlist, setSelectedPG }) {
  const [tab,       setTab]       = useState('wishlist')
  const [enquiries, setEnquiries] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => { if (user?.id) fetchEnquiries() }, [user])

  const fetchEnquiries = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('enquiries').select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
      setEnquiries(data || [])
    } catch {
      setEnquiries([])
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = (pgId) => {
    const updated = wishlist.filter(pg => String(pg.id) !== String(pgId))
    setWishlist(updated)
    localStorage.setItem('homies_wishlist', JSON.stringify(updated))
    showToast('Removed from wishlist')
  }

  if (!user || user.role !== 'student') {
    return (
      <div style={{ maxWidth:500, margin:'80px auto', textAlign:'center', padding:20 }}>
        <p style={{ fontSize:48, marginBottom:14 }}>🔒</p>
        <h2 style={{ fontWeight:800, fontSize:22, color:C.text, marginBottom:8 }}>Student Access Only</h2>
        <button onClick={() => setPage('home')} style={{ ...btnPrimary, padding:'12px 28px' }}>Back to Home</button>
      </div>
    )
  }

  const STATUS_COLOR = { pending:'#F59E0B', read:'#3B82F6', replied:'#10B981' }
  const STATUS_BG    = { pending:'#FFF7ED', read:'#EFF6FF', replied:'#F0FDF4' }

  return (
    <div style={{ maxWidth:1000, margin:'0 auto', padding:'32px 20px' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:14, marginBottom:28 }}>
        <div>
          <h1 style={{ fontWeight:800, fontSize:24, color:C.text, margin:'0 0 5px' }}>My Account</h1>
          <p style={{ color:C.muted, fontSize:13, margin:0 }}>{user.name} · {user.email} · {user.city || 'India'}</p>
        </div>
        <button onClick={() => setPage('listings')} style={{ ...btnPrimary, padding:'11px 22px' }}>Find PGs →</button>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:28 }}>
        {[
          { icon:'❤️', label:'Saved PGs', value:wishlist.length, color:C.primary },
          { icon:'💬', label:'Enquiries Sent', value:enquiries.length },
          { icon:'⏳', label:'Awaiting Reply', value:enquiries.filter(e=>e.status==='pending').length, color:'#F59E0B' },
          { icon:'✅', label:'Replied', value:enquiries.filter(e=>e.status==='replied').length, color:'#10B981' },
        ].map(s => (
          <div key={s.label} style={{ background:'#fff', borderRadius:14, padding:'18px 22px', border:'1px solid #E5E7EB', flex:1, minWidth:130 }}>
            <div style={{ fontSize:26, marginBottom:8 }}>{s.icon}</div>
            <p style={{ fontWeight:800, fontSize:26, color:s.color||C.text, margin:'0 0 3px' }}>{s.value}</p>
            <p style={{ fontSize:12, color:C.muted, margin:0, fontWeight:600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:22, background:'#F9FAFB', padding:4, borderRadius:12, border:'1px solid #F3F4F6', width:'fit-content' }}>
        {[['wishlist','❤️ Saved PGs'], ['enquiries','💬 My Enquiries'], ['profile','👤 Profile']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding:'9px 20px', borderRadius:9, border:'none', cursor:'pointer',
            fontFamily:'inherit', fontWeight:600, fontSize:13,
            background:tab===k?'#fff':'transparent',
            color:tab===k?C.text:C.muted,
            boxShadow:tab===k?'0 2px 8px rgba(0,0,0,0.08)':'none',
            transition:'all 0.15s',
          }}>{l}</button>
        ))}
      </div>

      {/* ── WISHLIST TAB ── */}
      {tab === 'wishlist' && (
        <div>
          {wishlist.length === 0 ? (
            <div style={{ background:'#fff', borderRadius:16, padding:'60px 20px', textAlign:'center', border:'1px solid #E5E7EB' }}>
              <p style={{ fontSize:48, marginBottom:12 }}>♡</p>
              <h3 style={{ fontWeight:700, fontSize:18, color:C.text, marginBottom:8 }}>No saved PGs yet</h3>
              <p style={{ color:C.muted, fontSize:14, marginBottom:20 }}>Click the ♡ button on any PG to save it here.</p>
              <button onClick={() => setPage('listings')} style={{ ...btnPrimary, padding:'12px 28px' }}>Browse PGs →</button>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <p style={{ color:C.muted, fontSize:13, margin:0 }}>{wishlist.length} saved {wishlist.length===1?'property':'properties'}</p>
                <button onClick={() => { setWishlist([]); localStorage.removeItem('homies_wishlist') }}
                  style={{ ...btnSecondary, fontSize:12, color:'#B91C1C', borderColor:'#FECACA', padding:'6px 14px' }}>
                  Clear All
                </button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
                {wishlist.map(pg => (
                  <div key={pg.id} style={{ position:'relative' }}>
                    <PGCard pg={pg} onClick={() => setSelectedPG(pg)} />
                    <button onClick={() => removeFromWishlist(pg.id)} style={{
                      position:'absolute', top:10, right:10, background:'#fff', border:'none',
                      borderRadius:'50%', width:30, height:30, cursor:'pointer', fontSize:16,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow:'0 2px 8px rgba(0,0,0,0.15)', zIndex:2,
                    }}>❤️</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ENQUIRIES TAB ── */}
      {tab === 'enquiries' && (
        <div>
          {loading ? (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ width:32, height:32, border:'3px solid #E5E7EB', borderTopColor:C.primary, borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 14px' }} />
              <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
            </div>
          ) : enquiries.length === 0 ? (
            <div style={{ background:'#fff', borderRadius:16, padding:'60px 20px', textAlign:'center', border:'1px solid #E5E7EB' }}>
              <p style={{ fontSize:40, marginBottom:12 }}>💬</p>
              <h3 style={{ fontWeight:700, fontSize:18, color:C.text, marginBottom:8 }}>No enquiries yet</h3>
              <p style={{ color:C.muted, fontSize:14 }}>When you send an enquiry to a PG owner, it will appear here.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {enquiries.map(e => (
                <div key={e.id} style={{ background:'#fff', borderRadius:14, padding:'18px 20px', border:'1px solid #E5E7EB' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10, marginBottom:10 }}>
                    <div>
                      <h3 style={{ fontWeight:700, fontSize:15, color:C.text, margin:'0 0 4px' }}>{e.pg_name}</h3>
                      <p style={{ fontSize:12, color:C.muted, margin:0 }}>
                        {e.pg_area && `📍 ${e.pg_area}`} {e.pg_city && `· ${e.pg_city}`}
                        {e.pg_rent && ` · ₹${Number(e.pg_rent).toLocaleString()}/mo`}
                      </p>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:STATUS_BG[e.status]||'#F9FAFB', color:STATUS_COLOR[e.status]||C.muted }}>
                        {e.status === 'pending' ? '⏳ Awaiting Reply' : e.status === 'read' ? '👁️ Seen by Owner' : '✅ Replied'}
                      </span>
                      <span style={{ fontSize:11, color:'#9CA3AF' }}>
                        {new Date(e.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div style={{ background:'#F9FAFB', borderRadius:8, padding:'10px 14px', marginBottom:8 }}>
                    <p style={{ fontSize:13, color:C.text, margin:0, lineHeight:1.6 }}>{e.message}</p>
                  </div>
                  {(e.move_in_date || e.budget) && (
                    <div style={{ display:'flex', gap:16, fontSize:12, color:C.muted }}>
                      {e.move_in_date && <span>📅 Move-in: {e.move_in_date}</span>}
                      {e.budget && <span>💰 Budget: ₹{Number(e.budget).toLocaleString()}/mo</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PROFILE TAB ── */}
      {tab === 'profile' && (
        <div style={{ background:'#fff', borderRadius:16, padding:28, border:'1px solid #E5E7EB' }}>
          <h2 style={{ fontWeight:700, fontSize:16, color:C.text, marginBottom:22 }}>Your Profile</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[
              ['Full Name', user.name],
              ['Email', user.email],
              ['Role', 'Student'],
              ['City', user.city || '—'],
              ['College', user.college || '—'],
              ['Account Status', user.verified ? '✅ ID Verified' : '⏳ Pending Verification'],
            ].map(([label, value]) => (
              <div key={label} style={{ background:'#F9FAFB', borderRadius:10, padding:'14px 16px' }}>
                <p style={{ fontSize:11, fontWeight:600, color:C.muted, margin:'0 0 5px', textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</p>
                <p style={{ fontSize:14, fontWeight:600, color:C.text, margin:0 }}>{value}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:20, padding:'14px 16px', background:'#FFF7ED', borderRadius:10, border:'1px solid #FED7AA' }}>
            <p style={{ fontSize:13, color:'#92400E', fontWeight:600, margin:'0 0 3px' }}>🔒 ID Verification</p>
            <p style={{ fontSize:12, color:'#B45309', margin:0 }}>
              Your ID proof was submitted during signup and is securely stored. Our team verifies all IDs within 24 hours for platform safety.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}