import { C, btnPrimary } from '../styles'
import { supabase } from '../supabase'
import { PLANS } from '../data'

const PLAN_DETAILS = [
  {
    bhk: '1BHK', name: 'Starter', color: '#3B82F6',
    desc: 'Perfect for single-room or 1 BHK PGs',
    features: ['List up to 1 property', 'Basic analytics dashboard', 'Email support', 'Verified owner badge', 'Standard search listing', 'Photo gallery (5 pics)'],
  },
  {
    bhk: '2BHK', name: 'Growth', color: '#FF5A3C',
    desc: 'Best for 2 BHK properties & growing owners',
    features: ['List up to 3 properties', 'Advanced analytics', 'Priority phone support', 'Verified owner badge', 'Featured listing placement', 'Photo gallery (10 pics)', 'Tenant enquiry alerts'],
    pop: true,
  },
  {
    bhk: '3-4BHK', name: 'Premium', color: '#7C3AED',
    desc: 'For large 3–4 BHK properties & landlords',
    features: ['Unlimited property listings', 'Full analytics dashboard', 'Dedicated account manager', 'Premium verified badge', 'Top of search results', '30-photo gallery', 'Virtual tour support', 'Priority lead routing'],
  },
]

export default function PricingPage({ planDur, setPlanDur, user, setAuthModal, showToast, setPage, setHasPlan }) {
  const calcPrice = (bhk, dur) => {
    const b = PLANS[bhk]
    const m = dur === 'monthly' ? 1 : dur === '3months' ? 3 : 12
    const d = dur === '3months' ? 0.1 : dur === 'yearly' ? 0.18 : 0
    return Math.round(b * m * (1 - d))
  }

  const handleContactSales = async () => {
    try {
      await supabase.from('support_requests').insert({
        type:       'enterprise_sales',
        name:       user?.name  || 'Unknown',
        email:      user?.email || 'Not logged in',
        role:       user?.role  || 'visitor',
        message:    'Interested in enterprise plan (10+ properties)',
        status:     'new',
        created_at: new Date().toISOString(),
      })
      showToast('Request received! Our sales team will contact you within 24 hours.', 'info')
    } catch {
      showToast('Request received! Our sales team will contact you within 24 hours.', 'info')
    }
  }

  const handleGetStarted = async (planName, amount) => {
    if (!user) {
      setAuthModal('signup')
      showToast('Create an Owner account to subscribe', 'info')
      return
    }
    if (user.role === 'student') {
      showToast('Only Property Owners can subscribe. Please sign up as an Owner.', 'info')
      return
    }

    // ── Razorpay Payment ──────────────────────────────────────────────────
    // STEP 1: Add your Razorpay Key ID below (from razorpay.com → Settings → API Keys)
    const RAZORPAY_KEY_ID = 'PASTE_YOUR_KEY_HERE'   // ← your key goes here


    const options = {
      key:          RAZORPAY_KEY_ID,
      amount:       amount * 100,          // Razorpay takes paise (₹99 → 9900)
      currency:     'INR',
      name:         'Homies',
      description:  `${planName} Plan — Owner Subscription`,
      image:        '/homies-logo.png',
      prefill: {
        name:  user.name,
        email: user.email,
      },
      theme: { color: '#FF5A3C' },
      handler: async (response) => {
        // Payment successful — save to Supabase
        try {
          await supabase.from('payments').insert({
            owner_id:        user.id,
            owner_email:     user.email,
            plan_name:       planName,
            amount:          amount,
            duration:        planDur,
            razorpay_payment_id: response.razorpay_payment_id,
            status:          'paid',
            created_at:      new Date().toISOString(),
          })
          showToast(`Payment successful! ${planName} plan activated. 🎉`)
          if (setHasPlan) setHasPlan(true)
          setTimeout(() => setPage && setPage('list'), 1500)
        } catch {
          showToast(`Payment received (ID: ${response.razorpay_payment_id}). Our team will activate your plan shortly.`)
        }
      },
    }

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options)
      rzp.open()
    } else {
      // Load Razorpay script dynamically
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => { new window.Razorpay(options).open() }
      script.onerror = () => showToast('Could not load payment gateway. Please try again.', 'error')
      document.body.appendChild(script)
    }
  }

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: '52px 20px' }}>

      {/* Header */}
      {user && user.role === 'student' && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>ℹ️</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1E40AF' }}>You're logged in as a Student</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#3B82F6' }}>These plans are for property owners only. As a student, you can browse and contact PG owners completely free.</p>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFF1EE', border: '1px solid #FECACA', borderRadius: 20, padding: '5px 16px', marginBottom: 16 }}>
          <span style={{ fontSize: 16 }}>🏠</span>
          <span style={{ color: C.primary, fontSize: 13, fontWeight: 700 }}>For Property Owners Only</span>
        </div>
        <h1 style={{ fontWeight: 800, fontSize: 30, color: C.text, margin: '0 0 10px' }}>List your PG. Reach thousands of students.</h1>
        <p style={{ color: C.muted, fontSize: 15, margin: '0 0 6px' }}>Simple, transparent pricing — no hidden fees, no commission per booking.</p>
        <p style={{ color: '#9CA3AF', fontSize: 13 }}>Are you a student? <span style={{ color: C.primary, fontWeight: 600, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>Browse PGs for free →</span></p>
      </div>

      {/* Value props */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { icon: '👥', title: 'Reach 2M+ Students', desc: 'Active students across Mumbai, Pune, Delhi & Navi Mumbai browsing daily.' },
          { icon: '✅', title: 'Verified Listing Badge', desc: 'All subscribed listings get a Homies Verified badge — builds trust instantly.' },
          { icon: '📊', title: 'Analytics Dashboard', desc: 'See who viewed your listing, how many enquiries, and conversion rates.' },
        ].map(v => (
          <div key={v.title} style={{ background: '#F9FAFB', borderRadius: 14, padding: '18px 20px', border: '1px solid #F3F4F6' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{v.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 5 }}>{v.title}</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{v.desc}</div>
          </div>
        ))}
      </div>

      {/* Duration Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
        <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 4, display: 'flex', gap: 4, border: '1px solid #E5E7EB' }}>
          {[['monthly', 'Monthly', null], ['3months', '3 Months', 'Save 10%'], ['yearly', 'Yearly', 'Save 18%']].map(([k, l, badge]) => (
            <button key={k} onClick={() => setPlanDur(k)} style={{
              padding: '10px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 13, fontFamily: 'inherit', position: 'relative',
              background: planDur === k ? '#fff' : 'transparent',
              color: planDur === k ? C.text : '#9CA3AF',
              boxShadow: planDur === k ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}>
              {l}
              {badge && (
                <span style={{
                  position: 'absolute', top: -9, right: -4,
                  background: k === 'yearly' ? '#10B981' : '#F59E0B',
                  color: '#fff', fontSize: 9, fontWeight: 700,
                  padding: '2px 6px', borderRadius: 10, whiteSpace: 'nowrap',
                }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {PLAN_DETAILS.map(plan => (
          <div key={plan.bhk} style={{
            background: '#fff', borderRadius: 18, padding: '28px 24px',
            border: plan.pop ? `2px solid ${C.primary}` : '1px solid #E5E7EB',
            position: 'relative',
            boxShadow: plan.pop ? '0 8px 40px rgba(255,90,60,0.13)' : 'none',
          }}>
            {plan.pop && (
              <div style={{
                position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                background: C.primary, color: '#fff', fontSize: 11, fontWeight: 700,
                padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap',
              }}>
                ⭐ Most Popular
              </div>
            )}

            {/* Plan header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ background: `${plan.color}18`, color: plan.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{plan.bhk}</span>
              </div>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: plan.color, margin: '0 0 4px' }}>{plan.name}</h2>
              <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.5 }}>{plan.desc}</p>
            </div>

            {/* Price */}
            <div style={{ marginBottom: 22, paddingBottom: 20, borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontWeight: 800, fontSize: 36, color: C.text }}>₹{calcPrice(plan.bhk, planDur).toLocaleString()}</span>
                <span style={{ color: C.muted, fontSize: 14 }}>
                  /{planDur === 'monthly' ? 'mo' : planDur === '3months' ? '3 mo' : 'yr'}
                </span>
              </div>
              {planDur !== 'monthly' && (
                <p style={{ fontSize: 12, color: '#10B981', fontWeight: 600, margin: '4px 0 2px' }}>
                  You save {planDur === '3months' ? '10%' : '18%'} vs monthly billing
                </p>
              )}
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>
                Base rate: ₹{PLANS[plan.bhk]}/month per property
              </p>
            </div>

            {/* Features */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {plan.features.map(f => (
                <li key={f} style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: '#10B981', fontWeight: 700, flexShrink: 0, fontSize: 14 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleGetStarted(plan.name, calcPrice(plan.bhk, planDur))}
              style={{
                ...btnPrimary,
                background: plan.pop ? plan.color : '#fff',
                color: plan.pop ? '#fff' : plan.color,
                border: `2px solid ${plan.color}`,
                width: '100%', padding: '13px', fontSize: 14,
                borderRadius: 10, fontWeight: 700,
              }}
            >
              {!user ? 'Sign Up as Owner →' : user.role === 'owner' ? `Start ${plan.name} Plan →` : 'Owner Accounts Only'}
            </button>
          </div>
        ))}
      </div>

      {/* Owner-only notice */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 14, padding: '20px 24px', marginTop: 32, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ fontSize: 28, flexShrink: 0 }}>ℹ️</div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#1E40AF', margin: '0 0 4px' }}>These plans are for property owners listing PGs</p>
          <p style={{ fontSize: 13, color: '#3B82F6', margin: 0, lineHeight: 1.6 }}>
            Students can browse and contact owners completely free. No subscription needed to find your perfect PG.
            If you're a student, <strong>just search for PGs</strong> — it's 100% free.
          </p>
        </div>
      </div>

      {/* Enterprise */}
      <div style={{ background: C.text, borderRadius: 16, padding: '28px 32px', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: '#fff', margin: '0 0 6px' }}>Have 10+ properties?</h3>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: 0 }}>Contact us for enterprise pricing, bulk listing tools, and a dedicated account manager.</p>
        </div>
        <button onClick={handleContactSales} style={{ background: C.primary, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          Contact Sales →
        </button>
      </div>
    </div>
  )
}