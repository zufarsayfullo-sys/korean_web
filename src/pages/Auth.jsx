import { useState } from 'react'
import { supabase } from '../supabaseClient'

const SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL

const Logo = () => (
  <svg viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" style={{ width: 44, height: 44 }}>
    <circle cx="65" cy="65" r="62" fill="white" stroke="#C0392B" strokeWidth="3"/>
    <circle cx="65" cy="65" r="54" fill="none" stroke="#C0392B" strokeWidth="0.6" opacity="0.4"/>
    <path d="M65 22 A22 22 0 0 1 65 66 A22 22 0 0 0 65 110 A44 44 0 0 1 65 22Z" fill="#C0392B"/>
    <path d="M65 22 A44 44 0 0 0 65 110 A22 22 0 0 1 65 66 A22 22 0 0 0 65 22Z" fill="#003478"/>
    <circle cx="65" cy="44" r="11" fill="#C0392B"/><circle cx="65" cy="44" r="4.5" fill="white"/>
    <circle cx="65" cy="88" r="11" fill="#003478"/><circle cx="65" cy="88" r="4.5" fill="white"/>
    <g stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="30" x2="28" y2="30"/><line x1="18" y1="34" x2="28" y2="34"/><line x1="18" y1="38" x2="28" y2="38"/>
      <line x1="102" y1="30" x2="112" y2="30"/><line x1="102" y1="34" x2="112" y2="34"/><line x1="107" y1="38" x2="112" y2="38"/><line x1="102" y1="38" x2="105" y2="38"/>
      <line x1="18" y1="92" x2="28" y2="92"/><line x1="20" y1="96" x2="25" y2="96"/><line x1="18" y1="100" x2="28" y2="100"/>
      <line x1="102" y1="92" x2="112" y2="92"/><line x1="102" y1="96" x2="112" y2="96"/><line x1="102" y1="100" x2="112" y2="100"/>
    </g>
  </svg>
)

async function sendToSheets(payload) {
  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (err) {
    console.error('Sheets sync failed:', err)
  }
}

export default function Auth() {
  const [tab, setTab] = useState('login')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dialCode, setDialCode] = useState('+998')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmedEmail, setConfirmedEmail] = useState('')

  async function handleSignup() {
    setError('')
    if (!firstName.trim()) return setError('First name is required')
    if (!lastName.trim()) return setError('Last name is required')
    if (!phone.trim()) return setError('Phone number is required')
    if (!email.trim()) return setError('Email is required')
    if (password.length < 8) return setError('Password must be at least 8 characters')

    setLoading(true)
    const fullName = firstName.trim() + ' ' + lastName.trim()
    const fullPhone = dialCode + ' ' + phone.trim()

    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName,
          phone: fullPhone,
          course: 'topik1'
        }
      }
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        phone: fullPhone,
        course: 'topik1'
      })

      await sendToSheets({
        full_name: fullName,
        phone: fullPhone,
        email: email.trim(),
        course: 'TOPIK 1'
      })
    }

    setConfirmedEmail(email.trim())
    setConfirmed(true)
    setLoading(false)
  }

  async function handleLogin() {
    setError('')
    if (!email.trim() || !password) return setError('Please fill in all fields')
    setLoading(true)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    if (loginError) {
      setError(loginError.message)
    }
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.bg} />
      <div style={s.card}>
        <div style={s.logoRow}>
          <Logo />
          <div>
            <div style={s.logoName}>Aiman Korean</div>
            <div style={s.logoSub}>Language Academy</div>
          </div>
        </div>

        {confirmed ? (
          <div style={s.confirm}>
            <div style={s.checkCircle}>✓</div>
            <h3 style={s.confirmTitle}>Check your email</h3>
            <p style={s.confirmText}>
              We sent a confirmation link to<br />
              <strong>{confirmedEmail}</strong><br /><br />
              Click the link to activate your account and start learning Korean.
            </p>
          </div>
        ) : (
          <>
            <div style={s.tabs}>
              <button style={{...s.tab, ...(tab==='login' ? s.tabActive : {})}} onClick={() => { setTab('login'); setError('') }}>Sign in</button>
              <button style={{...s.tab, ...(tab==='signup' ? s.tabActive : {})}} onClick={() => { setTab('signup'); setError('') }}>Create account</button>
            </div>

            {tab === 'login' ? (
              <div>
                <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
                <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                {error && <div style={s.err}>{error}</div>}
                <button style={s.btn} onClick={handleLogin} disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            ) : (
              <div>
                <div style={s.row}>
                  <Field label="First name" value={firstName} onChange={setFirstName} placeholder="Asel" />
                  <Field label="Last name" value={lastName} onChange={setLastName} placeholder="Nurova" />
                </div>
                <div style={s.fieldWrap}>
                  <label style={s.label}>Phone number</label>
                  <div style={s.phoneRow}>
                    <select value={dialCode} onChange={e => setDialCode(e.target.value)} style={s.dialSelect}>
                      <option value="+998">🇺🇿 +998</option>
                      <option value="+7">🇷🇺 +7</option>
                      <option value="+82">🇰🇷 +82</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                    <input style={{...s.input, borderRadius: '0 10px 10px 0', borderLeft: 'none'}} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="90 123 45 67" />
                  </div>
                </div>
                <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
                <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 8 characters" />
                {error && <div style={s.err}>{error}</div>}
                <button style={s.btn} onClick={handleSignup} disabled={loading}>
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={s.fieldWrap}>
      <label style={s.label}>{label}</label>
      <input style={s.input} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', position: 'relative', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" },
  bg: { position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(192,57,43,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 10% 80%, rgba(0,52,120,0.05) 0%, transparent 70%)' },
  card: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: '2.25rem', width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, boxShadow: '0 2px 40px rgba(0,0,0,0.06)' },
  logoRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.75rem' },
  logoName: { fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 600, color: '#1a1a1a' },
  logoSub: { fontSize: 11, color: '#6B6B6B', letterSpacing: '0.08em', textTransform: 'uppercase' },
  tabs: { display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: '1.5rem' },
  tab: { flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 500, color: '#6B6B6B', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginBottom: -1 },
  tabActive: { color: '#C0392B', borderBottomColor: '#C0392B' },
  fieldWrap: { marginBottom: '0.85rem' },
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: '#6B6B6B', marginBottom: 5, letterSpacing: '0.03em' },
  input: { width: '100%', padding: '10px 13px', fontSize: 14, fontFamily: "'DM Sans', sans-serif", border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, background: '#FAFAF8', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  phoneRow: { display: 'flex' },
  dialSelect: { padding: '10px 8px', fontSize: 13, fontFamily: "'DM Sans', sans-serif", border: '1px solid rgba(0,0,0,0.08)', borderRight: 'none', borderRadius: '10px 0 0 10px', background: '#F2F2F0', color: '#6B6B6B', cursor: 'pointer', outline: 'none' },
  btn: { width: '100%', padding: 12, fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", background: '#C0392B', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', marginTop: 8 },
  err: { fontSize: 12, color: '#C0392B', marginBottom: 8 },
  confirm: { textAlign: 'center', padding: '1rem 0' },
  checkCircle: { width: 56, height: 56, background: '#EAF3DE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: 22, color: '#27500A' },
  confirmTitle: { fontFamily: "'DM Sans', sans-serif", fontSize: 22, marginBottom: '0.5rem', fontWeight: 600 },
  confirmText: { fontSize: 13, color: '#6B6B6B', lineHeight: 1.7 }
}