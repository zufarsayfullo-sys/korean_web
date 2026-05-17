import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const Logo = () => (
  <svg viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" style={{ width: 38, height: 38 }}>
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

export default function Admin({ session }) {
  const [section, setSection] = useState('students')
  const [pending, setPending] = useState([])
  const [active, setActive] = useState([])
  const [lessons, setLessons] = useState([])
  const [liveLesson, setLiveLesson] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [allProgress, setAllProgress] = useState([])
  const [courseFilter, setCourseFilter] = useState('topik1')
  const [attLesson, setAttLesson] = useState('')
  const [attData, setAttData] = useState({})
  const [loading, setLoading] = useState(true)

  // Live lesson form
  const [liveTitle, setLiveTitle] = useState('')
  const [liveCourse, setLiveCourse] = useState('topik1')
  const [liveLink, setLiveLink] = useState('')
  const [liveDate, setLiveDate] = useState('')
  const [liveActive, setLiveActive] = useState(true)

  // New lesson form
  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [newLessonCourse, setNewLessonCourse] = useState('topik1')
  const [newLessonTasks, setNewLessonTasks] = useState('')
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [editLesson, setEditLesson] = useState(null)

  // Accept course selection per pending student
  const [pendingCourses, setPendingCourses] = useState({})

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { if (section === 'lessons') fetchLessons() }, [section])
  useEffect(() => { if (section === 'marks') fetchProgress() }, [section])
  useEffect(() => { if (section === 'attendance' && attLesson) fetchAttendance(attLesson) }, [attLesson])

  async function fetchAll() {
    const { data: allProfiles } = await supabase.rpc('get_all_profiles')
    const allP = allProfiles || []
    const pend = allP.filter(p => p.status === 'pending')
    setPending(pend)
    const act = allP.filter(p => p.status === 'active')
    setActive(act)
    await fetchLessons()
    await fetchLiveLesson()
    setLoading(false)
  }

  async function fetchLessons() {
    const { data } = await supabase.from('lessons').select('*').order('lesson_number')
    setLessons(data || [])
  }

  async function fetchLiveLesson() {
    const { data } = await supabase.from('live_lessons').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(1)
    if (data && data.length > 0) {
      const l = data[0]
      setLiveLesson(l)
      setLiveTitle(l.title)
      setLiveCourse(l.course)
      setLiveLink(l.meet_link)
      setLiveDate(l.scheduled_at ? l.scheduled_at.slice(0, 16) : '')
      setLiveActive(l.is_active)
    }
  }

  async function fetchProgress() {
    const { data } = await supabase.from('progress').select('*')
    setAllProgress(data || [])
  }

  async function fetchAttendance(lessonId) {
    const { data } = await supabase.from('attendance').select('*').eq('lesson_id', lessonId)
    const map = {}
    active.forEach(s => { map[s.id] = true })
    ;(data || []).forEach(a => { map[a.student_id] = a.present })
    setAttData(map)
  }

  async function acceptStudent(studentId) {
    const course = pendingCourses[studentId] || 'topik1'
    await supabase.rpc('update_student_status', { student_id: studentId, new_status: 'active', new_course: course })
    fetchAll()
  }

  async function rejectStudent(studentId) {
    await supabase.rpc('update_student_status', { student_id: studentId, new_status: 'rejected', new_course: 'topik1' })
    fetchAll()
  }

  async function kickStudent(studentId) {
    if (!window.confirm('Remove this student?')) return
    await supabase.rpc('update_student_status', { student_id: studentId, new_status: 'rejected', new_course: 'topik1' })
    fetchAll()
  }

  async function changeCourse(studentId, course) {
    await supabase.rpc('update_student_status', { student_id: studentId, new_status: 'active', new_course: course })
    fetchAll()
  }

  async function addLesson() {
    if (!newLessonTitle.trim() || !newLessonTasks) return
    const lessonCount = lessons.filter(l => l.course === newLessonCourse).length
    await supabase.from('lessons').insert({ course: newLessonCourse, lesson_number: lessonCount + 1, title: newLessonTitle.trim(), total_tasks: parseInt(newLessonTasks) })
    setNewLessonTitle(''); setNewLessonTasks(''); setShowAddLesson(false)
    fetchLessons()
  }

  async function deleteLesson(id) {
    if (!window.confirm('Delete this lesson?')) return
    await supabase.from('lessons').delete().eq('id', id)
    fetchLessons()
  }

  async function saveEditLesson() {
    if (!editLesson) return
    await supabase.from('lessons').update({ title: editLesson.title, total_tasks: editLesson.total_tasks }).eq('id', editLesson.id)
    setEditLesson(null)
    fetchLessons()
  }

  async function saveLiveLesson() {
    if (!liveTitle.trim() || !liveLink.trim()) return
    await supabase.from('live_lessons').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('live_lessons').insert({ course: liveCourse, title: liveTitle, meet_link: liveLink, scheduled_at: liveDate || null, is_active: liveActive })
    fetchLiveLesson()
    alert('Live lesson saved!')
  }

  async function saveAttendance() {
    if (!attLesson) return
    const upserts = Object.entries(attData).map(([student_id, present]) => ({ student_id, lesson_id: attLesson, present }))
    await supabase.from('attendance').upsert(upserts, { onConflict: 'student_id,lesson_id' })
    alert('Attendance saved!')
  }

  async function handleLogout() { await supabase.auth.signOut() }

  function getPct(lessonId, studentId) {
    const p = allProgress.find(x => x.lesson_id === lessonId && x.student_id === studentId)
    const lesson = lessons.find(l => l.id === lessonId)
    if (!lesson || !lesson.total_tasks) return 0
    return Math.round(((p?.tasks_done || 0) / lesson.total_tasks) * 100)
  }

  function isAbsent(studentId, lessonId) {
    const a = attendance.find(x => x.student_id === studentId && x.lesson_id === lessonId)
    return a ? !a.present : false
  }

  const topik1 = active.filter(s => s.course === 'topik1')
  const topik2 = active.filter(s => s.course === 'topik2')
  const filteredLessons = lessons.filter(l => l.course === courseFilter)
  const marksStudents = active.filter(s => s.course === courseFilter)
  const marksLessons = lessons.filter(l => l.course === courseFilter)

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #C0392B', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#ECECEA', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.4)}50%{box-shadow:0 0 0 6px rgba(74,222,128,0)}}`}</style>

      {/* TOPBAR */}
      <div style={s.topbar}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#C0392B 45%,#003478 55%)' }} />
        <div style={s.topbarLeft}>
          <div style={{ position: 'relative', width: 38, height: 38 }}>
            <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '1.5px solid rgba(192,57,43,0.25)', animation: 'spin 8s linear infinite' }} />
            <Logo />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={s.brandName}>Aiman Korean</div>
              <div style={s.adminBadge}>Admin</div>
            </div>
            <div style={s.brandSub}>Teacher Panel</div>
          </div>
        </div>
        <div style={s.topbarRight}>
          <div style={s.profileBtn}>
            <div style={s.avatar}>A</div>
            <div>
              <div style={s.profileName}>Aiman</div>
              <div style={s.profileRole}>Teacher</div>
            </div>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Sign out</button>
        </div>
      </div>

      {/* LAYOUT */}
      <div style={s.layout}>
        {/* SIDEBAR */}
        <div style={s.sidebar}>
          <div style={s.sideSection}>Overview</div>
          {[
            { key: 'students', icon: 'ti-users', label: 'Students', badge: pending.length },
            { key: 'lessons', icon: 'ti-book-2', label: 'Lessons' },
          ].map(item => (
            <div key={item.key} style={{ ...s.sideItem, ...(section === item.key ? s.sideItemActive : {}) }} onClick={() => setSection(item.key)}>
              <i className={`ti ${item.icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
              {item.label}
              {item.badge > 0 && <div style={s.sideBadge}>{item.badge}</div>}
            </div>
          ))}
          <div style={s.sideSection}>Live</div>
          {[
            { key: 'live', icon: 'ti-video', label: 'Live Lesson' },
            { key: 'attendance', icon: 'ti-calendar-check', label: 'Attendance' },
          ].map(item => (
            <div key={item.key} style={{ ...s.sideItem, ...(section === item.key ? s.sideItemActive : {}) }} onClick={() => setSection(item.key)}>
              <i className={`ti ${item.icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
              {item.label}
            </div>
          ))}
          <div style={s.sideSection}>Reports</div>
          <div style={{ ...s.sideItem, ...(section === 'marks' ? s.sideItemActive : {}) }} onClick={() => setSection('marks')}>
            <i className="ti ti-trophy" style={{ fontSize: 16 }} aria-hidden="true" />
            Marks
          </div>
        </div>

        {/* MAIN */}
        <div style={s.main}>

          {/* STUDENTS */}
          {section === 'students' && (
            <div>
              {/* Stats */}
              <div style={s.statsRow}>
                <StatCard icon="⏳" bg="#FAEEDA" num={pending.length} label="Pending" color="#633806" />
                <StatCard icon="✅" bg="#EAF3DE" num={active.length} label="Active" color="#27500A" />
                <StatCard icon="📚" bg="#E8EEF8" num={topik1.length} label="TOPIK 1" color="#003478" />
                <StatCard icon="🎓" bg="#FDECEA" num={topik2.length} label="TOPIK 2" color="#C0392B" />
              </div>

              {/* Pending */}
              {pending.length > 0 && (
                <>
                  <div style={s.secHeader}>
                    <div style={s.secTitle}>Pending Approval</div>
                    <span style={{ ...s.badge, background: '#FAEEDA', color: '#633806' }}>{pending.length} waiting</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.5rem' }}>
                    {pending.map(student => (
                      <div key={student.id} style={s.pendingCard}>
                        <div style={s.pendingAvatar}>{student.full_name?.[0]?.toUpperCase() || '?'}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{student.full_name}</div>
                          <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>{student.phone} · Signed up {new Date(student.created_at).toLocaleDateString()}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <select value={pendingCourses[student.id] || 'topik1'} onChange={e => setPendingCourses({ ...pendingCourses, [student.id]: e.target.value })} style={s.courseSelect}>
                            <option value="topik1">TOPIK 1</option>
                            <option value="topik2">TOPIK 2</option>
                          </select>
                          <button onClick={() => acceptStudent(student.id)} style={s.acceptBtn}>✓ Accept</button>
                          <button onClick={() => rejectStudent(student.id)} style={s.rejectBtn}>✗ Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Active students */}
              <div style={s.secHeader}><div style={s.secTitle}>Active Students</div></div>
              <div style={s.tableCard}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#FAFAF8' }}>
                      {['Student', 'Phone', 'Course', 'Actions'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {active.map(student => (
                      <tr key={student.id} style={{ cursor: 'default' }}>
                        <td style={s.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 7, background: '#E8EEF8', color: '#003478', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{student.full_name?.[0]?.toUpperCase()}</div>
                            {student.full_name}
                          </div>
                        </td>
                        <td style={s.td}>{student.phone}</td>
                        <td style={s.td}>
                          <select value={student.course} onChange={e => changeCourse(student.id, e.target.value)} style={s.courseSelect}>
                            <option value="topik1">TOPIK 1</option>
                            <option value="topik2">TOPIK 2</option>
                          </select>
                        </td>
                        <td style={s.td}><button onClick={() => kickStudent(student.id)} style={s.kickBtn}>Kick</button></td>
                      </tr>
                    ))}
                    {active.length === 0 && <tr><td colSpan={4} style={{ ...s.td, textAlign: 'center', color: '#6B6B6B' }}>No active students yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LESSONS */}
          {section === 'lessons' && (
            <div>
              <div style={s.secHeader}>
                <div style={s.secTitle}>Lessons</div>
                <button onClick={() => setShowAddLesson(!showAddLesson)} style={s.addBtn}>+ Add Lesson</button>
              </div>

              {showAddLesson && (
                <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '0.5px solid rgba(0,0,0,0.08)', marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 100px auto', gap: 10, alignItems: 'end' }}>
                  <div>
                    <label style={s.fieldLabel}>Course</label>
                    <select value={newLessonCourse} onChange={e => setNewLessonCourse(e.target.value)} style={s.fieldInput}>
                      <option value="topik1">TOPIK 1</option>
                      <option value="topik2">TOPIK 2</option>
                    </select>
                  </div>
                  <div>
                    <label style={s.fieldLabel}>Title</label>
                    <input value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)} placeholder="Lesson title" style={s.fieldInput} />
                  </div>
                  <div>
                    <label style={s.fieldLabel}>Tasks</label>
                    <input type="number" value={newLessonTasks} onChange={e => setNewLessonTasks(e.target.value)} placeholder="5" style={s.fieldInput} />
                  </div>
                  <button onClick={addLesson} style={{ ...s.addBtn, height: 38 }}>Save</button>
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {['topik1', 'topik2'].map(c => (
                  <button key={c} onClick={() => setCourseFilter(c)} style={{ padding: '5px 14px', background: courseFilter === c ? '#FDECEA' : '#F2F2F0', color: courseFilter === c ? '#C0392B' : '#6B6B6B', border: 'none', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                    {c === 'topik1' ? 'TOPIK 1' : 'TOPIK 2'}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredLessons.map(lesson => (
                  <div key={lesson.id} style={s.lessonCard}>
                    {editLesson?.id === lesson.id ? (
                      <>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: '#E8EEF8', color: '#003478', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{lesson.lesson_number}</div>
                        <input value={editLesson.title} onChange={e => setEditLesson({ ...editLesson, title: e.target.value })} style={{ ...s.fieldInput, flex: 1 }} />
                        <input type="number" value={editLesson.total_tasks} onChange={e => setEditLesson({ ...editLesson, total_tasks: e.target.value })} style={{ ...s.fieldInput, width: 80 }} />
                        <button onClick={saveEditLesson} style={s.editBtn}>Save</button>
                        <button onClick={() => setEditLesson(null)} style={s.deleteBtn}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: '#E8EEF8', color: '#003478', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{lesson.lesson_number}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{lesson.title}</div>
                          <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>{lesson.total_tasks} tasks · {lesson.course === 'topik1' ? 'TOPIK 1' : 'TOPIK 2'}</div>
                        </div>
                        <button onClick={() => setEditLesson(lesson)} style={s.editBtn}>Edit</button>
                        <button onClick={() => deleteLesson(lesson.id)} style={s.deleteBtn}>Delete</button>
                      </>
                    )}
                  </div>
                ))}
                {filteredLessons.length === 0 && <div style={{ fontSize: 14, color: '#6B6B6B', textAlign: 'center', padding: '2rem' }}>No lessons yet. Click "+ Add Lesson" to create one.</div>}
              </div>
            </div>
          )}

          {/* LIVE LESSON */}
          {section === 'live' && (
            <div>
              <div style={s.secHeader}><div style={s.secTitle}>Live Lesson</div></div>
              <div style={s.liveCard}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', animation: 'pulse 1.5s infinite' }} />
                  Set up live lesson
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={s.liveLabelStyle}>Course</label>
                    <select value={liveCourse} onChange={e => setLiveCourse(e.target.value)} style={{...s.liveInput, backgroundColor: 'rgba(255,255,255,0.15)', color: 'white'}}>
                      <option value="topik1">TOPIK 1</option>
                      <option value="topik2">TOPIK 2</option>
                    </select>
                  </div>
                  <div>
                    <label style={s.liveLabelStyle}>Lesson Title</label>
                    <input value={liveTitle} onChange={e => setLiveTitle(e.target.value)} placeholder="e.g. Grammar Review" style={{...s.liveInput, backgroundColor: 'rgba(255,255,255,0.15)', color: 'white'}} />
                  </div>
                  <div>
                    <label style={s.liveLabelStyle}>Date & Time</label>
                    <input type="datetime-local" value={liveDate} onChange={e => setLiveDate(e.target.value)} style={{...s.liveInput, backgroundColor: 'rgba(255,255,255,0.15)', color: 'white'}} />
                  </div>
                  <div>
                    <label style={s.liveLabelStyle}>Status</label>
                    <select value={liveActive ? 'active' : 'inactive'} onChange={e => setLiveActive(e.target.value === 'active')} style={{...s.liveInput, backgroundColor: 'rgba(255,255,255,0.15)', color: 'white'}}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={s.liveLabelStyle}>Google Meet / Zoom Link</label>
                    <input value={liveLink} onChange={e => setLiveLink(e.target.value)} placeholder="https://meet.google.com/abc-defg-hij" style={{...s.liveInput, backgroundColor: 'rgba(255,255,255,0.15)', color: 'white'}} />
                  </div>
                </div>
                <button onClick={saveLiveLesson} style={s.liveSaveBtn}>Save & Activate →</button>
                {liveLesson && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'pulse 1.5s infinite' }} />
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Currently active: {liveLesson.title} {liveLesson.scheduled_at ? '· ' + new Date(liveLesson.scheduled_at).toLocaleDateString() : ''}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ATTENDANCE */}
          {section === 'attendance' && (
            <div>
              <div style={s.secHeader}><div style={s.secTitle}>Attendance</div></div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {['topik1', 'topik2'].map(c => (
                  <button key={c} onClick={() => setCourseFilter(c)} style={{ padding: '5px 14px', background: courseFilter === c ? '#FDECEA' : '#F2F2F0', color: courseFilter === c ? '#C0392B' : '#6B6B6B', border: 'none', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                    {c === 'topik1' ? 'TOPIK 1' : 'TOPIK 2'}
                  </button>
                ))}
              </div>
              <div style={s.tableCard}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>Select lesson:</div>
                  <select value={attLesson} onChange={e => setAttLesson(e.target.value)} style={s.courseSelect}>
                    <option value="">— choose lesson —</option>
                    {lessons.filter(l => l.course === courseFilter).map(l => (
                      <option key={l.id} value={l.id}>Lesson {l.lesson_number} — {l.title}</option>
                    ))}
                  </select>
                  {attLesson && <div style={{ marginLeft: 'auto', fontSize: 11, color: '#6B6B6B' }}>Toggle present / absent</div>}
                </div>
                {attLesson ? (
                  <>
                    {active.filter(s => s.course === courseFilter).map(student => (
                      <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>
                          <div style={{ width: 30, height: 30, borderRadius: 7, background: '#E8EEF8', color: '#003478', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{student.full_name?.[0]?.toUpperCase()}</div>
                          {student.full_name}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setAttData({ ...attData, [student.id]: true })} style={{ padding: '5px 14px', background: attData[student.id] !== false ? '#EAF3DE' : '#F2F2F0', color: attData[student.id] !== false ? '#27500A' : '#6B6B6B', border: attData[student.id] !== false ? '2px solid #27500A' : '2px solid transparent', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Present</button>
                          <button onClick={() => setAttData({ ...attData, [student.id]: false })} style={{ padding: '5px 14px', background: attData[student.id] === false ? '#C0392B' : '#FDECEA', color: attData[student.id] === false ? 'white' : '#C0392B', border: attData[student.id] === false ? '2px solid #C0392B' : '2px solid transparent', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Absent</button>
                        </div>
                      </div>
                    ))}
                    <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={saveAttendance} style={s.addBtn}>Save Attendance</button>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', fontSize: 14, color: '#6B6B6B' }}>Select a lesson to mark attendance</div>
                )}
              </div>
            </div>
          )}

          {/* MARKS */}
          {section === 'marks' && (
            <div>
              <div style={s.secHeader}>
                <div style={s.secTitle}>Class Marks</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['topik1', 'topik2'].map(c => (
                    <button key={c} onClick={() => setCourseFilter(c)} style={{ padding: '5px 14px', background: courseFilter === c ? '#FDECEA' : '#F2F2F0', color: courseFilter === c ? '#C0392B' : '#6B6B6B', border: 'none', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                      {c === 'topik1' ? 'TOPIK 1' : 'TOPIK 2'}
                    </button>
                  ))}
                </div>
              </div>
              <div style={s.tableCard}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                    <thead>
                      <tr style={{ background: '#FAFAF8' }}>
                        <th style={{ ...s.th, textAlign: 'left', minWidth: 160 }}>Student</th>
                        {marksLessons.map(l => (
                          <th key={l.id} style={s.th}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#1a1a1a' }}>L {l.lesson_number}</div>
                              <div style={{ fontSize: 9, color: '#6B6B6B' }}>{l.title.slice(0, 8)}..</div>
                            </div>
                          </th>
                        ))}
                        <th style={s.th}>Avg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marksStudents.map((student, idx) => {
                        const scores = marksLessons.map(l => getPct(l.id, student.id))
                        const valid = scores.filter(s => s > 0)
                        const avg = valid.length > 0 ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 0
                        return (
                          <tr key={student.id}>
                            <td style={s.td}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 10, color: '#6B6B6B', fontWeight: 700, minWidth: 14 }}>{idx + 1}</span>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#E8EEF8', color: '#003478', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{student.full_name?.[0]?.toUpperCase()}</div>
                                <span style={{ fontSize: 12, fontWeight: 500 }}>{student.full_name?.split(' ')[0]} {student.full_name?.split(' ')[1]?.[0]}.</span>
                              </div>
                            </td>
                            {marksLessons.map(l => {
                              const pct = getPct(l.id, student.id)
                              const absent = isAbsent(student.id, l.id)
                              const color = pct >= 80 ? '#27AE60' : pct > 0 ? '#E74C3C' : '#D3D1C7'
                              const textColor = pct > 0 ? 'white' : '#888'
                              return (
                                <td key={l.id} style={{ ...s.td, textAlign: 'center' }}>
                                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: textColor, margin: '0 auto', boxShadow: absent ? '0 0 0 2.5px #E74C3C,0 0 0 4.5px rgba(231,76,60,0.15)' : 'none' }}>
                                    {pct > 0 ? pct : '—'}
                                  </div>
                                </td>
                              )
                            })}
                            <td style={{ ...s.td, textAlign: 'center', fontSize: 12, fontWeight: 700, color: avg >= 80 ? '#27500A' : avg >= 50 ? '#633806' : avg > 0 ? '#E74C3C' : '#6B6B6B' }}>
                              {avg > 0 ? `${avg}%` : '—'}
                            </td>
                          </tr>
                        )
                      })}
                      {marksStudents.length === 0 && <tr><td colSpan={marksLessons.length + 2} style={{ ...s.td, textAlign: 'center', color: '#6B6B6B' }}>No students in this course</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, bg, num, label, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{num}</div>
        <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}

const s = {
  topbar: { height: 64, background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', position: 'relative', zIndex: 100 },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  brandName: { fontSize: 15, fontWeight: 700, color: '#1a1a1a' },
  adminBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: '#003478', color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em' },
  brandSub: { fontSize: 10, color: '#C0392B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 1 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 8 },
  profileBtn: { display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '4px 10px 4px 4px' },
  avatar: { width: 32, height: 32, borderRadius: 7, background: '#FDECEA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#C0392B' },
  profileName: { fontSize: 11, fontWeight: 600, color: '#1a1a1a' },
  profileRole: { fontSize: 9, color: '#C0392B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  logoutBtn: { padding: '6px 14px', background: '#FDECEA', color: '#C0392B', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
  layout: { display: 'flex', minHeight: 'calc(100vh - 64px)' },
  sidebar: { width: 220, background: '#fff', borderRight: '1px solid rgba(0,0,0,0.08)', padding: '1rem 0', flexShrink: 0 },
  sideSection: { fontSize: 10, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 16px', margin: '12px 0 6px' },
  sideItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, fontWeight: 500, color: '#6B6B6B', cursor: 'pointer', borderLeft: '3px solid transparent' },
  sideItemActive: { background: '#FDECEA', color: '#C0392B', borderLeftColor: '#C0392B' },
  sideBadge: { marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: '#C0392B', color: 'white', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1, padding: '1.5rem', background: '#ECECEA', overflowY: 'auto' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: '1.5rem' },
  secHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  secTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a1a' },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: '#E8EEF8', color: '#003478', textTransform: 'uppercase', letterSpacing: '0.04em' },
  pendingCard: { background: '#fff', borderRadius: 12, padding: '12px 16px', border: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 12 },
  pendingAvatar: { width: 40, height: 40, borderRadius: 9, background: '#E8EEF8', color: '#003478', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 },
  courseSelect: { fontSize: 11, padding: '5px 8px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', background: '#FAFAF8', fontFamily: "'DM Sans',sans-serif", color: '#1a1a1a', cursor: 'pointer' },
  acceptBtn: { padding: '6px 14px', background: '#EAF3DE', color: '#27500A', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
  rejectBtn: { padding: '6px 14px', background: '#FDECEA', color: '#C0392B', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
  tableCard: { background: '#fff', borderRadius: 12, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '1.5rem' },
  th: { padding: '9px 14px', fontSize: 10, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(0,0,0,0.08)', textAlign: 'left', background: '#FAFAF8', whiteSpace: 'nowrap' },
  td: { padding: '10px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', fontSize: 13, color: '#1a1a1a' },
  kickBtn: { padding: '4px 12px', background: '#FDECEA', color: '#C0392B', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
  addBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#C0392B', color: 'white', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
  fieldLabel: { display: 'block', fontSize: 10, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 },
  fieldInput: { width: '100%', padding: '9px 12px', fontSize: 13, fontFamily: "'DM Sans',sans-serif", border: '1px solid rgba(0,0,0,0.08)', borderRadius: 9, background: '#FAFAF8', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' },
  lessonCard: { background: '#fff', borderRadius: 12, padding: '12px 16px', border: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 12 },
  editBtn: { padding: '5px 12px', background: '#E8EEF8', color: '#003478', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
  deleteBtn: { padding: '5px 12px', background: '#FDECEA', color: '#C0392B', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
  liveCard: { background: 'linear-gradient(135deg,#003478,#00449F)', borderRadius: 16, padding: 20, marginBottom: '1.5rem' },
  liveLabelStyle: { display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 },
  liveInput: { width: '100%', padding: '9px 12px', fontSize: 13, fontFamily: "'DM Sans',sans-serif", border: '1px solid rgba(255,255,255,0.3)', borderRadius: 9, background: 'rgba(255,255,255,0.15)', color: 'white', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' },
  liveSaveBtn: { padding: '9px 20px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" },
}