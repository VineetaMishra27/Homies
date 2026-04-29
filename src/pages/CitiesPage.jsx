import { useState } from 'react'
import { C } from '../styles'
import { CITY_DATA } from '../data'

export default function CitiesPage({ goListings }) {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <p style={{ color: C.primary, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 6px' }}>All Locations</p>
        <h1 style={{ fontWeight: 800, fontSize: 28, color: C.text, margin: '0 0 8px' }}>Find PGs across India</h1>
        <p style={{ color: C.muted, fontSize: 14 }}>12 cities live now with 340+ verified listings · 120+ cities coming soon</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 16 }}>
        {CITY_DATA.map(ct => <CityCard key={ct.c} ct={ct} onClick={() => goListings('', ct.c)} />)}
      </div>
    </div>
  )
}

function CityCard({ ct, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ borderRadius: 14, overflow: 'hidden', cursor: 'pointer', position: 'relative', height: 165, border: `1px solid ${C.border}`, transition: 'all .25s', transform: hov ? 'translateY(-4px)' : 'none', boxShadow: hov ? '0 10px 28px rgba(0,0,0,.15)' : 'none' }}>
      <img src={ct.img} alt={ct.c} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.72) 0%,rgba(0,0,0,.1) 60%)' }} />
      <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
        <h3 style={{ fontWeight: 800, fontSize: 18, color: '#fff', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 6 }}>
          {ct.c}
          {ct.live && <span style={{ fontSize: 10, background: '#FF5A3C', padding: '2px 7px', borderRadius: 9, fontWeight: 700, color: '#fff' }}>LIVE</span>}
        </h3>
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, margin: 0 }}>{ct.pg.toLocaleString()} PGs · {ct.s}</p>
      </div>
    </div>
  )
}