{section === 'live' && (
            <div>
              <div style={s.secHeader}>
                <div style={s.secTitle}>Live Lesson Schedule</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['topik1','topik2'].map(c => (
                    <button key={c} onClick={() => setLiveCourse(c)} style={{ padding: '5px 14px', background: liveCourse===c ? '#FDECEA' : '#F2F2F0', color: liveCourse===c ? '#C0392B' : '#6B6B6B', border: 'none', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                      {c==='topik1' ? 'TOPIK 1' : 'TOPIK 2'}
                    </button>
                  ))}
                </div>
              </div>

              {nextLesson && nextLesson.course === liveCourse && (
                <div style={{ background: 'linear-gradient(90deg,#003478,#00449F)', borderRadius: 12, padding: '14px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Next: Lesson {nextLesson.lesson_number}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                        {nextLesson.scheduled_at ? new Date(nextLesson.scheduled_at).toLocaleDateString('en-GB', {weekday:'long',day:'numeric',month:'long'}) + ' - ' + new Date(nextLesson.scheduled_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) + ' Tashkent' : ''}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(nextLesson.meet_link); alert('Link copied!') }} style={{ padding: '5px 14px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Copy link</button>
                </div>
              )}

              <div style={s.tableCard}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#FAFAF8' }}>
                      {['#','Date & Time','Link','Status',''].map(h => <th key={h} style={s.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {allLiveLessons.filter(l => l.course === liveCourse).sort((a,b) => a.lesson_number - b.lesson_number).map(ll => {
                      const now = new Date()
                      const dt = ll.scheduled_at ? new Date(ll.scheduled_at) : null
                      const isPast = dt && dt < now
                      const isNext = nextLesson && nextLesson.id === ll.id
                      return (
                        <tr key={ll.id} style={{ background: isNext ? '#F0F8FF' : 'transparent' }}>
                          <td style={s.td}><div style={{ width: 32, height: 32, borderRadius: 8, background: isNext ? '#EAF3DE' : '#E8EEF8', color: isNext ? '#27500A' : '#003478', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{ll.lesson_number}</div></td>
                          <td style={{ ...s.td, fontSize: 12, color: isNext ? '#003478' : '#6B6B6B', fontWeight: isNext ? 600 : 400 }}>{dt ? dt.toLocaleDateString('en-GB') + ' - ' + dt.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : '-'}</td>
                          <td style={s.td}><div style={{ fontSize: 11, color: '#003478', fontFamily: 'monospace', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ll.meet_link}</div></td>
                          <td style={s.td}>
                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: isNext ? '#EAF3DE' : isPast ? '#F2F2F0' : '#E8EEF8', color: isNext ? '#27500A' : isPast ? '#6B6B6B' : '#003478' }}>
                              {isNext ? 'Next' : isPast ? 'Past' : 'Upcoming'}
                            </span>
                          </td>
                          <td style={s.td}><button onClick={() => deleteLiveLesson(ll.id)} style={s.deleteBtn}>Delete</button></td>
                        </tr>
                      )
                    })}
                    {allLiveLessons.filter(l => l.course === liveCourse).length === 0 && (
                      <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#6B6B6B' }}>No lessons added yet. Add your first lesson below.</td></tr>
                    )}
                  </tbody>
                </table>
                <div style={{ padding: '12px 16px', background: '#FAFAF8', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'grid', gridTemplateColumns: '80px 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
                  <div>
                    <label style={s.fieldLabel}>Lesson #</label>
                    <input type="number" value={newLiveNum} onChange={e => setNewLiveNum(e.target.value)} placeholder="1" style={s.fieldInput} />
                  </div>
                  <div>
                    <label style={s.fieldLabel}>Date & Time</label>
                    <input type="datetime-local" value={newLiveDate} onChange={e => setNewLiveDate(e.target.value)} style={s.fieldInput} />
                  </div>
                  <div>
                    <label style={s.fieldLabel}>Meet / Zoom Link</label>
                    <input type="text" value={newLiveLink} onChange={e => setNewLiveLink(e.target.value)} placeholder="https://meet.google.com/..." style={s.fieldInput} />
                  </div>
                  <button onClick={addLiveLesson} style={{ ...s.addBtn, height: 38 }}>+ Add</button>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: '#6B6B6B' }}>The <strong>Next</strong> lesson is automatically shown to students based on today's date.</div>
            </div>