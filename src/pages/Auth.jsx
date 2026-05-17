import { useState } from 'react'
import { supabase } from '../supabaseClient'

const SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL

const LANGS = {
  en: { flag: '🇬🇧', name: 'English', welcome: 'Welcome back 👋', sub: 'Sign in to continue your Korean journey', signIn: 'Sign in', createAcc: 'Create account', email: 'Email', password: 'Password', firstName: 'First name', lastName: 'Last name', phone: 'Phone number', minPass: 'Min. 8 characters', signingIn: 'Signing in...', creating: 'Creating account...', signInBtn: 'Sign in →', createBtn: 'Create account →', errFirst: 'First name is required', errLast: 'Last name is required', errPhone: 'Phone number is required', errEmail: 'Email is required', errPass: 'Password must be at least 8 characters', errFields: 'Please fill in all fields', checkEmail: 'Check your email', checkSub: 'We sent a confirmation link to', checkInfo: 'Click the link to activate your account and start learning Korean.', tagline: 'Your fastest path to Korean fluency', courses: 'Courses', certified: 'Certified', fast: 'Fast', results: 'Results' },
  ru: { flag: '🇷🇺', name: 'Русский', welcome: 'Добро пожаловать 👋', sub: 'Войдите, чтобы продолжить обучение', signIn: 'Войти', createAcc: 'Создать аккаунт', email: 'Эл. почта', password: 'Пароль', firstName: 'Имя', lastName: 'Фамилия', phone: 'Номер телефона', minPass: 'Мин. 8 символов', signingIn: 'Вход...', creating: 'Создание...', signInBtn: 'Войти →', createBtn: 'Создать аккаунт →', errFirst: 'Введите имя', errLast: 'Введите фамилию', errPhone: 'Введите номер телефона', errEmail: 'Введите эл. почту', errPass: 'Пароль должен быть не менее 8 символов', errFields: 'Заполните все поля', checkEmail: 'Проверьте почту', checkSub: 'Мы отправили ссылку на', checkInfo: 'Нажмите на ссылку, чтобы активировать аккаунт.', tagline: 'Быстрый путь к корейскому языку', courses: 'Курсы', certified: 'Сертификат', fast: 'Быстро', results: 'Результат' },
  uz: { flag: '🇺🇿', name: "O'zbek", welcome: "Xush kelibsiz 👋", sub: "Koreys tilini o'rganishda davom eting", signIn: 'Kirish', createAcc: "Ro'yxatdan o'tish", email: 'Elektron pochta', password: 'Parol', firstName: 'Ism', lastName: 'Familiya', phone: 'Telefon raqam', minPass: "Kamida 8 ta belgi", signingIn: 'Kirish...', creating: 'Yaratilmoqda...', signInBtn: 'Kirish →', createBtn: "Ro'yxatdan o'tish →", errFirst: 'Ism kiriting', errLast: 'Familiya kiriting', errPhone: 'Telefon raqam kiriting', errEmail: 'Elektron pochta kiriting', errPass: "Parol kamida 8 ta belgi bo'lishi kerak", errFields: "Barcha maydonlarni to'ldiring", checkEmail: 'Pochtangizni tekshiring', checkSub: 'Havola yuborildi', checkInfo: 'Akkauntingizni faollashtirish uchun havolani bosing.', tagline: "Koreyscha o'rganishning eng tez yo'li", courses: 'Kurslar', certified: 'Sertifikat', fast: 'Tez', results: 'Natija' },
  ko: { flag: '🇰🇷', name: '한국어', welcome: '환영합니다 👋', sub: '한국어 학습을 계속하세요', signIn: '로그인', createAcc: '계정 만들기', email: '이메일', password: '비밀번호', firstName: '이름', lastName: '성', phone: '전화번호', minPass: '최소 8자', signingIn: '로그인 중...', creating: '생성 중...', signInBtn: '로그인 →', createBtn: '계정 만들기 →', errFirst: '이름을 입력하세요', errLast: '성을 입력하세요', errPhone: '전화번호를 입력하세요', errEmail: '이메일을 입력하세요', errPass: '비밀번호는 최소 8자여야 합니다', errFields: '모든 항목을 입력하세요', checkEmail: '이메일을 확인하세요', checkSub: '확인 링크를 보냈습니다', checkInfo: '링크를 클릭하여 계정을 활성화하세요.', tagline: '한국어를 가장 빠르게 배우는 방법', courses: '과정', certified: '자격증', fast: '빠른', results: '결과' }
}

const Logo = () => (
  <svg viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" style={{ width: 96, height: 96, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.12))' }}>
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
      method: 'POST', mode: 'no-cors',
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
  const [langKey, setLangKey] = useState('en')
  const [langOpen, setLangOpen] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dialCode, setDialCode] = useState('+998')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmedEmail, setConfirmedEmail] = useState('')

  const t = LANGS[langKey]

  async function handleSignup() {
    setError('')
    if (!firstName.trim()) return setError(t.errFirst)
    if (!lastName.trim()) return setError(t.errLast)
    if (!phone.trim()) return setError(t.errPhone)
    if (!email.trim()) return setError(t.errEmail)
    if (password.length < 8) return setError(t.errPass)
    setLoading(true)
    const fullName = firstName.trim() + ' ' + lastName.trim()
    const fullPhone = dialCode + ' ' + phone.trim()
    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { full_name: fullName, phone: fullPhone, course: 'topik1' } }
    })
    if (signupError) { setError(signupError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, full_name: fullName, phone: fullPhone, course: 'topik1' })
      await sendToSheets({ full_name: fullName, phone: fullPhone, email: email.trim(), course: 'TOPIK 1' })
    }
    setConfirmedEmail(email.trim())
    setConfirmed(true)
    setLoading(false)
  }

  async function handleLogin() {
    setError('')
    if (!email.trim() || !password) return setError(t.errFields)
    setLoading(true)
    const { error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (loginError) setError(loginError.message)
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftDeco1} />
        <div style={s.leftDeco2} />
        <div style={s.leftContent}>
          <Logo />
          <div style={s.platformName}>Aiman Korean</div>
          <div style={s.tagline}>{t.tagline}</div>
          <div style={s.divider} />
          <div style={s.stats}>
            <div style={s.stat}><div style={s.statNum}>2</div><div style={s.statLabel}>{t.courses}</div></div>
            <div style={s.statSep} />
            <div style={s.stat}><div style={s.statNum}>TOPIK</div><div style={s.statLabel}>{t.certified}</div></div>
            <div style={s.statSep} />
            <div style={s.stat}><div style={s.statNum}>{t.fast}</div><div style={s.statLabel}>{t.results}</div></div>
          </div>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.rightTop}>
          <div style={{ position: 'relative' }}>
            <button style={s.langBtn} onClick={() => setLangOpen(!langOpen)}>
              <span>{t.flag}</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{t.name}</span>
              <span style={{ fontSize: 10, color: '#6B6B6B' }}>▾</span>
            </button>
            {langOpen && (
              <div style={s.langDropdown}>
                {Object.entries(LANGS).map(([key, l]) => (
                  <div key={key}
                    style={{ ...s.langOption, ...(key === langKey ? s.langOptionActive : {}) }}
                    onClick={() => { setLangKey(key); setLangOpen(false) }}>
                    {l.flag}&nbsp;&nbsp;{l.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={s.formWrap}>
          {confirmed ? (
            <div style={s.confirm}>
              <div style={s.checkCircle}>✓</div>
              <h3 style={s.confirmTitle}>{t.checkEmail}</h3>
              <p style={s.confirmText}>{t.checkSub}<br /><strong>{confirmedEmail}</strong><br /><br />{t.checkInfo}</p>
            </div>
          ) : (
            <>
              <div style={s.welcome}>{t.welcome}</div>
              <div style={s.welcomeSub}>{t.sub}</div>
              <div style={s.tabs}>
                <button style={{ ...s.tab, ...(tab === 'login' ? s.tabActive : {}) }} onClick={() => { setTab('login'); setError('') }}>{t.signIn}</button>
                <button style={{ ...s.tab, ...(tab === 'signup' ? s.tabActive : {}) }} onClick={() => { setTab('signup'); setError('') }}>{t.createAcc}</button>
              </div>
              {tab === 'login' ? (
                <div>
                  <Field label={t.email} type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
                  <Field label={t.password} type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                  {error && <div style={s.err}>{error}</div>}
                  <button style={s.btn} onClick={handleLogin} disabled={loading}>{loading ? t.signingIn : t.signInBtn}</button>
                </div>
              ) : (
                <div>
                  <div style={s.fieldRow}>
                    <Field label={t.firstName} value={firstName} onChange={setFirstName} placeholder="Asel" />
                    <Field label={t.lastName} value={lastName} onChange={setLastName} placeholder="Nurova" />
                  </div>
                  <div style={s.fieldWrap}>
                    <label style={s.label}>{t.phone}</label>
                    <div style={{ display: 'flex' }}>
                      <select value={dialCode} onChange={e => setDialCode(e.target.value)} style={s.dialSelect}>
                        <option value="+998">🇺🇿 +998</option>
                        <option value="+7">🇷🇺 +7</option>
                        <option value="+82">🇰🇷 +82</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                      </select>
                      <input style={{ ...s.input, borderRadius: '0 10px 10px 0', borderLeft: 'none', flex: 1 }} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="90 123 45 67" />
                    </div>
                  </div>
                  <Field label={t.email} type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
                  <Field label={t.password} type="password" value={password} onChange={setPassword} placeholder={t.minPass} />
                  {error && <div style={s.err}>{error}</div>}
                  <button style={s.btn} onClick={handleSignup} disabled={loading}>{loading ? t.creating : t.createBtn}</button>
                </div>
              )}
            </>
          )}
        </div>

        <div style={s.footer}>
          <div style={s.footerText}>© 2025 Aiman Korean Academy</div>
        </div>
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
  page: { minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif" },
  left: { width: '44%', background: '#fff', borderRight: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2.5rem', position: 'relative', overflow: 'hidden' },
  leftDeco1: { position: 'absolute', bottom: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,57,43,0.06) 0%, transparent 70%)' },
  leftDeco2: { position: 'absolute', top: -40, left: -40, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,52,120,0.05) 0%, transparent 70%)' },
  leftContent: { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  platformName: { fontSize: 26, fontWeight: 700, color: '#1a1a1a', textAlign: 'center', letterSpacing: '-0.02em' },
  tagline: { fontSize: 13, color: '#6B6B6B', textAlign: 'center', lineHeight: 1.7, maxWidth: 200 },
  divider: { width: 40, height: 2, background: 'linear-gradient(90deg, #C0392B, #003478)', borderRadius: 2 },
  stats: { display: 'flex', gap: 12, alignItems: 'center' },
  stat: { textAlign: 'center' },
  statNum: { fontSize: 17, fontWeight: 700, color: '#C0392B' },
  statLabel: { fontSize: 10, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.05em' },
  statSep: { width: 1, height: 28, background: 'rgba(0,0,0,0.08)' },
  right: { flex: 1, background: '#fff', display: 'flex', flexDirection: 'column' },
  rightTop: { display: 'flex', justifyContent: 'flex-end', padding: '16px 20px 0' },
  langBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#F2F2F0', borderRadius: 20, padding: '5px 12px', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13 },
  langDropdown: { position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: 140, zIndex: 100 },
  langOption: { display: 'flex', alignItems: 'center', padding: '9px 14px', fontSize: 13, cursor: 'pointer', color: '#1a1a1a' },
  langOptionActive: { color: '#C0392B', fontWeight: 500, background: '#FDECEA' },
  formWrap: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 2.25rem 1.5rem' },
  welcome: { fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 },
  welcomeSub: { fontSize: 13, color: '#6B6B6B', marginBottom: '1.5rem' },
  tabs: { display: 'flex', background: '#F2F2F0', borderRadius: 10, padding: 3, marginBottom: '1.25rem' },
  tab: { flex: 1, padding: '7px', fontSize: 13, fontWeight: 500, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none', color: '#6B6B6B', fontFamily: "'DM Sans', sans-serif" },
  tabActive: { background: '#fff', color: '#1a1a1a', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  fieldWrap: { marginBottom: '0.75rem' },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  label: { display: 'block', fontSize: 11, fontWeight: 600, color: '#6B6B6B', marginBottom: 5, letterSpacing: '0.04em', textTransform: 'uppercase' },
  input: { width: '100%', padding: '10px 13px', fontSize: 14, fontFamily: "'DM Sans', sans-serif", border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 10, background: '#FAFAF8', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' },
  dialSelect: { padding: '10px 8px', fontSize: 13, fontFamily: "'DM Sans', sans-serif", border: '1.5px solid rgba(0,0,0,0.08)', borderRight: 'none', borderRadius: '10px 0 0 10px', background: '#F2F2F0', color: '#6B6B6B', cursor: 'pointer', outline: 'none' },
  btn: { width: '100%', padding: 12, fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", background: '#C0392B', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', marginTop: 6 },
  err: { fontSize: 12, color: '#C0392B', marginBottom: 8 },
  confirm: { textAlign: 'center', padding: '1rem 0' },
  checkCircle: { width: 56, height: 56, background: '#EAF3DE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: 22, color: '#27500A' },
  confirmTitle: { fontFamily: "'DM Sans', sans-serif", fontSize: 22, marginBottom: '0.5rem', fontWeight: 600 },
  confirmText: { fontSize: 13, color: '#6B6B6B', lineHeight: 1.7 },
  footer: { padding: '12px 2.25rem', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  footerText: { fontSize: 11, color: '#6B6B6B' }
}