import { useState, useEffect } from 'react'
import { C, btnPrimary, btnSecondary } from '../styles'
import { supabase } from '../supabase'

const inp = { width:'100%', border:'1.5px solid #E5E7EB', borderRadius:9, padding:'10px 14px', fontSize:14, color:'#1A1A2E', background:'#fff', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{ background:'#fff', borderRadius:14, padding:'20px 22px', border:'1px solid #E5E7EB', flex:1, minWidth:140 }}>
      <div style={{ fontSize:28, marginBottom:10 }}>{icon}</div>
      <p style={{ fontWeight:800, fontSize:28, color: color||C.text, margin:'0 0 3px' }}>{value}</p>
      <p style={{ fontSize:12, color:C.muted, margin:0, fontWeight:600 }}>{label}</p>
      {sub && <p style={{ fontSize:11, color:'#9CA3AF', margin:'3px 0 0' }}>{sub}</p>}
    </div>
  )
}

export default function OwnerDashboard({ user, setPage, showToast }) {
  const [tab,       setTab]       = useState('listings')
  const [listings,  setListings]  = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [editing,   setEditing]   = useState(null)   // listing being edited
  const [editData,  setEditData]  = useState({})

  useEffect(() => { if (user?.id) fetchAll() }, [user])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const { data: ls } = await supabase
        .from('pg_listings').select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      const myListings = ls || []
      setListings(myListings)

      if (myListings.length > 0) {
        // Match both raw UUID and sb_ prefixed versions
        const pgIds = myListings.flatMap(l => [
          String(l.id),
          `sb_${l.id}`
        ])
        const { data: enqData } = await supabase
          .from('enquiries').select('*')
          .in('pg_id', pgIds)
          .order('created_at', { ascending: false })
        setEnquiries(enqData || [])
      }
    } catch (err) {
      showToast('Could not load dashboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  const deleteListing = async (id) => {
    if (!window.confirm('Delete this listing permanently? This cannot be undone.')) return
    await supabase.from('pg_listings').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
    showToast('Listing deleted successfully')
  }

  const startEdit = (listing) => {
    setEditing(listing.id)
    setEditData({
      name:        listing.name,
      area:        listing.area,
      city:        listing.city,
      rent:        listing.rent,
      deposit:     listing.deposit,
      gender:      listing.gender,
      description: listing.description,
    })
  }

  const saveEdit = async () => {
    await supabase.from('pg_listings').update(editData).eq('id', editing)
    setListings(prev => prev.map(l => l.id === editing ? { ...l, ...editData } : l))
    setEditing(null)
    showToast('Listing updated!')
  }

  const markEnquiryRead = async (id) => {
    await supabase.from('enquiries').update({ status:'read' }).eq('id', id)
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status:'read' } : e))
  }

  if (!user || user.role !== 'owner') {
    return (
      <div style={{ maxWidth:500, margin:'80px auto', textAlign:'center', padding:20 }}>
        <p style={{ fontSize:48, marginBottom:14 }}>🔒</p>
        <h2 style={{ fontWeight:800, fontSize:22, color:C.text, marginBottom:8 }}>Owner Access Only</h2>
        <p style={{ color:C.muted, marginBottom:20 }}>This dashboard is only for property owners.</p>
        <button onClick={() => setPage('home')} style={{ ...btnPrimary, padding:'12px 28px' }}>Back to Home</button>
      </div>
    )
  }

  const newEnquiries = enquiries.filter(e => e.status === 'pending').length
  const liveListings = listings.filter(l => l.verified).length
  const pendingListings = listings.filter(l => !l.verified).length

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 20px' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:14, marginBottom:28 }}>
        <div>
          <h1 style={{ fontWeight:800, fontSize:24, color:C.text, margin:'0 0 5px' }}>Owner Dashboard</h1>
          <p style={{ color:C.muted, fontSize:13, margin:0 }}>
            {user.name} · {user.email} ·
            <span style={{ marginLeft:6, background: user.verified?'#F0FDF4':'#FFF7ED', color:user.verified?'#15803D':'#B45309', fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>
              {user.verified ? '✅ ID Verified' : '⏳ Verification Pending'}
            </span>
          </p>
        </div>
        <button onClick={() => setPage('list')} style={{ ...btnPrimary, padding:'11px 22px' }}>+ List New Property</button>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:28 }}>
        <StatCard icon="🏠" label="Total Listings" value={listings.length} />
        <StatCard icon="✅" label="Live on Site" value={liveListings} color="#10B981" sub="Visible to students" />
        <StatCard icon="⏳" label="Pending Review" value={pendingListings} color="#F59E0B" sub="Being verified by team" />
        <StatCard icon="💬" label="Total Enquiries" value={enquiries.length} />
        <StatCard icon="🔔" label="New Enquiries" value={newEnquiries} color={newEnquiries>0?'#FF5A3C':C.text} sub={newEnquiries>0?'Needs attention':''} />
      </div>

      {/* Pending verification notice */}
      {pendingListings > 0 && (
        <div style={{ background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:12, padding:'14px 18px', marginBottom:20, display:'flex', gap:12, alignItems:'flex-start' }}>
          <span style={{ fontSize:20 }}>⏳</span>
          <div>
            <p style={{ fontWeight:700, fontSize:13, color:'#92400E', margin:'0 0 3px' }}>
              {pendingListings} listing{pendingListings>1?'s':''} pending verification
            </p>
            <p style={{ fontSize:12, color:'#B45309', margin:0 }}>
              Our team will verify your property within 24 hours and call you on your registered number. Once verified, it will appear live on the site for students to find.
              You can see all submitted listings below even before they go live.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:22, background:'#F9FAFB', padding:4, borderRadius:12, border:'1px solid #F3F4F6', width:'fit-content' }}>
        {[['listings','🏠 My Listings'], ['enquiries','💬 Enquiries']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding:'9px 22px', borderRadius:9, border:'none', cursor:'pointer',
            fontFamily:'inherit', fontWeight:600, fontSize:13,
            background:tab===k?'#fff':'transparent',
            color:tab===k?C.text:C.muted,
            boxShadow:tab===k?'0 2px 8px rgba(0,0,0,0.08)':'none',
            transition:'all 0.15s',
          }}>
            {l}{k==='enquiries'&&newEnquiries>0&&<span style={{ marginLeft:6, background:'#FF5A3C', color:'#fff', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:20 }}>{newEnquiries}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ width:32, height:32, border:'3px solid #E5E7EB', borderTopColor:C.primary, borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 14px' }} />
          <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
          <p style={{ color:C.muted }}>Loading your data...</p>
        </div>
      ) : (
        <>
          {/* ── MY LISTINGS ── */}
          {tab === 'listings' && (
            <div>
              {listings.length === 0 ? (
                <div style={{ background:'#fff', borderRadius:16, padding:'60px 20px', textAlign:'center', border:'1px solid #E5E7EB' }}>
                  <p style={{ fontSize:40, marginBottom:12 }}>🏠</p>
                  <h3 style={{ fontWeight:700, fontSize:18, color:C.text, marginBottom:8 }}>No listings yet</h3>
                  <p style={{ color:C.muted, fontSize:14, marginBottom:20 }}>List your first PG to start getting student enquiries.</p>
                  <button onClick={() => setPage('list')} style={{ ...btnPrimary, padding:'12px 28px' }}>+ List Your First PG</button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {listings.map(l => (
                    <div key={l.id}>
                      {/* Listing card */}
                      {editing !== l.id ? (
                        <div style={{ background:'#fff', borderRadius:16, padding:'20px', border:'1px solid #E5E7EB' }}>
                          <div style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
                            {/* Thumbnail */}
                            <div style={{ width:90, height:68, borderRadius:10, overflow:'hidden', flexShrink:0, background:'#F3F4F6' }}>
                              {l.images?.[0]
                                ? <img src={l.images[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>🏠</div>}
                            </div>

                            {/* Info */}
                            <div style={{ flex:1, minWidth:200 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
                                <h3 style={{ fontWeight:700, fontSize:15, color:C.text, margin:0 }}>{l.name}</h3>
                                <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:20, background:l.verified?'#F0FDF4':'#FFF7ED', color:l.verified?'#15803D':'#B45309' }}>
                                  {l.verified ? '✅ Live on Site' : '⏳ Pending Verification'}
                                </span>
                              </div>
                              <p style={{ margin:'0 0 4px', fontSize:12, color:C.muted }}>📍 {l.area}, {l.city}</p>
                              <p style={{ margin:'0 0 8px', fontSize:12, color:C.muted }}>₹{l.rent?.toLocaleString()}/mo · {l.gender} · {l.bhk} BHK</p>
                              <p style={{ margin:0, fontSize:11, color:'#9CA3AF' }}>
                                Submitted: {new Date(l.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                              </p>
                            </div>

                            {/* Enquiry count for this listing */}
                            <div style={{ textAlign:'center', minWidth:80, background:'#F9FAFB', borderRadius:10, padding:'10px 14px' }}>
                              <p style={{ fontWeight:800, fontSize:22, color:C.primary, margin:'0 0 2px' }}>
                                {enquiries.filter(e => e.pg_id === String(l.id)).length}
                              </p>
                              <p style={{ fontSize:11, color:C.muted, margin:0, fontWeight:600 }}>Enquiries</p>
                            </div>

                            {/* Actions */}
                            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                              <button onClick={() => startEdit(l)} style={{ ...btnSecondary, padding:'8px 16px', fontSize:13 }}>✏️ Edit</button>
                              <button onClick={() => deleteListing(l.id)} style={{ background:'#FEF2F2', color:'#B91C1C', border:'1px solid #FECACA', padding:'8px 16px', borderRadius:9, cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'inherit' }}>🗑️ Delete</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Edit form */
                        <div style={{ background:'#fff', borderRadius:16, padding:'22px', border:`2px solid ${C.primary}` }}>
                          <h3 style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:16 }}>✏️ Edit Listing</h3>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                            <div>
                              <label style={{ fontSize:11, fontWeight:600, color:C.muted, display:'block', marginBottom:5, textTransform:'uppercase' }}>PG Name</label>
                              <input value={editData.name} onChange={e => setEditData(d => ({...d, name:e.target.value}))} style={inp} />
                            </div>
                            <div>
                              <label style={{ fontSize:11, fontWeight:600, color:C.muted, display:'block', marginBottom:5, textTransform:'uppercase' }}>Area</label>
                              <input value={editData.area} onChange={e => setEditData(d => ({...d, area:e.target.value}))} style={inp} />
                            </div>
                            <div>
                              <label style={{ fontSize:11, fontWeight:600, color:C.muted, display:'block', marginBottom:5, textTransform:'uppercase' }}>Monthly Rent (₹)</label>
                              <input type="number" value={editData.rent} onChange={e => setEditData(d => ({...d, rent:parseInt(e.target.value)}))} style={inp} />
                            </div>
                            <div>
                              <label style={{ fontSize:11, fontWeight:600, color:C.muted, display:'block', marginBottom:5, textTransform:'uppercase' }}>Deposit (₹)</label>
                              <input type="number" value={editData.deposit} onChange={e => setEditData(d => ({...d, deposit:parseInt(e.target.value)}))} style={inp} />
                            </div>
                          </div>
                          <div style={{ marginBottom:12 }}>
                            <label style={{ fontSize:11, fontWeight:600, color:C.muted, display:'block', marginBottom:5, textTransform:'uppercase' }}>Description</label>
                            <textarea value={editData.description} onChange={e => setEditData(d => ({...d, description:e.target.value}))} style={{ ...inp, height:80, resize:'vertical' }} />
                          </div>
                          <div style={{ display:'flex', gap:10 }}>
                            <button onClick={saveEdit} style={{ ...btnPrimary, padding:'10px 24px', background:'#10B981' }}>Save Changes ✓</button>
                            <button onClick={() => setEditing(null)} style={{ ...btnSecondary, padding:'10px 18px' }}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ENQUIRIES ── */}
          {tab === 'enquiries' && (
            <div>
              {enquiries.length === 0 ? (
                <div style={{ background:'#fff', borderRadius:16, padding:'60px 20px', textAlign:'center', border:'1px solid #E5E7EB' }}>
                  <p style={{ fontSize:40, marginBottom:12 }}>💬</p>
                  <h3 style={{ fontWeight:700, fontSize:18, color:C.text, marginBottom:8 }}>No enquiries yet</h3>
                  <p style={{ color:C.muted, fontSize:14 }}>Once your listing goes live, student enquiries will appear here.</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {enquiries.map(e => (
                    <div key={e.id} style={{ background:'#fff', borderRadius:14, padding:'18px 20px', border:`1px solid ${e.status==='new'?'#FECACA':'#E5E7EB'}`, position:'relative' }}>
                      {e.status === 'pending' && (
                        <span style={{ position:'absolute', top:14, right:14, background:'#FF5A3C', color:'#fff', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>NEW</span>
                      )}
                      <div style={{ display:'flex', gap:14, alignItems:'flex-start', flexWrap:'wrap' }}>
                        <div style={{ width:42, height:42, background:C.primary, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:18, flexShrink:0 }}>
                          {(e.student_name||'S')[0].toUpperCase()}
                        </div>
                        <div style={{ flex:1, minWidth:200 }}>
                          <p style={{ fontWeight:700, fontSize:14, color:C.text, margin:'0 0 2px' }}>{e.student_name||'Student'}</p>
                          <p style={{ fontSize:12, color:C.muted, margin:'0 0 6px' }}>
                            📧 {e.student_email} · 🏠 {e.pg_name} · {new Date(e.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}
                          </p>
                          <div style={{ background:'#F9FAFB', borderRadius:8, padding:'10px 14px', marginBottom:8 }}>
                            <p style={{ fontSize:13, color:C.text, margin:0, lineHeight:1.6 }}>{e.message}</p>
                          </div>
                          <div style={{ display:'flex', gap:12, fontSize:12, color:C.muted }}>
                            {e.move_in_date && <span>📅 Move-in: {e.move_in_date}</span>}
                            {e.budget && <span>💰 Budget: ₹{parseInt(e.budget).toLocaleString()}/mo</span>}
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:8, flexDirection:'column', alignSelf:'flex-start' }}>
                          {e.status === 'pending' && (
                            <button onClick={() => markEnquiryRead(e.id)} style={{ ...btnSecondary, padding:'7px 14px', fontSize:12 }}>Mark Read</button>
                          )}
                          <a href={`mailto:${e.student_email}?subject=Re: ${e.pg_name}&body=Hi ${e.student_name},`}
                            style={{ ...btnPrimary, padding:'7px 14px', fontSize:12, textDecoration:'none', textAlign:'center', display:'block' }}>
                            Reply via Email
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}