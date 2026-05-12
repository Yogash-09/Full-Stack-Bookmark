// src/pages/CreateBookmark.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { bookmarkAPI, folderAPI, aiAPI } from '../api/api'

const inp = { width: '100%', padding: '10px 13px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#F5F7FA', borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }
const lbl = { display: 'block', marginBottom: '6px', color: '#A7B0C0', fontWeight: '500', fontSize: '12px' }
const fi = e => { e.target.style.borderColor = 'rgba(124,92,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,92,255,0.1)' }
const fo = e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }

function CreateBookmark() {
  const [form, setForm] = useState({ title: '', url: '', description: '', tags: '', folderId: '', status: 'unread', priority: 'medium' })
  const [relatedLinks, setRelatedLinks] = useState([])
  const [rlInput, setRlInput] = useState({ url: '', desc: '' })
  const [rlEdit, setRlEdit] = useState(null)
  const [folders, setFolders] = useState([])
  const [error, setError] = useState('')
  const [aiData, setAiData] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiApplied, setAiApplied] = useState(false)
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')
  const aiTimer = useRef(null)

  useEffect(() => { folderAPI.getFolders(userId).then(r => setFolders(r.data)).catch(() => {}) }, [])

  const triggerAI = (url, title, desc) => {
    if (!url?.startsWith('http')) return
    clearTimeout(aiTimer.current)
    aiTimer.current = setTimeout(async () => {
      setAiLoading(true)
      try { const r = await aiAPI.analyze(title || url, url, desc || ''); setAiData(r.data) } catch {}
      finally { setAiLoading(false) }
    }, 800)
  }

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value }; setForm(updated)
    if (['url', 'title', 'description'].includes(field)) triggerAI(updated.url, updated.title, updated.description)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await bookmarkAPI.createBookmark({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), folderId: form.folderId || null, userId, relatedLinks, ...(aiData && { category: aiData.category, contentType: aiData.contentType, aiSummary: aiData.aiSummary, aiKeyPoints: aiData.aiKeyPoints, estimatedReadTime: aiData.estimatedReadTime, aiSuggestedFolder: aiData.aiSuggestedFolder }) })
      navigate('/dashboard')
    } catch (err) { setError(err.response?.data?.error || 'Failed to create bookmark') }
  }

  const addRL = () => {
    if (!rlInput.url.trim()) return
    setRelatedLinks([...relatedLinks, { url: rlInput.url.trim(), description: rlInput.desc.trim() }])
    setRlInput({ url: '', desc: '' })
  }

  const selStyle = { ...inp, cursor: 'pointer' }

  return (
    <div style={{ minHeight: '100vh', background: '#0F1117' }}>
      <Navbar />
      <div style={{ padding: '24px', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(22,26,35,0.9)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', boxShadow: '0 0 40px rgba(0,0,0,0.4)' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#F5F7FA', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(124,92,255,0.35)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </span>
            New bookmark
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div><label style={lbl}>URL *</label><input type="url" value={form.url} onChange={e => handleChange('url', e.target.value)} required placeholder="https://example.com" style={inp} onFocus={fi} onBlur={fo} /></div>
              <div><label style={lbl}>Title *</label><input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)} required placeholder="Bookmark title" style={inp} onFocus={fi} onBlur={fo} /></div>

              {/* AI panel */}
              {(aiLoading || aiData) && (
                <div style={{ padding: '14px', background: 'rgba(124,92,255,0.06)', border: '1px solid rgba(124,92,255,0.18)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#B388FF', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/></svg>
                      AI Analysis {aiLoading && '— analysing...'}
                    </span>
                    {aiData && !aiApplied && (
                      <button type="button" onClick={() => { setForm(p => ({ ...p, tags: aiData.tags?.join(', ') || p.tags })); setAiApplied(true) }}
                        style={{ padding: '4px 12px', background: 'rgba(124,92,255,0.2)', color: '#B388FF', border: '1px solid rgba(124,92,255,0.3)', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                        Apply suggestions
                      </button>
                    )}
                    {aiApplied && <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '600' }}>✓ Applied</span>}
                  </div>
                  {aiData && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[aiData.category, aiData.contentType, aiData.estimatedReadTime ? `${aiData.estimatedReadTime} min` : null].filter(Boolean).map(v => (
                        <span key={v} style={{ padding: '2px 9px', background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.2)', borderRadius: '6px', fontSize: '11px', color: '#B388FF' }}>{v}</span>
                      ))}
                      {aiData.tags?.slice(0, 4).map(t => (
                        <span key={t} style={{ padding: '2px 9px', background: 'rgba(87,230,255,0.08)', border: '1px solid rgba(87,230,255,0.15)', borderRadius: '6px', fontSize: '11px', color: '#57E6FF' }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div><label style={lbl}>Description</label><textarea value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Optional description..." style={{ ...inp, height: '80px', resize: 'vertical' }} onFocus={fi} onBlur={fo} /></div>
              <div><label style={lbl}>Tags <span style={{ color: '#6E7687', fontWeight: '400' }}>(comma separated)</span></label><input type="text" value={form.tags} onChange={e => handleChange('tags', e.target.value)} placeholder="react, tutorial, frontend" style={inp} onFocus={fi} onBlur={fo} /></div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div><label style={lbl}>Folder</label>
                  <select value={form.folderId} onChange={e => setForm({ ...form, folderId: e.target.value })} style={selStyle} onFocus={fi} onBlur={fo}>
                    <option value="" style={{ background: '#1C2230' }}>No folder</option>
                    {folders.map(f => <option key={f._id} value={f._id} style={{ background: '#1C2230' }}>{f.name}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={selStyle} onFocus={fi} onBlur={fo}>
                    {['unread','reading','completed','archived'].map(s => <option key={s} value={s} style={{ background: '#1C2230' }}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={selStyle} onFocus={fi} onBlur={fo}>
                    {['low','medium','high','urgent'].map(p => <option key={p} value={p} style={{ background: '#1C2230' }}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Related links */}
              <div style={{ padding: '14px', background: 'rgba(87,230,255,0.04)', border: '1px solid rgba(87,230,255,0.1)', borderRadius: '12px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: '#57E6FF', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Related links</p>
                {relatedLinks.map((link, idx) => (
                  <div key={idx} style={{ marginBottom: '6px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                    {rlEdit?.idx === idx ? (
                      <div style={{ display: 'grid', gap: '6px' }}>
                        <input value={rlEdit.url} onChange={e => setRlEdit({ ...rlEdit, url: e.target.value })} placeholder="URL" style={inp} onFocus={fi} onBlur={fo} />
                        <input value={rlEdit.desc} onChange={e => setRlEdit({ ...rlEdit, desc: e.target.value })} placeholder="Description" style={inp} onFocus={fi} onBlur={fo} />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" onClick={() => { const u = [...relatedLinks]; u[idx] = { url: rlEdit.url, description: rlEdit.desc }; setRelatedLinks(u); setRlEdit(null) }} style={{ padding: '5px 12px', background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                          <button type="button" onClick={() => setRlEdit(null)} style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.06)', color: '#A7B0C0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: '12px', color: '#57E6FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</span>
                          {link.description && <span style={{ fontSize: '11px', color: '#6E7687' }}>{link.description}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          <button type="button" onClick={() => setRlEdit({ idx, url: link.url, desc: link.description })} style={{ background: 'none', border: 'none', color: '#6E7687', cursor: 'pointer', fontSize: '13px' }} onMouseOver={e => e.target.style.color = '#B388FF'} onMouseOut={e => e.target.style.color = '#6E7687'}>✎</button>
                          <button type="button" onClick={() => setRelatedLinks(relatedLinks.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#6E7687', cursor: 'pointer', fontSize: '14px' }} onMouseOver={e => e.target.style.color = '#EF4444'} onMouseOut={e => e.target.style.color = '#6E7687'}>×</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div style={{ display: 'grid', gap: '6px', marginTop: '6px' }}>
                  <input value={rlInput.url} onChange={e => setRlInput({ ...rlInput, url: e.target.value })} placeholder="https://related-url.com" style={inp} onFocus={fi} onBlur={fo} />
                  <input value={rlInput.desc} onChange={e => setRlInput({ ...rlInput, desc: e.target.value })} placeholder="Description (optional)" style={inp} onFocus={fi} onBlur={fo} />
                  <button type="button" onClick={addRL} style={{ padding: '7px 14px', background: 'rgba(87,230,255,0.1)', color: '#57E6FF', border: '1px solid rgba(87,230,255,0.2)', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', alignSelf: 'start' }}>+ Add link</button>
                </div>
              </div>

              {error && <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontSize: '12px', color: '#EF4444' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button type="submit" style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 0 20px rgba(124,92,255,0.3)', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(124,92,255,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(124,92,255,0.3)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                  Save bookmark
                </button>
                <button type="button" onClick={() => navigate('/dashboard')} style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.04)', color: '#A7B0C0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
export default CreateBookmark
