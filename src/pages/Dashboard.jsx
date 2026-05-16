import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'

const Logo = () => (
  <svg viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" style={{ width: 34, height: 34 }}>
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

export default function Dashboard({ session }) {
  const [profile, setProfile] = useState(null)
  const [lessons, setLessons] = useState([])
  const [progress, setProgress] = useState([])
  const [course, setCourse] = useState('topik1')
  const [profileOpen, setProfileOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    fetchProfile()
    fetchLessons('topik1')
    fetchProgress()
  }, [])

  useEffect(() => {
    fetchLessons(course)
  }, [course])

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    if (data) {
      setProfile(data)
      setPhotoUrl(data.photo_url)
      setCourse(data.course || 'topik1')
    }
  }

  async function fetchLessons(c) {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('course', c)
      .order('lesson_number')
    setLessons(data || [])
  }

  async function fetchProgress() {
    const { data } = await supabase
      .from('progress')
      .select('*')
      .eq('student_id', session.user.id)
    setProgress(data || [])
  }

  async function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    const ext = file.name.split('.').pop()
    const path = `${session.user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = urlData.publicUrl
      setPhotoUrl(url)
      await supabase.from('profiles').update({ photo_url: url }).eq('id', session.user.id)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  function getProgress(lessonId) {
    const p = progress.find(p => p.lesson_id === lessonId)
    return p ? p.tasks_done : 0
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Student'
  const initial = firstName[0]?.toUpperCase() || 'S'
  const courseName = course === 'topik1' ? 'TOPIK 1' : 'TOPIK 2'
  const completedCount = lessons.filter(l => getProgress(l.id) >= l.total_tasks && l.total_tasks > 0).length

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', sans-serif" }}>

      {/* TOPBAR */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <Logo />
          <span style={s.topbarName}>Aiman Korean</span>
        </div>
        <div style={s.topbarRight}>
          <select value={course} onChange={e => setCourse(e.target.value)} style={s.courseSelect}>
            <option value="topik1">TOPIK 1</option>
            <option value="topik2">TOPIK 2</option>
          </select>
          <button onClick={() => setProfileOpen(true)} style={s.profileBtn}>
            <Avatar url={photoUrl} initial={initial} size={36} />
            <div style={{ textAlign: 'left' }}>
              <div style={s.profileName}>{firstName}</div>
              <div style={s.profileRole}>{courseName}</div>
            </div>
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={s.main}>
        <div style={s.sectionHeader}>
          <div style={s.sectionTitle}>My Homework</div>
          <span style={s.badge}>{courseName}</span>
        </div>

        {lessons.length === 0 ? (
          <div style={s.empty}>No lessons available yet. Aiman will add them soon!</div>
        ) : (
          <div style={s.hwGrid}>
            {lessons.map((lesson, i) => {
              const done = getProgress(lesson.id)
              const total = lesson.total_tasks
              const pct = total > 0 ? Math.round((done / total) * 100) : 0
              const state = pct === 100 ? 'done' : pct > 0 ? 'partial' : 'pending'
              const colors = { done: { num: '#27500A', bg: '#EAF3DE', bar: '#639922', pct: '#27500A' }, partial: { num: '#633806', bg: '#FAEEDA', bar: '#EF9F27', pct: '#633806' }, pending: { num: '#6B6B6B', bg: '#F2F2F0', bar: '#D3D1C7', pct: '#6B6B6B' } }
              const c = colors[state]
              return (
                <div key={lesson.id} style={s.hwCard}>
                  <div style={{ ...s.hwNum, background: c.bg, color: c.num }}>{lesson.lesson_number}</div>
                  <div style={s.hwInfo}>
                    <div style={s.hwTitle}>Lesson {lesson.lesson_number} — {lesson.title}</div>
                    <div style={s.hwMeta}>{done} of {total} tasks completed</div>
                  </div>
                  <div style={s.hwRight}>
                    <div style={s.progressBar}>
                      <div style={{ height: '100%', width: `${pct}%`, background: c.bar, borderRadius: 3 }} />
                    </div>
                    <div style={{ ...s.pct, color: c.pct }}>{pct}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* PROFILE MODAL */}
      {profileOpen && (
        <div style={s.overlay} onClick={() => setProfileOpen(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>My Profile</h3>
            <div style={s.photoUpload}>
              <div style={s.photoCircle} onClick={() => fileRef.current.click()}>
                <Avatar url={photoUrl} initial={initial} size={76} />
                <div style={s.photoOverlay}>✏️</div>
              </div>
              <div style={s.photoHint}>Tap to change photo</div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
            </div>
            <div style={s.infoBlock}>
              <InfoRow label="Full name" value={profile?.full_name || '—'} />
              <InfoRow label="Phone" value={profile?.phone || '—'} />
              <InfoRow label="Email" value={session.user.email} />
              <InfoRow label="Course" value={courseName} />
              <InfoRow label="Completed" value={`${completedCount} of ${lessons.length} lessons`} />
            </div>
            <div style={s.modalBtns}>
              <button style={s.btnSec} onClick={() => setProfileOpen(false)}>Close</button>
              <button style={s.btnDanger} onClick={handleLogout}>Sign out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Avatar({ url, initial, size }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#FDECEA', border: '2px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 600, color: '#C0392B', overflow: 'hidden', flexShrink: 0 }}>
      {url ? <img src={url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
      <span style={{ fontSize: 12, color: '#6B6B6B' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}

const s = {
  topbar: { height: 64, background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 100 },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  topbarName: { fontSize: 18, fontWeight: 600, color: '#1a1a1a' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 10 },
  courseSelect: { fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', background: '#FAFAF8', fontFamily: "'DM Sans', sans-serif", color: '#1a1a1a', cursor: 'pointer' },
  profileBtn: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'none', border: 'none', padding: '4px 8px 4px 4px', borderRadius: 40, fontFamily: "'DM Sans', sans-serif' " },
  profileName: { fontSize: 13, fontWeight: 500, color: '#1a1a1a' },
  profileRole: { fontSize: 11, color: '#6B6B6B' },
  main: { flex: 1, padding: '2rem 1.5rem', maxWidth: 860, margin: '0 auto', width: '100%' },
  sectionHeader: { display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: '1.5rem' },
  sectionTitle: { fontSize: 28, fontWeight: 600, color: '#1a1a1a' },
  badge: { fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500, background: '#E8EEF8', color: '#003478', letterSpacing: '0.04em' },
  hwGrid: { display: 'flex', flexDirection: 'column', gap: 10 },
  hwCard: { background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' },
  hwNum: { width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600 },
  hwInfo: { flex: 1 },
  hwTitle: { fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 3 },
  hwMeta: { fontSize: 12, color: '#6B6B6B' },
  hwRight: { display: 'flex', alignItems: 'center', gap: 10 },
  progressBar: { width: 72, height: 5, background: '#F2F2F0', borderRadius: 3, overflow: 'hidden' },
  pct: { fontSize: 12, fontWeight: 500, minWidth: 32, textAlign: 'right' },
  empty: { fontSize: 14, color: '#6B6B6B', textAlign: 'center', padding: '3rem 0' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.28)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: 20, padding: '1.75rem', width: 340, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' },
  modalTitle: { fontSize: 20, fontWeight: 600, marginBottom: '1.25rem', color: '#1a1a1a' },
  photoUpload: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: '1.25rem' },
  photoCircle: { position: 'relative', cursor: 'pointer', borderRadius: '50%', overflow: 'hidden' },
  photoOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', borderRadius: '50%', fontSize: 18 },
  photoHint: { fontSize: 12, color: '#6B6B6B' },
  infoBlock: { background: '#FAFAF8', borderRadius: 12, padding: '12px 14px', marginBottom: '1.25rem' },
  modalBtns: { display: 'flex', gap: 8 },
  btnSec: { flex: 1, padding: 10, fontSize: 13, fontFamily: "'DM Sans', sans-serif", border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, background: 'none', cursor: 'pointer', color: '#1a1a1a' },
  btnDanger: { flex: 1, padding: 10, fontSize: 13, fontFamily: "'DM Sans', sans-serif", border: 'none', borderRadius: 10, background: '#FDECEA', color: '#922B21', cursor: 'pointer', fontWeight: 500 }
}