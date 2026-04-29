import { useState } from 'react'
import PGCard from '../components/PGCard'
import { C, btnPrimary, btnSecondary } from '../styles'

const AREAS = ["Andheri","Koramangala","Hinjewadi","HITEC City","Porur","Sector 62","Powai","Whitefield","Gachibowli","Velachery"]

const FEATURES = [
  { icon: "🔍", title: "Smart Search", desc: "Filter by city, area, budget, gender and amenities in seconds." },
  { icon: "✅", title: "100% Verified", desc: "Every listing physically verified by our team. No fake listings ever." },
  { icon: "🏠", title: "Real Listings", desc: "340+ real PGs across 12 cities — Mumbai, Bangalore, Hyderabad, Chennai, Noida & more." },
  { icon: "💬", title: "Direct Connect", desc: "Chat directly with verified owners. Zero brokerage for students." },
  { icon: "🔒", title: "Safe & Secure", desc: "All owners are KYC verified. Your safety is our top priority." },
  { icon: "💰", title: "Best Price", desc: "Compare across 8 cities. Starting from just Rs. 3,397/month in Pune." },
]

export default function HomePage({ pgs, setPage, setAuthModal, setSelectedPG, goListings, user }) {
  const [heroSearch, setHeroSearch] = useState('')

  return (
    <div>
      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg,#1A1A2E 0%,#16213E 50%,#0F3460 100%)', padding: '88px 20px 68px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle at 2px 2px,white 1px,transparent 0)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,90,60,.15)', border: '1px solid rgba(255,90,60,.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, background: C.primary, borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ color: 'rgba(255,255,255,.9)', fontSize: 13, fontWeight: 600 }}>340+ Verified PGs Live — 12 Cities Across India 🏙️</span>
          </div>

          <h1 style={{ fontWeight: 800, fontSize: 48, color: '#fff', lineHeight: 1.15, margin: '0 0 18px', letterSpacing: '-1px' }}>
            Find Your Perfect PG<br />
            <span style={{ color: C.primary }}>Near Your College</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,.62)', fontSize: 17, margin: '0 0 34px', lineHeight: 1.75 }}>
            Verified, affordable PGs across Mumbai, Navi Mumbai, Pune, Delhi, Bangalore, Hyderabad, Chennai & Noida. No brokerage.
          </p>

          <div style={{ background: '#fff', borderRadius: 16, padding: 8, display: 'flex', gap: 8, maxWidth: 560, margin: '0 auto 30px', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
            <input
              value={heroSearch}
              onChange={e => setHeroSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && goListings(heroSearch)}
              placeholder="🔍 Search Andheri, Powai, Chembur..."
              style={{ flex: 1, border: 'none', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: C.text, outline: 'none', fontFamily: 'inherit' }}
            />
            <button onClick={() => goListings(heroSearch)} style={{ ...btnPrimary, padding: '12px 22px', fontSize: 14 }}>Search →</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 9 }}>
            {AREAS.map(a => (
              <span key={a} onClick={() => goListings(a)}
                style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.85)', padding: '5px 13px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontWeight: 500, border: '1px solid rgba(255,255,255,.15)' }}>
                📍 {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, textAlign: 'center' }}>
          {[{ n: '340+', l: 'Verified PGs Listed' }, { n: '2M+', l: 'Happy Students' }, { n: '120+', l: 'Cities Covered' }, { n: '12', l: 'Cities Live Now' }].map(s => (
            <div key={s.l}>
              <p style={{ fontWeight: 800, fontSize: 28, color: C.primary, margin: '0 0 4px' }}>{s.n}</p>
              <p style={{ fontSize: 13, color: C.muted, margin: 0, fontWeight: 500 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED PGS */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 26 }}>
          <div>
            <p style={{ color: C.primary, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 6px' }}>Mumbai · Pune · Delhi · Bangalore · Hyderabad · Chennai · Noida & more</p>
            <h2 style={{ fontWeight: 800, fontSize: 24, color: C.text, margin: 0 }}>Verified PGs across 12 cities</h2>
          </div>
          <button onClick={() => setPage('listings')} style={{ ...btnSecondary, fontSize: 13 }}>View All PGs →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 20 }}>
          {pgs.slice(0, 6).map(pg => (
            <PGCard key={pg.id} pg={pg} onClick={() => setSelectedPG(pg)} />
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ background: C.bg, padding: '52px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ color: C.primary, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 6px' }}>Why Homies</p>
            <h2 style={{ fontWeight: 800, fontSize: 24, color: C.text, margin: 0 }}>The smarter way to find PGs across India</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: '#fff', borderRadius: 14, padding: 24, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: C.text, margin: '0 0 7px' }}>{f.title}</h3>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OWNER CTA — hidden for students */}
      {(!user || user.role === 'owner') && (
      <div style={{ background: 'linear-gradient(135deg,#FF5A3C,#FF8C42)', padding: '52px 20px', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 800, fontSize: 26, color: '#fff', margin: '0 0 12px' }}>Are you a PG Owner?</h2>
        <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 15, margin: '0 0 26px' }}>List your PG in Mumbai, Bangalore, Hyderabad, Chennai, Noida or any of our 8 cities and reach thousands of students. Starting at just ₹99/month.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={() => setPage('pricing')} style={{ background: '#fff', color: C.primary, border: 'none', padding: '12px 28px', borderRadius: 11, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>View Owner Plans →</button>
        </div>
      </div>
      )}
    </div>
  )
}