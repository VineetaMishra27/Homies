import { useState, useRef, useCallback } from 'react'
import { C, btnPrimary, btnSecondary } from '../styles'
import { CITIES, PLANS } from '../data'
import { supabase } from '../supabase'

const AMENS = ['WiFi','AC','Meals','Laundry','Gym','Security','Parking',
               'Power Backup','CCTV','Study Room','Housekeeping','Rooftop',
               'Geyser','RO Water','Fridge','Washing Machine','Lift','Intercom']

// ─── styles ──────────────────────────────────────────────────────────────────
const inp = {
  width:'100%', border:'1.5px solid #E5E7EB', borderRadius:9,
  padding:'11px 14px', fontSize:15, color:'#1A1A2E', background:'#fff',
  outline:'none', boxSizing:'border-box', fontFamily:'inherit',
}
const lbl = {
  display:'block', fontSize:12, fontWeight:600, color:'#6B7280',
  marginBottom:5, textTransform:'uppercase', letterSpacing:'0.04em',
}
const onFocus = e => { e.target.style.borderColor='#FF5A3C'; e.target.style.boxShadow='0 0 0 3px rgba(255,90,60,0.1)' }
const onBlur  = e => { e.target.style.borderColor='#E5E7EB'; e.target.style.boxShadow='none' }

// ─── Field defined OUTSIDE component so it never remounts ────────────────────
function Field({ label, type='text', placeholder, required, name, defaultValue, onChange }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={lbl}>{label}</label>
      <input
        type={type} name={name} placeholder={placeholder} required={required}
        defaultValue={defaultValue || ''}
        onChange={e => onChange(e.target.value)}
        style={inp} onFocus={onFocus} onBlur={onBlur}
      />
    </div>
  )
}

function TextArea({ label, placeholder, onChange, defaultValue }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={lbl}>{label}</label>
      <textarea
        placeholder={placeholder} defaultValue={defaultValue || ''}
        onChange={e => onChange(e.target.value)}
        style={{ ...inp, height:90, resize:'vertical' }}
        onFocus={onFocus} onBlur={onBlur}
      />
    </div>
  )
}

function SelectField({ label, value, onChange, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={lbl}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inp, cursor:'pointer' }} onFocus={onFocus} onBlur={onBlur}>
        {children}
      </select>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ListPropertyPage({ user, showToast, setPage, onListingSubmitted, hasPlan }) {
  const DEMO_EMAILS = ['vineetamishra.2525@gmail.com','vineetamishra.2727@gmail.com','demo@homies.in','test@homies.in']
  const canList = hasPlan || DEMO_EMAILS.includes(user?.email)
  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [photos,  setPhotos]  = useState([])      // { file, preview }
  const [d, setD] = useState({
    name:'', area:'', city:'Mumbai', bhk:'1BHK',
    gender:'Boys', rent:'', deposit:'', desc:'', phone:'',
    amens:[], plan:'monthly',
  })

  const fileInputRef = useRef(null)
  const upd = useCallback((k, v) => setD(prev => ({ ...prev, [k]: v })), [])
  const toggleAmen = useCallback(a => setD(prev => ({
    ...prev, amens: prev.amens.includes(a)
      ? prev.amens.filter(x => x !== a)
      : [...prev.amens, a]
  })), [])

  const calcPrice = (bhk, dur) => {
    const b = PLANS[bhk] || 99
    const m = dur === 'monthly' ? 1 : dur === '3months' ? 3 : 12
    const disc = dur === '3months' ? 0.1 : dur === 'yearly' ? 0.18 : 0
    return Math.round(b * m * (1 - disc))
  }

  // ── Photo handling ──────────────────────────────────────────────────────────
  const handlePhotoSelect = e => {
    const files = Array.from(e.target.files)
    if (photos.length + files.length > 10) {
      showToast('Maximum 10 photos allowed', 'info'); return
    }
    const valid = files.filter(f => {
      if (f.size > 5 * 1024 * 1024) { showToast(`${f.name} is over 5MB — skipped`, 'info'); return false }
      return true
    })
    valid.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setPhotos(prev => [...prev, { file, preview: ev.target.result }])
      reader.readAsDataURL(file)
    })
    // reset input so same file can be re-selected
    e.target.value = ''
  }

  const removePhoto = idx => setPhotos(prev => prev.filter((_, i) => i !== idx))

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!d.name.trim()) { showToast('Please enter a PG name', 'info'); return }
    if (!d.area.trim()) { showToast('Please enter the area/locality', 'info'); return }
    if (!d.rent)        { showToast('Please enter the monthly rent', 'info'); return }

    setLoading(true)
    try {
      // 1. Upload photos to Supabase Storage
      const imageUrls = []
      for (let i = 0; i < photos.length; i++) {
        const { file } = photos[i]
        const ext = file.name.split('.').pop()
        const path = `pg-photos/${user?.id || 'anon'}/${Date.now()}_${i}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('pg-photos')
          .upload(path, file, { upsert: true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('pg-photos').getPublicUrl(path)
          imageUrls.push(urlData.publicUrl)
        }
      }

      // 2. Save listing to pg_listings table
      // parse bhk from string like '1BHK' → 1
      const bhkNum = parseInt(d.bhk.replace('BHK','').replace('-4','').split('-')[0])

      const { data: newListing, error: dbErr } = await supabase.from('pg_listings').insert({
        owner_id:    user?.id || null,
        name:        d.name.trim(),
        area:        d.area.trim(),
        city:        d.city,
        state:       '',
        rent:        parseInt(d.rent),
        deposit:     parseInt(d.deposit) || 0,
        gender:      d.gender,
        bhk:         bhkNum,
        amenities:   d.amens,
        description: d.desc.trim(),
        distance:    '',
        images:      imageUrls,
        verified:    false,
      }).select()
      if (dbErr) throw new Error(dbErr.message)

      showToast('Property submitted! Our team will verify and it will go live within 24 hours.')
      if (onListingSubmitted) onListingSubmitted()   // refresh listings in real time
      setStep(1)
      setPhotos([])
      setD({ name:'', area:'', city:'Mumbai', bhk:'1BHK', gender:'Boys', rent:'', deposit:'', desc:'', phone:'', amens:[], plan:'monthly' })
      setPage('home')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Verification status banner ──────────────────────────────────────────────
  const isVerified = user?.verified

  return (
    <div style={{ maxWidth:660, margin:'0 auto', padding:'40px 20px' }}>
      <h1 style={{ fontWeight:800, fontSize:24, color:C.text, marginBottom:5 }}>List Your Property</h1>
      <p style={{ color:C.muted, fontSize:13, marginBottom:20 }}>Fill in details and we'll list your PG within 24 hours after verification.</p>

      {/* Plan gate — must have paid plan */}
      {!canList && (
        <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:14, padding:'20px 22px', marginBottom:20, display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontSize:32 }}>🔒</span>
          <div style={{ flex:1 }}>
            <p style={{ fontWeight:800, fontSize:15, color:'#B91C1C', margin:'0 0 5px' }}>Active Plan Required</p>
            <p style={{ fontSize:13, color:'#DC2626', margin:'0 0 12px', lineHeight:1.6 }}>
              You need to subscribe to a plan before listing your property. Plans start at just ₹99/month and give you access to thousands of verified students.
            </p>
            <button onClick={() => setPage('pricing')} style={{ background:'#FF5A3C', color:'#fff', border:'none', padding:'10px 22px', borderRadius:9, cursor:'pointer', fontWeight:700, fontSize:14, fontFamily:'inherit' }}>
              View Plans & Subscribe →
            </button>
          </div>
        </div>
      )}

      {/* Owner verification status */}
      <div style={{ background: isVerified ? '#F0FDF4' : '#FFF7ED', border:`1px solid ${isVerified ? '#BBF7D0' : '#FED7AA'}`, borderRadius:12, padding:'12px 16px', marginBottom:22, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:20 }}>{isVerified ? '✅' : '⚠️'}</span>
        <div>
          <p style={{ margin:0, fontWeight:700, fontSize:13, color: isVerified ? '#14532D' : '#92400E' }}>
            {isVerified ? 'Identity Verified — You can list properties' : 'Identity Pending Verification'}
          </p>
          <p style={{ margin:'2px 0 0', fontSize:12, color: isVerified ? '#166534' : '#B45309' }}>
            {isVerified
              ? `Verified as ${user?.name} · Your listings will be marked as owner-verified`
              : 'Your Aadhaar/PAN was submitted during signup. Our team will verify within 24 hours before your listing goes live.'}
          </p>
        </div>
      </div>

      {/* Progress steps */}
      <div style={{ display:'flex', gap:6, marginBottom:26 }}>
        {['Property Details','Amenities & Pricing','Photos & Plan'].map((s, i) => (
          <div key={s} style={{ flex:1, textAlign:'center' }}>
            <div style={{ height:4, borderRadius:2, marginBottom:6,
              background: step >= i+1 ? C.primary : '#E5E7EB',
              opacity: step === i+1 ? 1 : step > i+1 ? 0.7 : 0.25 }} />
            <p style={{ fontSize:10, fontWeight:600, margin:0, color: step === i+1 ? C.primary : C.muted }}>{s}</p>
          </div>
        ))}
      </div>

      <div style={{ background:'#fff', borderRadius:18, padding:28, border:'1px solid #E5E7EB' }}>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <>
            <h2 style={{ fontWeight:700, fontSize:16, color:C.text, marginBottom:18 }}>Basic Property Details</h2>

            <Field label="PG Name" name="pgname" placeholder="e.g. Sunrise Boys PG Andheri"
              defaultValue={d.name} onChange={v => upd('name', v)} required />

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <SelectField label="City" value={d.city} onChange={v => upd('city', v)}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </SelectField>
              <Field label="Area / Locality" name="area" placeholder="e.g. Andheri West"
                defaultValue={d.area} onChange={v => upd('area', v)} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <SelectField label="Property Type" value={d.bhk} onChange={v => upd('bhk', v)}>
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="3-4BHK">3-4 BHK</option>
              </SelectField>
              <SelectField label="PG For" value={d.gender} onChange={v => upd('gender', v)}>
                <option>Boys</option>
                <option>Girls</option>
                <option>Co-ed</option>
              </SelectField>
            </div>

            <Field label="Owner Contact Number" name="phone" type="tel"
              placeholder="10-digit mobile number" defaultValue={d.phone}
              onChange={v => upd('phone', v)} required />

            <TextArea label="Description" placeholder="Nearby colleges, landmarks, special features..."
              defaultValue={d.desc} onChange={v => upd('desc', v)} />
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <>
            <h2 style={{ fontWeight:700, fontSize:16, color:C.text, marginBottom:18 }}>Amenities & Pricing</h2>

            <div style={{ marginBottom:20 }}>
              <label style={{ ...lbl, marginBottom:10 }}>Select Amenities</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                {AMENS.map(a => (
                  <button type="button" key={a} onClick={() => toggleAmen(a)} style={{
                    padding:'7px 14px', borderRadius:20, cursor:'pointer', fontFamily:'inherit',
                    border:`1.5px solid ${d.amens.includes(a) ? C.primary : '#E5E7EB'}`,
                    background: d.amens.includes(a) ? '#FFF1EE' : '#fff',
                    color: d.amens.includes(a) ? C.primary : '#6B7280',
                    fontWeight:600, fontSize:12, transition:'all 0.15s',
                  }}>
                    {d.amens.includes(a) ? '✓ ' : ''}{a}
                  </button>
                ))}
              </div>
              {d.amens.length > 0 && (
                <p style={{ fontSize:12, color:C.primary, fontWeight:600, marginTop:10 }}>
                  {d.amens.length} amenities selected
                </p>
              )}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Monthly Rent (₹)" name="rent" type="number"
                placeholder="e.g. 12000" defaultValue={d.rent}
                onChange={v => upd('rent', v)} required />
              <Field label="Security Deposit (₹)" name="deposit" type="number"
                placeholder="e.g. 24000" defaultValue={d.deposit}
                onChange={v => upd('deposit', v)} />
            </div>
          </>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <>
            <h2 style={{ fontWeight:700, fontSize:16, color:C.text, marginBottom:18 }}>Photos & Subscription</h2>

            {/* Photo upload */}
            <div style={{ marginBottom:22 }}>
              <label style={{ ...lbl, marginBottom:10 }}>Property Photos ({photos.length}/10)</label>

              {/* Hidden real file input */}
              <input
                ref={fileInputRef} type="file" multiple
                accept="image/jpeg,image/png,image/jpg,image/webp"
                style={{ display:'none' }}
                onChange={handlePhotoSelect}
              />

              {/* Upload area */}
              <div
                onClick={() => fileInputRef.current.click()}
                style={{
                  border:'2px dashed #E5E7EB', borderRadius:12, padding:22,
                  textAlign:'center', cursor:'pointer', marginBottom:12,
                  background: photos.length > 0 ? '#F0FDF4' : '#FAFAFA',
                  transition:'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#FF5A3C'}
                onMouseLeave={e => e.currentTarget.style.borderColor='#E5E7EB'}
              >
                <p style={{ fontSize:32, margin:'0 0 6px' }}>📷</p>
                <p style={{ fontWeight:600, margin:'0 0 4px', fontSize:14, color:C.text }}>
                  {photos.length === 0 ? 'Click to upload property photos' : 'Click to add more photos'}
                </p>
                <p style={{ color:C.muted, fontSize:12, margin:0 }}>JPG, PNG, WebP · Max 10 photos · 5MB each</p>
              </div>

              {/* Photo previews grid */}
              {photos.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                  {photos.map((p, i) => (
                    <div key={i} style={{ position:'relative', borderRadius:10, overflow:'hidden', aspectRatio:'4/3', background:'#F3F4F6' }}>
                      <img src={p.preview} alt={`Photo ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        style={{
                          position:'absolute', top:4, right:4,
                          background:'rgba(0,0,0,0.6)', color:'#fff',
                          border:'none', borderRadius:'50%', width:22, height:22,
                          cursor:'pointer', fontSize:12, display:'flex',
                          alignItems:'center', justifyContent:'center',
                          fontFamily:'inherit',
                        }}
                      >✕</button>
                      {i === 0 && (
                        <span style={{ position:'absolute', bottom:4, left:4, background:'#FF5A3C', color:'#fff', fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:8 }}>
                          COVER
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subscription plan */}
            <div style={{ marginBottom:18 }}>
              <label style={{ ...lbl, marginBottom:10 }}>Subscription Plan</label>
              {[['monthly','Monthly',0],['3months','3 Months',10],['yearly','Yearly',18]].map(([k,l,disc]) => (
                <label key={k} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                  borderRadius:10, cursor:'pointer', marginBottom:8,
                  border:`1.5px solid ${d.plan===k ? C.primary : '#E5E7EB'}`,
                  background: d.plan===k ? '#FFF1EE' : '#fff',
                }}>
                  <input type="radio" name="plan" value={k} checked={d.plan===k} onChange={() => upd('plan', k)} />
                  <span style={{ flex:1, fontWeight:600, fontSize:13, color:C.text }}>
                    {l}{disc > 0 && <span style={{ marginLeft:6, background:'#10B981', color:'#fff', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:10 }}>Save {disc}%</span>}
                  </span>
                  <span style={{ fontWeight:700, color:C.primary, fontSize:15 }}>₹{calcPrice(d.bhk, k).toLocaleString()}</span>
                </label>
              ))}
            </div>

            {/* Verification info */}
            <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:10, padding:14 }}>
              <p style={{ margin:0, fontSize:13, color:'#14532D', fontWeight:700 }}>✅ What happens after you submit?</p>
              <ul style={{ margin:'6px 0 0', padding:'0 0 0 16px', fontSize:12, color:'#166534', lineHeight:2 }}>
                <li>Your listing is saved to our database instantly</li>
                <li>It will be marked as <strong>unverified</strong> until our team reviews it</li>
                <li>Our team will call you on <strong>{d.phone || 'the number you provided'}</strong> to verify the property</li>
                <li>Once verified, it goes live and appears in search results for students</li>
                <li>You can see your submitted listing at <strong>Supabase → Table Editor → pg_listings</strong></li>
              </ul>
            </div>
          </>
        )}

        {/* Navigation buttons */}
        <div style={{ display:'flex', gap:10, marginTop:22 }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s-1)} style={{ ...btnSecondary, flex:1 }}>← Back</button>
          )}
          {step < 3 ? (
            <button onClick={() => {
              if (step === 1 && !d.name.trim()) { showToast('Please enter PG name', 'info'); return }
              if (step === 1 && !d.area.trim()) { showToast('Please enter area/locality', 'info'); return }
              setStep(s => s+1)
            }} style={{ ...btnPrimary, flex:1, padding:13 }}>
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !canList}
              style={{ ...btnPrimary, flex:1, padding:13, background:'#10B981', opacity: loading ? 0.8 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Submitting...' : 'Submit for Verification 🎉'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}