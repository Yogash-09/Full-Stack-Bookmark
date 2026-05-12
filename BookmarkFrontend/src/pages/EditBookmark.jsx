// src/pages/EditBookmark.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { bookmarkAPI, folderAPI } from '../api/api'
import RelatedLinks from '../components/RelatedLinks'

const inp = { width: '100%', padding: '10px 13px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#F5F7FA', borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }
const lbl = { display: 'block', marginBottom: '6px', color: '#A7B0C0', fontWeight: '500', fontSize: '12px' }
const fi = e => { e.target.style.borderColor = 'rgba(124,92,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,92,255,0.1)' }
const fo = e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }

function EditBookmark() {
  const { id } = useParams()
  const [form, setForm] = useState({ title: '', url: '', description: '', tags: '', folderId: '', status: 'unread', priority: 'medium' })
  const [relatedLinks, setRelatedLinks] = useState([])
  const [folders, setFolders] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')

  useEffect(() => {
    Promise.all([bookmarkAPI.getBookmarks(userId), folderAPI.getFolders(userId)])
      .then(([bRes, fRes]) => {
        const b = bRes.data.find(x => x._id === id)
        if (b) { setForm({ title: b.title, url: b.url, description: b.description || '', tags: b.tags?.join(', ') || '', folderId: b.folderId || '', status: b.status || 'unread', priority: b.priority || 'medium' }); setRelatedLinks(b.relatedLinks || []) }
        setFolders(fRes.data)
      }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try { await bookmarkAPI.updateBookmark(id, { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), folderId: form.folderId || null, userId }); navigate('/dashboard') }
    catch (err) { setError(err.response?.data?.error || 'Failed to update') }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0F1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(124,92,255,0.2)', borderTop: '2px solid #7C5CFF', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const selStyle = { ...inp, cursor: 'pointer' }

  return (
    <div style={{ minHeight: '100vh', background: '#0F1117' }}>
      <Navbar />
      <div style={{ padding: '24px', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(22,26,35,0.9)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', boxShadow: '0 0 40px rgba(0,0,0,0.4)' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#F5F7FA', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(124,92,255,0.35)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </span>
            Edit bookmark
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div><label style={lbl}>URL *</label><input type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} required style={inp} onFocus={fi} onBlur={fo} /></div>
              <div><label style={lbl}>Title *</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={inp} onFocus={fi} onBlur={fo} /></div>
              <div><label style={lbl}>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inp, height: '80px', resize: 'vertical' }} onFocus={fi} onBlur={fo} /></div>
              <div><label style={lbl}>Tags <span style={{ color: '#6E7687', fontWeight: '400' }}>(comma separated)</span></label><input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="tag1, tag2" style={inp} onFocus={fi} onBlur={fo} /></div>

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

              <RelatedLinks bookmarkId={id} initialLinks={relatedLinks} onUpdate={setRelatedLinks} />

              {error && <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontSize: '12px', color: '#EF4444' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button type="submit" style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 0 20px rgba(124,92,255,0.3)', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(124,92,255,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(124,92,255,0.3)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                  Save changes
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
export default EditBookmark
