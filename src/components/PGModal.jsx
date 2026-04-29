import { useState } from 'react'
import { C, badgeColor, btnPrimary, btnSecondary } from '../styles'
import { supabase } from '../supabase'

const inp = {
  width:'100%', border:'1.5px solid #E5E7EB', borderRadius:9,
  padding:'11px 14px', fontSize:14, color:'#1A1A2E', background:'#fff',
  outline:'none', boxSizing:'border-box', fontFamily:'inherit',
}
const onFoc = e => { e.target.style.borderColor='#FF5A3C'; e.target.style.boxShadow='0 0 0 3px rgba(255,90,60,0.1)' }
const onBlr = e => { e.target.style.borderColor='#E5E7EB'; e.target.style.boxShadow='none' }

export default function PGModal({ pg, user, onClose, onLoginRequired, showToast, wishlist = [], setWishlist }) {
  const [imgIdx,      setImgIdx]      = useState(0)
  const [showEnquiry, setShowEnquiry] = useState(false)
  const [message,     setMessage]     = useState('')
  const [moveDate,    setMoveDate]    = useState('')
  const [budget,      setBudget]      = useState('')
  const [sending,     setSending]     = useState(false)
  const [sent,        setSent]        = useState(false)
  const isWishlisted = wishlist.some(w => String(w.id) === String(pg.id))

  const toggleWishlist = () => {
    let updated
    if (isWishlisted) {
      updated = wishlist.filter(w => String(w.id) !== String(pg.id))
      showToast('Removed from wishlist')
    } else {
      updated = [...wishlist, pg]
      showToast('Saved to wishlist ❤️')
    }
    setWishlist(updated)
    localStorage.setItem('homies_wishlist', JSON.stringify(updated))
  }
  const bc = badgeColor(pg.badge)

  const submitEnquiry = async () => {
    if (!message.trim()) { showToast('Please write a message', 'info'); return }
    setSending(true)
    try {
      const { error } = await supabase.from('enquiries').insert({
        student_id:    user.id,
        student_name:  user.name,
        student_email: user.email,
        pg_id:         String(pg.id),
        pg_name:       pg.name,
        pg_area:       pg.area,
        pg_city:       pg.city,
        pg_rent:       pg.rent,
        message:       message.trim(),
        move_in_date:  moveDate || null,
        budget:        budget   || null,
        status:        'pending',
      })
      if (error) throw error
      setSent(true)
      showToast('Enquiry sent! The owner will contact you soon ✅')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) { onClose(); setImgIdx(0) } }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:999, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:16, overflowY:'auto' }}
    >
      <div style={{ background:'#fff', borderRadius:22, maxWidth:820, width:'100%', marginTop:20, marginBottom:20, overflow:'hidden', boxShadow:'0 32px 100px rgba(0,0,0,0.25)' }}>

        {/* Gallery */}
        <div style={{ position:'relative', height:300, background:'#111' }}>
          <img src={pg.images[imgIdx]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.93 }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 55%,rgba(0,0,0,0.4))' }} />
          <div style={{ position:'absolute', top:14, left:14, display:'flex', gap:8 }}>
            {pg.badge && <span style={{ background:bc, color:'#fff', fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20 }}>{pg.badge}</span>}
            {pg.verified && <span style={{ background:'#10B981', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20 }}>✓ Verified</span>}
          </div>
          <button onClick={() => { onClose(); setImgIdx(0) }} style={{ position:'absolute', top:14, right:14, background:'rgba(0,0,0,0.5)', color:'#fff', border:'none', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontWeight:600, fontSize:13 }}>✕ Close</button>
          <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', display:'flex', gap:6 }}>
            {pg.images.map((_, i) => <div key={i} onClick={() => setImgIdx(i)} style={{ width:i===imgIdx?24:8, height:8, borderRadius:4, background:i===imgIdx?'#fff':'rgba(255,255,255,0.4)', cursor:'pointer', transition:'all 0.3s' }} />)}
          </div>
          <div style={{ position:'absolute', top:58, left:14, display:'flex', gap:8 }}>
            {pg.images.map((src, i) => <img key={i} src={src} alt="" onClick={() => setImgIdx(i)} style={{ width:70, height:50, borderRadius:8, objectFit:'cover', cursor:'pointer', border:i===imgIdx?'2.5px solid #fff':'2px solid transparent', opacity:i===imgIdx?1:0.6, transition:'all 0.2s' }} />)}
          </div>
        </div>

        <div style={{ padding:26 }}>
          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:14, marginBottom:18 }}>
            <div>
              <h2 style={{ fontWeight:800, fontSize:20, color:C.text, margin:'0 0 6px', lineHeight:1.3 }}>{pg.name}</h2>
              <p style={{ margin:'0 0 4px', color:C.muted, fontSize:13 }}>📍 {pg.area}, {pg.city}</p>
              <p style={{ margin:'0 0 8px', color:C.info, fontSize:13, fontWeight:600 }}>🏫 {pg.distance}</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {pg.highlights?.map(h => <span key={h} style={{ background:'#F0FDF4', color:'#15803D', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>✓ {h}</span>)}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ fontWeight:800, fontSize:26, color:C.primary, margin:0 }}>₹{pg.rent.toLocaleString()}<span style={{ fontSize:13, fontWeight:500, color:C.muted }}>/mo</span></p>
              <p style={{ margin:'4px 0 0', fontSize:12, color:C.muted }}>Deposit: ₹{(pg.deposit||0).toLocaleString()}</p>
              {pg.rating > 0 && <div style={{ display:'flex', alignItems:'center', gap:3, justifyContent:'flex-end', marginTop:6 }}>
                <span style={{ color:'#FBBF24', fontSize:13 }}>{'★'.repeat(Math.floor(pg.rating))}</span>
                <span style={{ fontWeight:700, fontSize:13 }}>{pg.rating}</span>
                <span style={{ color:C.muted, fontSize:12 }}>({pg.reviews} reviews)</span>
              </div>}
            </div>
          </div>

          {/* Info grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:18 }}>
            {[{i:'🏠',l:'Type',v:`${pg.bhk} BHK`},{i:'👤',l:'For',v:pg.gender},{i:'🛏️',l:'Room',v:pg.roomTypes?.[0]||'Sharing'}].map(d => (
              <div key={d.l} style={{ background:C.bg, borderRadius:10, padding:'10px 12px', textAlign:'center' }}>
                <p style={{ margin:'0 0 3px', fontSize:16 }}>{d.i}</p>
                <p style={{ margin:'0 0 2px', fontSize:10, color:C.muted, fontWeight:600, textTransform:'uppercase' }}>{d.l}</p>
                <p style={{ margin:0, fontSize:12, fontWeight:700, color:C.text }}>{d.v}</p>
              </div>
            ))}
          </div>

          {/* Amenities */}
          <div style={{ marginBottom:18 }}>
            <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:10 }}>Amenities</h3>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
              {pg.amenities?.map(a => <span key={a} style={{ background:'#EFF6FF', color:'#1D4ED8', padding:'5px 11px', borderRadius:20, fontSize:12, fontWeight:600 }}>{a}</span>)}
            </div>
          </div>

          {/* Description */}
          {pg.desc && <div style={{ marginBottom:18 }}>
            <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:8 }}>About this PG</h3>
            <p style={{ color:C.muted, fontSize:14, lineHeight:1.75, margin:0 }}>{pg.desc}</p>
          </div>}

          {/* Colleges */}
          {pg.colleges?.length > 0 && <div style={{ marginBottom:22 }}>
            <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:10 }}>Nearby Colleges</h3>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
              {pg.colleges.map(col => <span key={col} style={{ background:'#F0FDF4', color:'#15803D', padding:'5px 11px', borderRadius:20, fontSize:12, fontWeight:600 }}>🎓 {col}</span>)}
            </div>
          </div>}

          {/* ── ENQUIRY FORM ── */}
          {showEnquiry && (
            <div style={{ background:'#F9FAFB', borderRadius:16, padding:20, marginBottom:20, border:'1px solid #E5E7EB' }}>
              <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:14 }}>
                {sent ? '✅ Enquiry Sent!' : '💬 Send Enquiry to Owner'}
              </h3>
              {sent ? (
                <div style={{ textAlign:'center', padding:'10px 0 4px' }}>
                  <p style={{ color:'#166534', fontWeight:600, fontSize:14, margin:'0 0 6px' }}>Your enquiry has been saved to our database.</p>
                  <p style={{ color:C.muted, fontSize:13, margin:0 }}>The owner will call you on your registered number. You will also get a confirmation on your email.</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom:12 }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, textTransform:'uppercase', letterSpacing:'0.04em' }}>Your Message *</label>
                    <textarea
                      value={message} onChange={e => setMessage(e.target.value)}
                      placeholder={`Hi, I am interested in ${pg.name}. Could you share availability and room details?`}
                      style={{ ...inp, height:88, resize:'vertical' }}
                      onFocus={onFoc} onBlur={onBlr}
                    />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, textTransform:'uppercase', letterSpacing:'0.04em' }}>Move-in Date</label>
                      <input type="date" value={moveDate} onChange={e => setMoveDate(e.target.value)} style={inp} onFocus={onFoc} onBlur={onBlr} />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, textTransform:'uppercase', letterSpacing:'0.04em' }}>Your Budget (₹/mo)</label>
                      <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 12000" style={inp} onFocus={onFoc} onBlur={onBlr} />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={submitEnquiry} disabled={sending} style={{ ...btnPrimary, flex:1, padding:'12px', background:'#10B981', opacity:sending?0.8:1, cursor:sending?'not-allowed':'pointer' }}>
                      {sending ? 'Sending...' : 'Send Enquiry →'}
                    </button>
                    <button onClick={() => setShowEnquiry(false)} style={{ ...btnSecondary, padding:'12px 18px' }}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Owner + Contact */}
          <div style={{ background:C.bg, borderRadius:14, padding:18, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:46, height:46, background:C.primary, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:18 }}>
                {(pg.owner||'O')[0]}
              </div>
              <div>
                <p style={{ margin:0, fontWeight:700, fontSize:14, color:C.text }}>{pg.owner||'Property Owner'}</p>
                <p style={{ margin:'2px 0 0', fontSize:12, color:C.muted }}>Property Owner{pg.verified ? ' · ✓ KYC Verified' : ''}</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button
                onClick={() => {
                if (!user) { onLoginRequired(); return }
                if (user.role === 'owner') { showToast('Owners cannot contact other PG owners.', 'info'); return }
                showToast(`Owner contact: +91 ${pg.phone}`, 'info')
              }}
                style={{ ...btnPrimary, padding:'10px 20px', fontSize:14 }}>
                📞 {user ? (pg.phone ? `+91 ${pg.phone}` : 'Contact Owner') : 'View Contact'}
              </button>
              <button
                onClick={() => {
                  if (!user) { onLoginRequired(); return }
                  if (user.role === 'owner') { showToast('Owners cannot send student enquiries.', 'info'); return }
                  setShowEnquiry(s => !s)
                }}
                style={{ ...btnSecondary, padding:'10px 16px', fontSize:14, background:sent?'#F0FDF4':'#fff', borderColor:sent?'#10B981':C.border, color:sent?'#15803D':C.text }}>
                {sent ? '✅ Enquiry Sent' : '💬 Send Enquiry'}
              </button>
              <button onClick={toggleWishlist} style={{ ...btnSecondary, padding:'10px 14px', background: isWishlisted ? '#FDF2F8' : '#fff', borderColor: isWishlisted ? '#F9A8D4' : C.border }}>{isWishlisted ? '❤️' : '♡'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}