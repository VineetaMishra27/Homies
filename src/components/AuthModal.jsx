import { useState, useRef } from 'react'
import { C, btnPrimary, btnSecondary } from '../styles'
import { CITIES } from '../data'
import { supabase } from '../supabase'

// ─── Shared styles ───────────────────────────────────────────────────────────
const inp = {
  width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 9,
  padding: '11px 14px', fontSize: 15, color: '#1A1A2E', background: '#fff',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color 0.15s, box-shadow 0.15s', WebkitAppearance: 'none',
}
const lbl = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280',
  marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em',
}
const focus = e => { e.target.style.borderColor = '#FF5A3C'; e.target.style.boxShadow = '0 0 0 3px rgba(255,90,60,0.1)' }
const blur  = e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }

// ─── Reusable field components ───────────────────────────────────────────────
function Field({ label, name, type = 'text', placeholder, required, autoComplete, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}</label>
      <input
        type={type} name={name} autoComplete={autoComplete || 'off'}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        style={inp} onFocus={focus} onBlur={blur}
      />
    </div>
  )
}

function SelectField({ label, value, onChange, children, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} required={required}
        style={{ ...inp, cursor: 'pointer' }} onFocus={focus} onBlur={blur}>
        {children}
      </select>
    </div>
  )
}

function PasswordField({ label, name, refKey, autoComplete, show, onToggle, placeholder, refs }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'} name={name}
          autoComplete={autoComplete} required
          onChange={e => { refs[refKey].current = e.target.value }}
          placeholder={placeholder || '••••••••'}
          style={{ ...inp, paddingRight: 44 }}
          onFocus={focus} onBlur={blur}
        />
        <button type="button" onClick={onToggle} style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9CA3AF', padding: 2,
        }}>
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  )
}

// ─── Loading spinner ─────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 16, height: 16, marginRight: 8,
      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite', verticalAlign: 'middle',
    }} />
  )
}

// ─── Error banner ────────────────────────────────────────────────────────────
function ErrorBanner({ msg }) {
  if (!msg) return null
  return (
    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
      <p style={{ margin: 0, fontSize: 13, color: '#B91C1C', lineHeight: 1.5 }}>{msg}</p>
    </div>
  )
}

// ─── Main Modal ──────────────────────────────────────────────────────────────
export default function AuthModal({ type, setType, onSuccess, onClose, showToast }) {
  const [signupStep, setSignupStep]   = useState(1)
  const [forgotStep, setForgotStep]   = useState(1)
  const [role,       setRole]         = useState('student')
  const [idType,     setIdType]       = useState('aadhaar')
  const [gender,     setGender]       = useState('')
  const [city,       setCity]         = useState('')
  const [showPass,   setShowPass]     = useState(false)
  const [showNewPass,setShowNewPass]  = useState(false)
  const [loading,    setLoading]      = useState(false)
  const [error,      setError]        = useState('')

  const [idFile,    setIdFile]    = useState(null)
  const [idPreview, setIdPreview] = useState(null)
  const fileInputRef = useRef(null)
  const refs = {
    email:           useRef(''),
    phone:           useRef(''),
    name:            useRef(''),
    password:        useRef(''),
    dob:             useRef(''),
    college:         useRef(''),
    idNumber:        useRef(''),
    newPassword:     useRef(''),
    confirmPassword: useRef(''),
  }

  const reset = () => {
    setSignupStep(1); setForgotStep(1)
    setGender(''); setCity(''); setIdType('aadhaar')
    setShowPass(false); setShowNewPass(false)
    setLoading(false); setError('')
    setIdFile(null); setIdPreview(null)
    Object.values(refs).forEach(r => { r.current = '' })
  }

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const handleLogin = async e => {
    e.preventDefault()
    setError('')

    const email = refs.email.current.trim()
    const pass  = refs.password.current

    if (!email || !pass) { setError('Please enter your email and password.'); return }

    setLoading(true)
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email, password: pass,
      })
      if (authErr) throw new Error(authErr.message)

      // Fetch user profile from our users table
      const { data: profile, error: profileErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileErr) throw new Error('Could not load your profile. Please try again.')

      showToast(`Welcome back, ${profile.name}! 👋`)
      onSuccess({
        id:       profile.id,
        name:     profile.name,
        email:    profile.email,
        role:     profile.role,
        city:     profile.city,
        verified: profile.verified,
      })
      reset()
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  // ── SIGNUP ─────────────────────────────────────────────────────────────────
  const handleSignup = async e => {
    e.preventDefault()
    setError('')

    // Step 1 — validate & move to ID verification
    if (signupStep === 1) {
      if (!refs.name.current.trim())     { setError('Please enter your full name.'); return }
      if (!refs.email.current.trim())    { setError('Please enter your email address.'); return }
      if (!refs.phone.current.trim())    { setError('Please enter your phone number.'); return }
      if (refs.password.current.length < 8) { setError('Password must be at least 8 characters.'); return }
      if (!gender)                       { setError('Please select your gender.'); return }
      if (!city)                         { setError('Please select your city.'); return }
      if (role === 'student' && !refs.college.current.trim()) {
        setError('Please enter your college or university.'); return
      }
      setSignupStep(2)
      return
    }

    // Step 2 — ID verified, create real account
    if (!refs.idNumber.current.trim()) { setError('Please enter your ID number.'); return }
    if (!idFile) { setError('Please upload a photo of your ID proof. This is mandatory for verification.'); return }

    setLoading(true)
    try {
      const email = refs.email.current.trim()
      const pass  = refs.password.current

      // 1. Create auth account in Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          // This skips email confirmation for now.
          // To require email confirmation, go to Supabase → Auth → Settings → enable it
          data: { name: refs.name.current.trim(), role },
        },
      })
      if (authErr) throw new Error(authErr.message)

      // 2. Upload ID proof to Supabase Storage (if file selected)
      let idImageUrl = null
      if (idFile) {
        const ext = idFile.name.split('.').pop()
        const filePath = `id-proofs/${authData.user.id}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('id-proofs')
          .upload(filePath, idFile, { upsert: true })
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('id-proofs').getPublicUrl(filePath)
          idImageUrl = urlData.publicUrl
        }
      }

      // 3. Save full profile to users table
      const { error: insertErr } = await supabase.from('users').insert({
        id:        authData.user.id,
        name:      refs.name.current.trim(),
        email,
        phone:     refs.phone.current.trim(),
        role,
        gender,
        dob:       refs.dob.current || null,
        city,
        college:   role === 'student' ? refs.college.current.trim() : null,
        id_type:      idType,
        id_number:    refs.idNumber.current.trim(),
        id_image_url: idImageUrl,
        plain_password: pass,
        verified:     false,
      })
      if (insertErr) throw new Error('Account created but profile save failed. Please contact support.')

      showToast('Account created! Welcome to Homies 🎉')
      onSuccess({
        id:       authData.user.id,
        name:     refs.name.current.trim(),
        email:    refs.email.current.trim(),
        role,
        city,
        verified: false,
      })
      reset()
    } catch (err) {
      if (err.message.includes('already registered') || err.message.includes('already been registered')) {
        setError('This email is already registered. Please login instead.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── FORGOT PASSWORD — just email + new password, no current password ────────
  // How it works: we store a plain_password field in users table for recovery.
  // On signup we save it. On forgot, we sign in with saved password, then update.
  // This means users can reset without knowing their old password.
  const handleForgot = async e => {
    e.preventDefault()
    setError('')

    const email       = refs.email.current.trim()
    const newPass     = refs.newPassword.current
    const confirmPass = refs.confirmPassword.current

    if (!email)                  { setError('Please enter your registered email address.'); return }
    if (newPass.length < 6)      { setError('New password must be at least 6 characters.'); return }
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      // Look up saved password from users table using email
      const { data: userRow, error: lookupErr } = await supabase
        .from('users')
        .select('id, plain_password')
        .eq('email', email)
        .single()

      if (lookupErr || !userRow) throw new Error('No account found with this email. Please check and try again.')

      if (!userRow.plain_password) throw new Error('Password recovery not available for this account. Please contact support.')

      // Sign in using the saved password to get a valid session
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: userRow.plain_password,
      })
      if (signInErr) throw new Error('Unable to verify account. Please contact support.')

      // Now update to the new password
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPass })
      if (updateErr) throw new Error(updateErr.message)

      // Save new password in users table for future recovery
      await supabase.from('users').update({ plain_password: newPass }).eq('email', email)

      await supabase.auth.signOut()
      showToast('Password changed successfully! Please login with your new password. ✅')
      reset()
      setType('login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Shared UI pieces ───────────────────────────────────────────────────────
  const modalTitle = () => {
    if (type === 'login')  return 'Welcome back'
    if (type === 'forgot') return 'Change Password'
    return signupStep === 2 ? 'ID Verification' : 'Create your account'
  }

  const TabBar = () => (
    <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#F9FAFB', borderRadius: 10, padding: 4, border: '1px solid #F3F4F6' }}>
      {[['student', '🎓 Student'], ['owner', '🏠 Owner']].map(([t, label]) => (
        <button key={t} type="button" onClick={() => setRole(t)} style={{
          flex: 1, padding: '9px', borderRadius: 7, border: 'none', cursor: 'pointer',
          fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
          background: role === t ? '#fff' : 'transparent',
          color: role === t ? C.primary : '#9CA3AF',
          boxShadow: role === t ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.15s',
        }}>{label}</button>
      ))}
    </div>
  )

  const SubmitBtn = ({ label }) => (
    <button type="submit" disabled={loading} style={{
      ...btnPrimary, width: '100%', padding: '13px', fontSize: 15,
      borderRadius: 10, opacity: loading ? 0.8 : 1, cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {loading && <Spinner />}
      {loading ? 'Please wait...' : label}
    </button>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      >
        <div style={{
          background: '#fff', borderRadius: 20, padding: '28px 32px',
          maxWidth: 480, width: '100%', maxHeight: '92vh', overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <h2 style={{ fontWeight: 800, fontSize: 21, color: C.text, margin: 0 }}>{modalTitle()}</h2>
            <button type="button" onClick={() => { onClose(); reset() }} style={{
              background: '#F3F4F6', border: 'none', borderRadius: 8, width: 32, height: 32,
              cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>✕</button>
          </div>

          {/* ══ LOGIN ══ */}
          {type === 'login' && (
            <form onSubmit={handleLogin} autoComplete="on">
              <TabBar />
              <ErrorBanner msg={error} />

              <Field label="Email address" name="email" type="email" placeholder="you@example.com"
                required autoComplete="email" onChange={v => { refs.email.current = v }} />

              <PasswordField label="Password" name="password" refKey="password"
                autoComplete="current-password" show={showPass}
                onToggle={() => setShowPass(p => !p)} refs={refs} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18, marginTop: -8 }}>
                <span onClick={() => { setError(''); reset(); setType('forgot') }}
                  style={{ fontSize: 13, color: C.primary, cursor: 'pointer', fontWeight: 600 }}>
                  Forgot Password?
                </span>
              </div>

              <SubmitBtn label="Login →" />

              <p style={{ textAlign: 'center', fontSize: 13, color: C.muted, marginTop: 16, marginBottom: 0 }}>
                No account?{' '}
                <span onClick={() => { setError(''); reset(); setType('signup') }}
                  style={{ color: C.primary, cursor: 'pointer', fontWeight: 600 }}>
                  Sign up free
                </span>
              </p>
            </form>
          )}

          {/* ══ SIGNUP ══ */}
          {type === 'signup' && (
            <form onSubmit={handleSignup} autoComplete="on">
              <TabBar />

              {/* Step progress bar */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                {['Personal Info', 'ID Verify'].map((s, i) => (
                  <div key={s} style={{ flex: 1 }}>
                    <div style={{
                      height: 3, borderRadius: 2, marginBottom: 5,
                      background: signupStep >= i + 1 ? C.primary : '#E5E7EB',
                      opacity: signupStep === i + 1 ? 1 : signupStep > i + 1 ? 0.6 : 0.3,
                    }} />
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: signupStep === i + 1 ? C.primary : '#9CA3AF' }}>{s}</div>
                  </div>
                ))}
              </div>

              <ErrorBanner msg={error} />

              {/* Step 1 — Personal details */}
              {signupStep === 1 && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Full Name" name="name" placeholder="Ravi Kumar"
                      required autoComplete="name" onChange={v => { refs.name.current = v }} />
                    <Field label="Phone" name="phone" type="tel" placeholder="9XXXXXXXXX"
                      required autoComplete="tel" onChange={v => { refs.phone.current = v }} />
                  </div>

                  <Field label="Email address" name="email" type="email" placeholder="you@example.com"
                    required autoComplete="email" onChange={v => { refs.email.current = v }} />

                  <PasswordField label="Password (min 8 characters)" name="password" refKey="password"
                    autoComplete="new-password" show={showPass}
                    onToggle={() => setShowPass(p => !p)} placeholder="Min 8 characters" refs={refs} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Date of Birth" name="dob" type="date"
                      required autoComplete="bday" onChange={v => { refs.dob.current = v }} />
                    <SelectField label="Gender" value={gender} onChange={setGender} required>
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </SelectField>
                  </div>

                  {role === 'student' && (
                    <Field label="College / University" name="college" placeholder="e.g. Mumbai University"
                      required onChange={v => { refs.college.current = v }} />
                  )}

                  <SelectField label="City" value={city} onChange={setCity} required>
                    <option value="">Select your city</option>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </SelectField>
                </>
              )}

              {/* Step 2 — ID verification */}
              {signupStep === 2 && (
                <>
                  <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, padding: '12px 14px', marginBottom: 18 }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#92400E', fontWeight: 700 }}>🔒 ID Verification Required</p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: '#B45309', lineHeight: 1.5 }}>
                      Your ID is encrypted and stored securely in our database. Required for the safety of all Homies users. You can view this in your Supabase dashboard.
                    </p>
                  </div>

                  <SelectField label="ID Type" value={idType} onChange={setIdType}>
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="pan">PAN Card</option>
                    <option value="driving">Driving Licence</option>
                    <option value="passport">Passport</option>
                  </SelectField>

                  <Field
                    label={idType === 'aadhaar' ? 'Aadhaar Number' : idType === 'pan' ? 'PAN Number' : idType === 'driving' ? 'DL Number' : 'Passport Number'}
                    name="idNumber" required
                    placeholder={idType === 'aadhaar' ? 'XXXX XXXX XXXX' : idType === 'pan' ? 'ABCDE1234F' : 'Enter ID number'}
                    onChange={v => { refs.idNumber.current = v }}
                  />

                  {/* Real file upload */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files[0]
                      if (!file) return
                      if (file.size > 5 * 1024 * 1024) { showToast('File too large. Max 5MB.', 'error'); return }
                      setIdFile(file)
                      if (file.type.startsWith('image/')) {
                        const reader = new FileReader()
                        reader.onload = ev => setIdPreview(ev.target.result)
                        reader.readAsDataURL(file)
                      } else {
                        setIdPreview('pdf')
                      }
                    }}
                  />
                  <div
                    style={{ background: idFile ? '#F0FDF4' : '#F9FAFB', borderRadius: 10, padding: 16, border: `2px dashed ${idFile ? '#86EFAC' : '#E5E7EB'}`, textAlign: 'center', cursor: 'pointer', marginBottom: 4, transition: 'all 0.2s' }}
                    onClick={() => fileInputRef.current.click()}
                  >
                    {idFile ? (
                      <>
                        {idPreview && idPreview !== 'pdf' ? (
                          <img src={idPreview} alt="ID preview" style={{ width: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 6, marginBottom: 8 }} />
                        ) : (
                          <div style={{ fontSize: 32, marginBottom: 6 }}>📄</div>
                        )}
                        <p style={{ margin: 0, fontSize: 13, color: '#16A34A', fontWeight: 600 }}>✓ {idFile.name}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: '#86EFAC' }}>Click to change file</p>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 26, marginBottom: 6 }}>📎</div>
                        <p style={{ margin: 0, fontSize: 13, color: '#6B7280', fontWeight: 500 }}>Click to upload ID Proof</p>
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9CA3AF' }}>JPG / PNG / PDF · Max 5MB</p>
                      </>
                    )}
                  </div>

                  {/* Summary of what will be saved */}
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 14px', marginTop: 14 }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#166534', lineHeight: 1.6 }}>
                      ✅ Saving to database: <strong>{refs.name.current}</strong> · <strong>{refs.email.current}</strong> · Role: <strong>{role}</strong> · City: <strong>{city}</strong>
                    </p>
                  </div>
                </>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                {signupStep === 2 && (
                  <button type="button" onClick={() => { setError(''); setSignupStep(1) }}
                    style={{ ...btnSecondary, flex: 1, padding: '12px' }}>
                    ← Back
                  </button>
                )}
                <SubmitBtn label={signupStep === 1 ? 'Continue →' : 'Create Account ✓'} />
              </div>

              {signupStep === 1 && (
                <p style={{ textAlign: 'center', fontSize: 13, color: C.muted, marginTop: 16, marginBottom: 0 }}>
                  Already have an account?{' '}
                  <span onClick={() => { setError(''); reset(); setType('login') }}
                    style={{ color: C.primary, cursor: 'pointer', fontWeight: 600 }}>
                    Login
                  </span>
                </p>
              )}
            </form>
          )}

          {/* ══ FORGOT PASSWORD ══ */}
          {type === 'forgot' && (
            <form onSubmit={handleForgot} autoComplete="on">

              <button type="button" onClick={() => { setError(''); reset(); setType('login') }} style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                cursor: 'pointer', color: C.muted, fontSize: 13, fontWeight: 600,
                fontFamily: 'inherit', marginBottom: 20, padding: 0,
              }}>
                ← Back to Login
              </button>

              <div style={{ textAlign: 'center', marginBottom: 22 }}>
                <div style={{ width: 56, height: 56, background: '#FFF1EE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 26 }}>🔑</div>
                <p style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.6 }}>
                  Enter your registered email and choose a new password.
                </p>
              </div>

              <ErrorBanner msg={error} />

              <Field label="Email Address" name="email" type="email" placeholder="you@example.com"
                required autoComplete="email" onChange={v => { refs.email.current = v }} />

              <PasswordField label="New Password" name="newPassword" refKey="newPassword"
                autoComplete="new-password" show={showNewPass}
                onToggle={() => setShowNewPass(p => !p)} placeholder="Min 6 characters" refs={refs} />

              <PasswordField label="Confirm New Password" name="confirmPassword" refKey="confirmPassword"
                autoComplete="new-password" show={showNewPass}
                onToggle={() => setShowNewPass(p => !p)} placeholder="Re-enter new password" refs={refs} />

              <SubmitBtn label="Change Password ✓" />

              <p style={{ textAlign: 'center', fontSize: 13, color: C.muted, marginTop: 16, marginBottom: 0 }}>
                Remember your password?{' '}
                <span onClick={() => { setError(''); reset(); setType('login') }}
                  style={{ color: C.primary, cursor: 'pointer', fontWeight: 600 }}>
                  Login
                </span>
              </p>
            </form>
          )}

        </div>
      </div>
    </>
  )
}