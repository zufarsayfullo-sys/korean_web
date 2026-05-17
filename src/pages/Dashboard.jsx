import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { LANGS } from './Auth'

const DT = {
  en: { home:'Home', marks:'Marks', schedule:'Schedule', profile:'Profile', liveLesson:'Next Live Lesson', copyLink:'Copy link', copied:'Copied!', lastHw:'Last Homework', viewAll:'View all homework ↗', completed:'completed', tasks:'tasks done', noLesson:'No lesson yet', noLive:'No upcoming live lesson', classMarks:'Class Marks', students:'Students', avg:'Avg', you:'you', pending:'Waiting for approval', pendingMsg:"You'll get access to your Korean lessons once Aiman approves your account.", rejected:'Access not approved', rejectedMsg:'Unfortunately your account was not approved. Please contact Aiman for more information.', almostThere:'Almost there!', reviewSub:'Aiman is reviewing your account', step1Title:'Account created', step1Sub:"You're registered!", step2Title:'Under review', step2Sub:'Aiman is checking your details', step3Title:'Access granted', step3Sub:'Start learning Korean!', signOut:'Sign out', tapPhoto:'Tap to change photo', email:'Email', phone:'Phone', course:'Course', language:'Language', hwModal:'My Homework', close:'Close', lesson:'Lesson', of:'of', done:'done', locked:'Locked', current:'Current', noLessons:'No lessons yet. Aiman will add them soon!' },
  ru: { home:'Главная', marks:'Оценки', schedule:'Расписание', profile:'Профиль', liveLesson:'Следующий урок', copyLink:'Скопировать ссылку', copied:'Скопировано!', lastHw:'Последнее ДЗ', viewAll:'Все задания ↗', completed:'выполнено', tasks:'заданий сделано', noLesson:'Урок не назначен', noLive:'Нет предстоящих уроков', classMarks:'Оценки класса', students:'Ученики', avg:'Ср.', you:'вы', pending:'Ожидание подтверждения', pendingMsg:'Вы получите доступ после подтверждения Аиман.', rejected:'Доступ не одобрен', rejectedMsg:'Аккаунт не одобрен. Свяжитесь с Аиман.', almostThere:'Почти готово!', reviewSub:'Аиман проверяет ваш аккаунт', step1Title:'Аккаунт создан', step1Sub:'Вы зарегистрированы!', step2Title:'На проверке', step2Sub:'Аиман проверяет данные', step3Title:'Доступ получен', step3Sub:'Начните учить корейский!', signOut:'Выйти', tapPhoto:'Нажмите для смены фото', email:'Эл. почта', phone:'Телефон', course:'Курс', language:'Язык', hwModal:'Мои задания', close:'Закрыть', lesson:'Урок', of:'из', done:'сделано', locked:'Закрыто', current:'Текущий', noLessons:'Уроков пока нет. Аиман скоро добавит!' },
  uz: { home:'Bosh sahifa', marks:'Baholar', schedule:'Jadval', profile:'Profil', liveLesson:'Keyingi dars', copyLink:'Havolani nusxalash', copied:'Nusxalandi!', lastHw:'Oxirgi vazifa', viewAll:"Barcha vazifalar ↗", completed:'bajarildi', tasks:'topshiriq bajarildi', noLesson:'Dars tayinlanmagan', noLive:"Kelgusi darslar yo'q", classMarks:'Sinf baholari', students:'Talabalar', avg:"O'rt.", you:'siz', pending:'Tasdiqlash kutilmoqda', pendingMsg:"Aiman akkauntingizni tasdiqlagandan so'ng kirish imkoniyatiga ega bo'lasiz.", rejected:'Kirish tasdiqlanmadi', rejectedMsg:"Akkaunt tasdiqlanmadi. Aiman bilan bog'laning.", almostThere:'Deyarli tayyor!', reviewSub:"Aiman akkauntingizni ko'rib chiqmoqda", step1Title:'Akkount yaratildi', step1Sub:"Ro'yxatdan o'tdingiz!", step2Title:"Ko'rib chiqilmoqda", step2Sub:"Aiman ma'lumotlaringizni tekshirmoqda", step3Title:'Kirish berildi', step3Sub:"O'rganishni boshlang!", signOut:'Chiqish', tapPhoto:"Rasmni o'zgartirish uchun bosing", email:'Elektron pochta', phone:'Telefon', course:'Kurs', language:'Til', hwModal:'Mening vazifalarim', close:'Yopish', lesson:'Dars', of:'dan', done:'bajarildi', locked:'Qulflangan', current:'Joriy', noLessons:"Hozircha darslar yo'q. Aiman tez orada qo'shadi!" },
  ko: { home:'홈', marks:'성적', schedule:'일정', profile:'프로필', liveLesson:'다음 라이브 수업', copyLink:'링크 복사', copied:'복사됨!', lastHw:'마지막 숙제', viewAll:'모든 숙제 보기 ↗', completed:'완료', tasks:'과제 완료', noLesson:'수업 없음', noLive:'예정된 수업 없음', classMarks:'반 성적', students:'학생', avg:'평균', you:'나', pending:'승인 대기 중', pendingMsg:'Aiman이 승인하면 수업에 접근할 수 있습니다.', rejected:'접근 승인 안됨', rejectedMsg:'계정이 승인되지 않았습니다. Aiman에게 문의하세요.', almostThere:'거의 다 됐어요!', reviewSub:'Aiman이 검토 중입니다', step1Title:'계정 생성됨', step1Sub:'등록되었습니다!', step2Title:'검토 중', step2Sub:'Aiman이 확인 중입니다', step3Title:'접근 허용됨', step3Sub:'한국어 학습 시작!', signOut:'로그아웃', tapPhoto:'사진 변경하려면 탭', email:'이메일', phone:'전화번호', course:'과정', language:'언어', hwModal:'내 숙제', close:'닫기', lesson:'수업', of:'/', done:'완료', locked:'잠김', current:'현재', noLessons:'아직 수업이 없습니다.' }
}

const Logo = ({ size = 40 }) => (
  <svg viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" style={{ width: size, height: size }}>
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

export default function Dashboard({ session, lang, setLang }) {
  const [profile, setProfile] = useState(null)
  const [lessons, setLessons] = useState([])
  const [progress, setProgress] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [allProgress, setAllProgress] = useState([])
  const [attendance, setAttendance] = useState([])
  const [liveLesson, setLiveLesson] = useState(null)
  const [page, setPage] = useState('home')
  const [hwOpen, setHwOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [langOpen, setLangOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileRef = useRef()
  const t = DT[lang] || DT.en

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { if (profile) { fetchLessons(profile.course || 'topik1'); fetchLiveLesson(profile.course || 'topik1') } }, [profile])
  useEffect(() => { if (page === 'marks') fetchMarksData() }, [page, lessons])

  async function fetchAll() {
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    if (data) { setProfile(data); setPhotoUrl(data.photo_url); if (data.language) setLang(data.language) }
    const { data: prog } = await supabase.from('progress').select('*').eq('student_id', session.user.id)
    setProgress(prog || [])
    setLoading(false)
  }

  async function fetchLessons(c) {
    const { data } = await supabase.from('lessons').select('*').eq('course', c).order('lesson_number')
    setLessons(data || [])
  }

  async function fetchLiveLesson(c) {
    const { data } = await supabase.from('live_lessons').select('*').eq('course', c).eq('is_active', true).order('created_at', { ascending: false }).limit(1)
    if (data && data.length > 0) setLiveLesson(data[0])
  }

  async function fetchMarksData() {
    const { data: students } = await supabase.from('profiles').select('id,full_name,photo_url,course').eq('course', profile?.course || 'topik1').eq('status', 'active')
    setAllStudents(students || [])
    const { data: prog } = await supabase.from('progress').select('*')
    setAllProgress(prog || [])
    const { data: att } = await supabase.from('attendance').select('*')
    setAttendance(att || [])
  }

  async function handlePhoto(e) {
    const file = e.target.files[0]; if (!file) return
    const ext = file.name.split('.').pop()
    const path = `${session.user.id}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!error) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      setPhotoUrl(urlData.publicUrl)
      await supabase.from('profiles').update({ photo_url: urlData.publicUrl }).eq('id', session.user.id)
    }
  }

  async function handleLangChange(key) {
    setLang(key); setLangOpen(false)
    await supabase.from('profiles').update({ language: key }).eq('id', session.user.id)
  }

  async function handleLogout() { await supabase.auth.signOut() }

  function copyLink(link) {
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  function getPct(lessonId, studentId) {
    const src = studentId ? allProgress : progress
    const sid = studentId || session.user.id
    const p = src.find(x => x.lesson_id === lessonId && x.student_id === sid)
    const lesson = lessons.find(l => l.id === lessonId)
    if (!lesson || !lesson.total_tasks) return 0
    return Math.round(((p?.tasks_done || 0) / lesson.total_tasks) * 100)
  }

  function isAbsent(studentId, lessonId) {
    return attendance.some(a => a.student_id === studentId && a.lesson_id === lessonId && !a.present)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #C0392B', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(192,57,43,0.4)}50%{box-shadow:0 0 0 6px rgba(192,57,43,0)}}@keyframes hwpulse{0%,100%{box-shadow:0 0 0 0 rgba(192,57,43,0.15)}50%{box-shadow:0 0 0 10px rgba(192,57,43,0)}}`}</style>
    </div>
  )

  if (profile?.status === 'pending') return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(192,57,43,0.4)}50%{box-shadow:0 0 0 8px rgba(192,57,43,0)}}`}</style>
      <div style={{ width: '44%', background: '#003478', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(192,57,43,0.3) 0%,transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{ position: 'relative', width: 100, height: 100, marginBottom: 24 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#C0392B', animation: 'spin 2s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderBottomColor: 'rgba(255,255,255,0.6)', animation: 'spin 1.5s linear infinite reverse' }} />
          <div style={{ position: 'absolute', inset: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⏳</div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: 8, position: 'relative', zIndex: 1 }}>{t.almostThere}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.7, position: 'relative', zIndex: 1, maxWidth: 180 }}>{t.reviewSub}</div>
      </div>
      <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2.5rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, right: 20 }}><LangBtn lang={lang} langOpen={langOpen} setLangOpen={setLangOpen} handleLangChange={handleLangChange} /></div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{t.pending}</div>
        <div style={{ fontSize: 13, color: '#6B6B6B', marginBottom: '2rem', lineHeight: 1.7, textAlign: 'center', maxWidth: 260 }}>{t.pendingMsg}</div>
        <div style={{ width: '100%', maxWidth: 280, marginBottom: '2rem' }}>
          <StepRow icon="✓" state="done" title={t.step1Title} sub={t.step1Sub} showLine />
          <StepRow icon="2" state="active" title={t.step2Title} sub={t.step2Sub} showLine />
          <StepRow icon="3" state="todo" title={t.step3Title} sub={t.step3Sub} showLine={false} />
        </div>
        <button onClick={handleLogout} style={{ padding: '9px 24px', fontSize: 13, fontWeight: 500, background: '#F2F2F0', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", color: '#1a1a1a' }}>{t.signOut}</button>
      </div>
    </div>
  )

  if (profile?.status === 'rejected') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: '2rem' }}>
        <div style={{ width: 64, height: 64, background: '#FDECEA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: 28 }}>✗</div>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: '0.75rem' }}>{t.rejected}</h2>
        <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.7, marginBottom: '1.5rem' }}>{t.rejectedMsg}</p>
        <button onClick={handleLogout} style={{ padding: '10px 24px', fontSize: 13, background: '#F2F2F0', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>{t.signOut}</button>
      </div>
    </div>
  )

  const firstName = profile?.full_name?.split(' ')[0] || 'Student'
  const initial = firstName[0]?.toUpperCase() || 'S'
  const courseName = profile?.course === 'topik1' ? 'TOPIK 1' : 'TOPIK 2'
  const completedCount = lessons.filter(l => getPct(l.id) === 100).length
  const lastLesson = lessons.find(l => getPct(l.id) < 100) || lessons[lessons.length - 1]
  const lastPct = lastLesson ? getPct(lastLesson.id) : 0

  const formatDate = (dt) => {
    if (!dt) return ''
    const d = new Date(dt)
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }
  const formatTime = (dt) => {
    if (!dt) return ''
    return new Date(dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' Tashkent'
  }

  const navItems = [
    { key: 'home', icon: 'ti-home', label: t.home },
    { key: 'marks', icon: 'ti-trophy', label: t.marks },
    { key: 'schedule', icon: 'ti-calendar', label: t.schedule },
    { key: 'profile', icon: 'ti-user', label: t.profile },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(192,57,43,0.4)}50%{box-shadow:0 0 0 6px rgba(192,57,43,0)}}@keyframes hwpulse{0%,100%{box-shadow:0 0 0 0 rgba(192,57,43,0.15)}50%{box-shadow:0 0 0 10px rgba(192,57,43,0)}}`}</style>

      {/* TOPBAR */}
      <div style={s.topbar}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#C0392B 45%,#003478 55%)' }} />
        <div style={s.topbarLeft}>
          <div style={{ position: 'relative', width: 40, height: 40 }}>
            <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '1.5px solid rgba(192,57,43,0.25)', animation: 'spin 8s linear infinite' }} />
            <Logo size={40} />
          </div>
          <div>
            <div style={s.brandName}>Aiman Korean</div>
            <div style={s.brandSub}>{courseName}</div>
          </div>
        </div>

        <div style={s.navCenter}>
          {navItems.map(n => (
            <button key={n.key} style={{ ...s.navPill, ...(page === n.key ? s.navPillActive : {}) }} onClick={() => setPage(n.key)}>
              <i className={`ti ${n.icon}`} aria-hidden="true" style={{ fontSize: 14 }} />
              {n.label}
            </button>
          ))}
        </div>

        <div style={s.topbarRight}>
          <button style={s.hwBtn} onClick={() => setHwOpen(true)}>
            <div style={s.hwBtnIcon}>📚</div>
            <div style={s.hwBtnLabel}>{t.hwModal}</div>
            <div style={s.hwCount}>{completedCount}</div>
          </button>
          {liveLesson && (
            <div style={s.liveChip}>
              <div style={s.liveDot} />
              <div style={s.liveText}>Live</div>
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <LangBtn lang={lang} langOpen={langOpen} setLangOpen={setLangOpen} handleLangChange={handleLangChange} />
          </div>
          <button onClick={() => setPage('profile')} style={s.profileBtn}>
            <Avatar url={photoUrl} initial={initial} size={32} radius={7} />
            <div>
              <div style={s.profileName}>{firstName}</div>
              <div style={s.profileCourse}>{courseName}</div>
            </div>
          </button>
        </div>
      </div>

      {/* HOME PAGE */}
      {page === 'home' && (
        <div style={s.main}>
          <div style={s.twoBoxes}>
            {/* LIVE BOX */}
            <div style={s.liveBox}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(192,57,43,0.2)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4d4d', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t.liveLesson}</div>
              </div>
              {liveLesson ? (
                <>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 14, position: 'relative', zIndex: 1, lineHeight: 1.3 }}>{liveLesson.title}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, position: 'relative', zIndex: 1 }}>
                    {true {liveLesson.scheduled_at && <>{liveLesson.scheduled_at && <> <>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 6 }}>📅 {liveLesson.scheduled_at ? formatDate(liveLesson.scheduled_at) : 'Date to be announced'}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 6 }}>🕕 {liveLesson.scheduled_at ? formatTime(liveLesson.scheduled_at) : 'Time to be announced'}</div>
                    </>}
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.08)', padding: '3px 8px', borderRadius: 5, display: 'inline-block' }}>{liveLesson.meet_link}</div>
                  </div>
                  <button onClick={() => copyLink(liveLesson.meet_link)} style={s.liveBoxBtn}>{copied ? t.copied : t.copyLink}</button>
                </>
              ) : (
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', position: 'relative', zIndex: 1, marginTop: 8 }}>{t.noLive}</div>
              )}
            </div>

            {/* HOMEWORK BOX */}
            <div style={s.hwBox} onClick={() => setHwOpen(true)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t.lastHw}</div>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#C0392B', color: 'white', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{completedCount}</div>
              </div>
              {lastLesson ? (
                <>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#6B6B6B', marginBottom: 4 }}>{t.lesson} {lastLesson.lesson_number}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 16, lineHeight: 1.3 }}>{lastLesson.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <svg width="80" height="80" viewBox="0 0 80 80" role="img"><title>Homework {lastPct}% complete</title>
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#F2F2F0" strokeWidth="7"/>
                      <circle cx="40" cy="40" r="32" fill="none" stroke={lastPct >= 80 ? '#27AE60' : lastPct >= 50 ? '#EF9F27' : '#E74C3C'} strokeWidth="7"
                        strokeDasharray={`${lastPct * 2.01} 201`} strokeDashoffset="0"
                        strokeLinecap="round" transform="rotate(-90 40 40)"/>
                      <text x="40" y="45" textAnchor="middle" fontSize="15" fontWeight="800" fill={lastPct >= 80 ? '#27500A' : lastPct >= 50 ? '#633806' : '#C0392B'} fontFamily="DM Sans,sans-serif">{lastPct}%</text>
                    </svg>
                    <div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: lastPct >= 80 ? '#27500A' : lastPct >= 50 ? '#633806' : '#C0392B', lineHeight: 1 }}>{lastPct}%</div>
                      <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>{t.completed}</div>
                      <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>
                        {progress.find(p => p.lesson_id === lastLesson.id)?.tasks_done || 0} {t.of} {lastLesson.total_tasks} {t.tasks}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 16 }}>{t.noLesson}</div>
              )}
              <button style={{ width: '100%', padding: 9, background: '#FDECEA', color: '#C0392B', border: 'none', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", marginTop: 'auto' }}>{t.viewAll}</button>
            </div>
          </div>
        </div>
      )}

      {/* MARKS PAGE */}
      {page === 'marks' && (
        <div style={s.main}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{t.classMarks}</div>
            <span style={s.badge}>{courseName}</span>
          </div>
          <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                <thead>
                  <tr style={{ background: '#FAFAF8' }}>
                    <th style={{ ...s.th, textAlign: 'left', paddingLeft: 14, minWidth: 160 }}>{t.students}</th>
                    {lessons.map(l => (
                      <th key={l.id} style={s.th}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#1a1a1a' }}>L {l.lesson_number}</div>
                          <div style={{ fontSize: 9, color: '#6B6B6B' }}>{l.title.slice(0, 8)}..</div>
                        </div>
                      </th>
                    ))}
                    <th style={s.th}>{t.avg}</th>
                  </tr>
                </thead>
                <tbody>
                  {allStudents.map((student, idx) => {
                    const scores = lessons.map(l => getPct(l.id, student.id))
                    const validScores = scores.filter(s => s > 0)
                    const avg = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0
                    const isMe = student.id === session.user.id
                    return (
                      <tr key={student.id} style={{ background: isMe ? '#FFFBF0' : 'transparent' }}>
                        <td style={{ padding: '8px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 10, color: '#6B6B6B', fontWeight: 700, minWidth: 14 }}>{idx + 1}</span>
                            <Avatar url={student.photo_url} initial={student.full_name?.[0]?.toUpperCase() || '?'} size={28} radius={6} />
                            <span style={{ fontSize: 12, fontWeight: isMe ? 700 : 500, color: isMe ? '#C0392B' : '#1a1a1a' }}>
                              {student.full_name?.split(' ')[0]} {student.full_name?.split(' ')[1]?.[0]}.{isMe ? ` (${t.you})` : ''}
                            </span>
                          </div>
                        </td>
                        {lessons.map(l => {
                          const pct = getPct(l.id, student.id)
                          const absent = isAbsent(student.id, l.id)
                          const color = pct >= 80 ? '#27AE60' : pct > 0 ? '#E74C3C' : '#D3D1C7'
                          const textColor = pct > 0 ? 'white' : '#888'
                          return (
                            <td key={l.id} style={{ padding: '8px 6px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: textColor, margin: '0 auto', boxShadow: absent ? '0 0 0 2.5px #E74C3C,0 0 0 4.5px rgba(231,76,60,0.15)' : 'none' }}>
                                {pct > 0 ? pct : '—'}
                              </div>
                            </td>
                          )
                        })}
                        <td style={{ padding: '8px 6px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', textAlign: 'center', fontSize: 12, fontWeight: 700, color: avg >= 80 ? '#27500A' : avg >= 50 ? '#633806' : avg > 0 ? '#E74C3C' : '#6B6B6B' }}>
                          {avg > 0 ? `${avg}%` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE PAGE */}
      {page === 'schedule' && (
        <div style={s.main}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{t.schedule}</div>
            <span style={s.badge}>{courseName}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lessons.length === 0 && <div style={{ fontSize: 14, color: '#6B6B6B', textAlign: 'center', padding: '2rem' }}>{t.noLessons}</div>}
            {Array.from({ length: Math.max(lessons.length, 0) }, (_, i) => {
              const lesson = lessons[i]
              if (!lesson) return null
              const pct = getPct(lesson.id)
              const isDone = pct === 100
              const isCurrent = !isDone && lessons.slice(0, i).every(l => getPct(l.id) === 100)
              const isLocked = !isDone && !isCurrent
              return (
                <div key={lesson.id} style={{ background: isCurrent ? '#FDECEA' : '#fff', borderRadius: 12, padding: '14px 16px', border: isCurrent ? '1px solid rgba(192,57,43,0.2)' : '0.5px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 14, opacity: isLocked ? 0.5 : 1 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: isDone ? '#EAF3DE' : isCurrent ? '#F7C1C1' : '#F2F2F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {isDone ? '✅' : isCurrent ? '⏳' : '🔒'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isCurrent ? '#C0392B' : '#1a1a1a' }}>{t.lesson} {lesson.lesson_number} — {lesson.title}</div>
                    <div style={{ fontSize: 11, color: isCurrent ? 'rgba(192,57,43,0.7)' : '#6B6B6B', marginTop: 2 }}>{isCurrent ? t.current : isDone ? t.done : t.locked}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isDone ? '#27500A' : isCurrent ? '#C0392B' : '#6B6B6B' }}>{pct > 0 ? `${pct}%` : '—'}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* PROFILE PAGE */}
      {page === 'profile' && (
        <div style={s.main}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '1rem 0' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current.click()}>
              <Avatar url={photoUrl} initial={initial} size={80} radius={16} />
              <div style={{ position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: '50%', background: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '2px solid white' }}>✏️</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{profile?.full_name}</div>
              <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>{courseName} · Active</div>
            </div>
            <div style={{ width: '100%', background: '#fff', borderRadius: 14, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              {[[t.email, session.user.email], [t.phone, profile?.phone || '—'], [t.course, courseName], [t.language, LANGS[lang]?.flag + ' ' + LANGS[lang]?.name]].map(([label, val], i, arr) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < arr.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
                  <span style={{ fontSize: 12, color: '#6B6B6B' }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{val}</span>
                </div>
              ))}
            </div>
            <button onClick={handleLogout} style={{ width: '100%', padding: 10, background: '#FDECEA', color: '#C0392B', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>{t.signOut}</button>
          </div>
        </div>
      )}

      {/* HOMEWORK MODAL */}
      {hwOpen && (
        <div style={s.overlay} onClick={() => setHwOpen(false)}>
          <div style={{ ...s.modal, maxHeight: '80vh', overflowY: 'auto', width: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{t.hwModal}</h3>
              <span style={s.badge}>{courseName}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 15 }, (_, i) => {
                const lesson = lessons[i]
                const isLocked = !lesson
                const pct = lesson ? getPct(lesson.id) : 0
                const state = pct === 100 ? 'done' : pct > 0 ? 'partial' : 'pending'
                const colors = { done: { bg: '#EAF3DE', color: '#27500A' }, partial: { bg: '#FAEEDA', color: '#633806' }, pending: { bg: '#F2F2F0', color: '#6B6B6B' } }
                const c = colors[state]
                return (
                  <div key={i} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 11, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 11, opacity: isLocked ? 0.4 : 1 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{lesson ? lesson.title : `${t.lesson} ${i + 1}`}</div>
                      <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 1 }}>{isLocked ? '🔒' : `${progress.find(p => p.lesson_id === lesson?.id)?.tasks_done || 0} ${t.of} ${lesson?.total_tasks} ${t.tasks}`}</div>
                    </div>
                    {!isLocked && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 56, height: 4, background: '#F2F2F0', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: state === 'done' ? '#27AE60' : state === 'partial' ? '#EF9F27' : '#D3D1C7', borderRadius: 2 }} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: c.color, minWidth: 28, textAlign: 'right' }}>{pct}%</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <button style={{ width: '100%', padding: 10, fontSize: 13, fontFamily: "'DM Sans',sans-serif", border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, background: 'none', cursor: 'pointer', color: '#1a1a1a', marginTop: 12 }} onClick={() => setHwOpen(false)}>{t.close}</button>
          </div>
        </div>
      )}
    </div>
  )
}

function LangBtn({ lang, langOpen, setLangOpen, handleLangChange }) {
  const t = LANGS[lang]
  return (
    <>
      <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F2F2F0', borderRadius: 8, padding: '5px 9px', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 500, color: '#1a1a1a' }} onClick={() => setLangOpen(!langOpen)}>
        <span>{t.flag}</span><span>{t.name}</span><span style={{ fontSize: 9, color: '#6B6B6B' }}>▾</span>
      </button>
      {langOpen && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: 140, zIndex: 100 }}>
          {Object.entries(LANGS).map(([key, l]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', padding: '9px 14px', fontSize: 13, cursor: 'pointer', color: key === lang ? '#C0392B' : '#1a1a1a', fontWeight: key === lang ? 500 : 400, background: key === lang ? '#FDECEA' : 'transparent' }} onClick={() => handleLangChange(key)}>
              {l.flag}&nbsp;&nbsp;{l.name}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function StepRow({ icon, state, title, sub, showLine }) {
  const colors = { done: { bg: '#EAF3DE', color: '#27500A' }, active: { bg: '#C0392B', color: 'white' }, todo: { bg: '#F2F2F0', color: '#6B6B6B' } }
  const c = colors[state]
  return (
    <div style={{ display: 'flex', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, animation: state === 'active' ? 'pulse 1.5s infinite' : 'none' }}>{icon}</div>
        {showLine && <div style={{ width: 2, height: 20, background: state === 'done' ? '#639922' : '#F2F2F0', margin: '4px 0' }} />}
      </div>
      <div style={{ paddingTop: 6, paddingBottom: showLine ? 0 : 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 11, color: '#6B6B6B', marginBottom: showLine ? 16 : 0 }}>{sub}</div>
      </div>
    </div>
  )
}

function Avatar({ url, initial, size, radius = 8 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: '#FDECEA', border: '2px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color: '#C0392B', overflow: 'hidden', flexShrink: 0 }}>
      {url ? <img src={url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
    </div>
  )
}

const s = {
  topbar: { height: 66, background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 100 },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  brandName: { fontSize: 15, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em' },
  brandSub: { fontSize: 10, color: '#C0392B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 1 },
  navCenter: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2 },
  navPill: { display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, color: '#6B6B6B', border: 'none', background: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
  navPillActive: { background: '#FDECEA', color: '#C0392B' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 7 },
  hwBtn: { display: 'flex', alignItems: 'center', background: '#C0392B', border: 'none', borderRadius: 10, padding: 0, cursor: 'pointer', overflow: 'hidden', animation: 'hwpulse 2.5s infinite' },
  hwBtnIcon: { width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, background: 'rgba(0,0,0,0.15)' },
  hwBtnLabel: { padding: '0 10px', fontSize: 11, fontWeight: 700, color: 'white', fontFamily: "'DM Sans',sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' },
  hwCount: { width: 20, height: 20, borderRadius: '50%', background: 'white', color: '#C0392B', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  liveChip: { display: 'flex', alignItems: 'center', gap: 5, background: '#E8EEF8', border: '1px solid rgba(0,52,120,0.15)', borderRadius: 10, padding: '5px 10px' },
  liveDot: { width: 7, height: 7, borderRadius: '50%', background: '#C0392B', animation: 'pulse 1.5s infinite' },
  liveText: { fontSize: 11, fontWeight: 700, color: '#003478', textTransform: 'uppercase', letterSpacing: '0.06em' },
  profileBtn: { display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '4px 8px 4px 4px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
  profileName: { fontSize: 11, fontWeight: 600, color: '#1a1a1a' },
  profileCourse: { fontSize: 9, color: '#6B6B6B', marginTop: 1 },
  main: { padding: '1.5rem', maxWidth: 900, margin: '0 auto', width: '100%' },
  twoBoxes: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  liveBox: { background: 'linear-gradient(135deg,#003478,#00449F)', borderRadius: 16, padding: 22, cursor: 'pointer', position: 'relative', overflow: 'hidden', minHeight: 260 },
  liveBoxBtn: { padding: '8px 18px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", position: 'relative', zIndex: 1 },
  hwBox: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: 22, cursor: 'pointer', animation: 'hwpulse 3s infinite', display: 'flex', flexDirection: 'column', minHeight: 260 },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: '#E8EEF8', color: '#003478', textTransform: 'uppercase', letterSpacing: '0.04em' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.28)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: 20, padding: '1.75rem', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' },
  th: { padding: '9px 8px', fontSize: 9, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(0,0,0,0.08)', textAlign: 'center', background: '#FAFAF8', whiteSpace: 'nowrap' },
}