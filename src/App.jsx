import { useState, useEffect, useCallback } from 'react'
import { PGS, PLANS, CITIES, CITY_DATA } from './data'
import { supabase } from './supabase'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ListingsPage from './pages/ListingsPage'
import PricingPage from './pages/PricingPage'
import ListPropertyPage from './pages/ListPropertyPage'
import CitiesPage from './pages/CitiesPage'
import PGModal from './components/PGModal'
import AuthModal from './components/AuthModal'
import Toast from './components/Toast'
import { AboutPage, ContactPage, CareersPage, BlogPage, PrivacyPage, TermsPage } from './pages/StaticPages'
import OwnerDashboard from './pages/OwnerDashboard'
import WishlistPage from './pages/WishlistPage'
import StudentDashboard from './pages/StudentDashboard'

// ─── Convert a Supabase pg_listings row → same shape as data.js PG object ────
function supabasePGtoPG(row) {
  return {
    id:         `sb_${row.id}`,          // prefix to avoid id clash with data.js
    name:       row.name       || 'Unnamed PG',
    area:       row.area       || '',
    city:       row.city       || '',
    state:      row.state      || '',
    rent:       row.rent       || 0,
    deposit:    row.deposit    || 0,
    gender:     row.gender     || 'Co-ed',
    bhk:        row.bhk        || 1,
    amenities:  row.amenities  || [],
    images:     row.images?.length
                  ? row.images
                  : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'],
    rating:     0,               // not rated yet
    reviews:    0,
    distance:   row.distance   || '',
    owner:      'Verified Owner',
    phone:      '',
    verified:   row.verified   || false,
    colleges:   [],
    desc:       row.description || '',
    badge:      row.verified ? 'Verified' : 'New Listing',
    highlights: ['Owner Listed', row.verified ? 'Verified' : 'Pending Verification'],
    roomTypes:  ['Twin Sharing', 'Private Room'],
    isOwnerListed: true,
  }
}

export default function App() {
  const [page,        setPage]        = useState('home')
  const [user,        setUser]        = useState(null)
  const [wishlist,    setWishlist]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('homies_wishlist') || '[]') } catch { return [] }
  })
  const [authLoading, setAuthLoading] = useState(true)  // true while restoring session
  const [selectedPG,  setSelectedPG]  = useState(null)
  const [authModal,   setAuthModal]   = useState(null)
  const [toast,       setToast]       = useState(null)
  const [filters,     setFilters]     = useState({ search: '', city: '', gender: '', bhk: '', maxRent: 35000 })
  const [planDur,     setPlanDur]     = useState('monthly')
  const [livePGs,     setLivePGs]     = useState([])   // from Supabase
  const [hasPlan,     setHasPlan]     = useState(false)
  const [loadingPGs,  setLoadingPGs]  = useState(true)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Session restore — runs on load
  useEffect(() => {
    const timer = setTimeout(() => setAuthLoading(false), 100)
    try {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) await loadUserProfile(session.user.id)
        setAuthLoading(false)
        clearTimeout(timer)
      }).catch(() => setAuthLoading(false))
    } catch {
      setAuthLoading(false)
    }
    return () => clearTimeout(timer)
  }, [])

  const checkOwnerPlan = async (userId) => {
    try {
      const { data } = await supabase
        .from('payments')
        .select('id')
        .eq('owner_id', userId)
        .eq('status', 'paid')
        .limit(1)
        .single()
      setHasPlan(!!data)
    } catch {
      setHasPlan(false)
    }
  }

  const loadUserProfile = async (userId) => {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        setUser({
          id:       profile.id,
          name:     profile.name,
          email:    profile.email,
          role:     profile.role,
          city:     profile.city,
          verified: profile.verified,
        })
        if (profile.role === 'owner') checkOwnerPlan(userId)
      }
    } catch (err) {
      console.warn('Could not load user profile:', err.message)
    }
  }

  // ── Fetch verified listings from Supabase ─────────────────────────────────
  const fetchLivePGs = useCallback(async () => {
    setLoadingPGs(true)
    try {
      const { data, error } = await supabase
        .from('pg_listings')
        .select('*')
        .eq('verified', true)          // only show verified owner listings
        .order('created_at', { ascending: false })

      if (error) throw error
      setLivePGs((data || []).map(supabasePGtoPG))
    } catch (err) {
      console.warn('Could not fetch live PGs:', err.message)
      setLivePGs([])
    } finally {
      setLoadingPGs(false)
    }
  }, [])

  useEffect(() => {
    fetchLivePGs()
  }, [fetchLivePGs])

  // Also fetch unverified listings for the owner who is logged in
  const [myListings, setMyListings] = useState([])
  useEffect(() => {
    if (!user?.id) { setMyListings([]); return }
    supabase
      .from('pg_listings')
      .select('*')
      .eq('owner_id', user.id)
      .then(({ data }) => setMyListings((data || []).map(supabasePGtoPG)))
  }, [user])

  // ── Merge: data.js static PGs + live Supabase verified PGs ───────────────
  const allPGs = [...PGS, ...livePGs]

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredPGs = allPGs.filter(pg => {
    if (filters.city && pg.city !== filters.city) return false
    if (filters.gender && pg.gender !== filters.gender && pg.gender !== 'Co-ed') return false
    if (filters.bhk && pg.bhk !== parseInt(filters.bhk)) return false
    if (pg.rent > filters.maxRent) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!pg.area.toLowerCase().includes(q) &&
          !pg.name.toLowerCase().includes(q) &&
          !pg.city.toLowerCase().includes(q)) return false
    }
    return true
  })

  const goListings = (search = '', city = '') => {
    setFilters(f => ({ ...f, search, city }))
    setPage('listings')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <Navbar
        user={user}
        setUser={setUser}
        setPage={setPage}
        setAuthModal={setAuthModal}
        showToast={showToast}
        wishlist={wishlist}
        setWishlist={setWishlist}
      />

      {selectedPG && (
        <PGModal
          pg={selectedPG}
          user={user}
          wishlist={wishlist}
          setWishlist={setWishlist}
          onClose={() => setSelectedPG(null)}
          onLoginRequired={() => {
            setSelectedPG(null)
            setAuthModal('login')
            showToast('Please login to view contact details', 'info')
          }}
          showToast={showToast}
        />
      )}

      {authModal && (
        <AuthModal
          type={authModal}
          setType={setAuthModal}
          onSuccess={u => {
            if (u) { setUser(u); }
            setAuthModal(null)
          }}
          onClose={() => setAuthModal(null)}
          showToast={showToast}
        />
      )}

      {page === 'home' && (
        <HomePage
          pgs={allPGs}
          setPage={setPage}
          setAuthModal={setAuthModal}
          setSelectedPG={setSelectedPG}
          goListings={goListings}
          user={user}
        />
      )}

      {page === 'listings' && (
        <ListingsPage
          pgs={filteredPGs}
          filters={filters}
          setFilters={setFilters}
          setSelectedPG={setSelectedPG}
          totalCount={allPGs.length}
          loading={loadingPGs}
          liveCount={livePGs.length}
          user={user}
          setPage={setPage}
        />
      )}

      {page === 'pricing' && (
        <PricingPage
          planDur={planDur}
          setPlanDur={setPlanDur}
          user={user}
          setAuthModal={setAuthModal}
          showToast={showToast}
          setPage={setPage}
          setHasPlan={setHasPlan}
        />
      )}

      {page === 'list' && (
        <ListPropertyPage
          user={user}
          showToast={showToast}
          setPage={setPage}
          onListingSubmitted={fetchLivePGs}
          hasPlan={hasPlan}
        />
      )}

      {page === 'cities'   && <CitiesPage goListings={goListings} />}
      {page === 'dashboard' && <OwnerDashboard user={user} setPage={setPage} showToast={showToast} />}
      {page === 'wishlist'   && <WishlistPage wishlist={wishlist} setWishlist={setWishlist} setSelectedPG={setSelectedPG} setPage={setPage} />}
      {page === 'student'    && <StudentDashboard user={user} setPage={setPage} showToast={showToast} wishlist={wishlist} setWishlist={setWishlist} setSelectedPG={setSelectedPG} />}
      {page === 'about'    && <AboutPage />}
      {page === 'contact'  && <ContactPage showToast={showToast} />}
      {page === 'careers'  && <CareersPage />}
      {page === 'blog'     && <BlogPage />}
      {page === 'privacy'  && <PrivacyPage />}
      {page === 'terms'    && <TermsPage />}

      <Footer setPage={setPage} />
    </div>
  )
}

function Footer({ setPage }) {
  const s = (page) => ({
    margin: '0 0 10px', fontSize: 13,
    color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'block',
    transition: 'color 0.15s',
  })
  const link = (label, page) => (
    <p key={label} style={s(page)}
      onClick={() => { setPage(page); window.scrollTo(0,0) }}
      onMouseEnter={e => e.target.style.color='#FF5A3C'}
      onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.6)'}
    >{label}</p>
  )
  return (
    <footer style={{ background: '#1A1A2E', color: '#fff', padding: '52px 20px 28px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 36 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, cursor:'pointer' }} onClick={() => setPage('home')}>
              <img src="/homies-logo.svg" alt="Homies" style={{ width: 44, height: 44, objectFit: 'contain', imageRendering: 'crisp-edges' }} />
              <span style={{ fontWeight: 800, fontSize: 19 }}>Homies<span style={{ color: '#FF5A3C' }}>.</span></span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.85, margin: '0 0 16px' }}>
              India's most trusted platform for students to find verified PGs near their colleges.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>📧 homiessupport@gmail.com</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '4px 0 0' }}>📞 +91 83696 10730</p>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: 12, marginBottom: 14, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Discover</h4>
            {link('Find PG', 'listings')}
            {link('Popular Cities', 'cities')}
            {link('Blog & Tips', 'blog')}
            {link('About Us', 'about')}
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: 12, marginBottom: 14, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Owners</h4>
            {link('List Property', 'list')}
            {link('View Plans', 'pricing')}
            {link('Contact Us', 'contact')}
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: 12, marginBottom: 14, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Company</h4>
            {link('About Us', 'about')}
            {link('Careers', 'careers')}
            {link('Privacy Policy', 'privacy')}
            {link('Terms of Service', 'terms')}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>© 2026 Homies. All rights reserved.</p>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Made with ❤️ for students across India</p>
        </div>
      </div>
    </footer>
  )
}