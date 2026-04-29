import { C } from '../styles'
import { supabase } from '../supabase'

export default function Navbar({ user, setUser, setPage, setAuthModal, showToast, wishlist = [], setWishlist }) {
  const navBtn = {
    background: 'none', border: 'none', padding: '8px 14px',
    borderRadius: 8, cursor: 'pointer', fontWeight: 600,
    fontSize: 14, color: '#6B7280', fontFamily: 'inherit',
    transition: 'background 0.15s, color 0.15s',
  }

  // Emails that bypass plan check (your account + demo accounts)
  const DEMO_EMAILS = [
    'vineetamishra.2525@gmail.com',
    'vineetamishra.2727@gmail.com',
    'demo@homies.in',
    'test@homies.in',
  ]

  const handleListProperty = async () => {
    if (!user) {
      setAuthModal('signup')
      showToast('Sign up as an Owner to list your property', 'info')
      return
    }
    if (user.role !== 'owner') {
      showToast('Only property owners can list PGs. Please sign up as an Owner.', 'info')
      return
    }

    // Demo / admin accounts bypass plan check
    if (DEMO_EMAILS.includes(user.email)) {
      setPage('list')
      return
    }

    // Check if owner has an active paid plan
    try {
      const { data: payment } = await supabase
        .from('payments')
        .select('id, plan_name, status')
        .eq('owner_id', user.id)
        .eq('status', 'paid')
        .limit(1)
        .single()

      if (payment) {
        setPage('list')
      } else {
        showToast('You need an active plan to list properties. Plans start at ₹99/month.', 'info')
        setPage('pricing')
      }
    } catch {
      showToast('Please subscribe to a plan first to list your property. Starting at ₹99/month.', 'info')
      setPage('pricing')
    }
  }

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

        {/* Logo */}
        <div onClick={() => setPage('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/homies-logo.svg" alt="Homies" style={{ width: 44, height: 44, objectFit: 'contain', imageRendering: 'crisp-edges' }} />
          <span style={{ fontWeight: 800, fontSize: 22, color: '#1A1A2E', letterSpacing: '-0.5px' }}>
            Homies<span style={{ color: C.primary }}>.</span>
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 2 }}>
          {[
            ['Find PG',       () => {
              if (user?.role === 'owner') {
                showToast('Owners cannot browse student PG listings. Use your Dashboard to manage your properties.', 'info')
                return
              }
              setPage('listings'); window.scrollTo(0,0)
            }],
            ['List Property', handleListProperty],
            ['Cities',        () => { setPage('cities');   window.scrollTo(0,0) }],
            ['Plans',         () => { setPage('pricing');  window.scrollTo(0,0) }],
            ['About',         () => { setPage('about');    window.scrollTo(0,0) }],
          ].map(([label, action]) => (
            <button
              key={label}
              style={navBtn}
              onClick={action}
              onMouseEnter={e => { e.target.style.background = '#F9FAFB'; e.target.style.color = '#1A1A2E' }}
              onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = '#6B7280' }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {user ? (
            <>
              {/* Clicking name/avatar → dashboard for owners, nothing for students */}
              <div
                onClick={() => { if (user.role === 'owner') setPage('dashboard'); else setPage('student') }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 8px', borderRadius: 10, transition: 'background 0.15s' }}
                onMouseEnter={e => { if (user.role === 'owner') e.currentTarget.style.background = '#F9FAFB' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                title={user.role === 'owner' ? 'Go to Dashboard' : 'My Account'}
              >
                <div style={{ width: 36, height: 36, background: user.role === 'owner' ? '#7C3AED' : C.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 15 }}>
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1A1A2E', lineHeight: 1.2 }}>
                    {user.name}
                    <span style={{ marginLeft: 5, fontSize: 10, color: user.role === 'owner' ? '#7C3AED' : C.primary }}>▼</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'capitalize' }}>
                    {user.role === 'owner' ? 'Owner · Dashboard →' : 'Student · My Account →'}
                  </div>
                </div>
              </div>
<button
                style={{ background: '#F3F4F6', border: 'none', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: 'inherit' }}
                onClick={async () => { await supabase.auth.signOut(); setUser(null); showToast('Logged out successfully') }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                style={{ background: 'none', border: '1.5px solid #E5E7EB', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#374151', fontFamily: 'inherit' }}
                onClick={() => setAuthModal('login')}
              >
                Login
              </button>
              <button
                style={{ background: C.primary, color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}
                onClick={() => setAuthModal('signup')}
              >
                Sign Up Free
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}