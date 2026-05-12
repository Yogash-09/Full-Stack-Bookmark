// src/components/RelatedLinks.jsx
import { useState } from 'react'
import { bookmarkAPI } from '../api/api'

const inp = { width: '100%', padding: '8px 11px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', outline: 'none', background: 'rgba(255,255,255,0.04)', color: '#F5F7FA', boxSizing: 'border-box', transition: 'all 0.2s' }
const fi = e => { e.target.style.borderColor = 'rgba(124,92,255,0.5)'; e.target.style.boxShadow = '0 0 0 2px rgba(124,92,255,0.1)' }
const fo = e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }

function RelatedLinks({ bookmarkId, initialLinks = [], onUpdate }) {
  const [links, setLinks] = useState(initialLinks)
  const [newUrl, setNewUrl] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editId, setEditId] = useState(null)
  const [editUrl, setEditUrl] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const userId = localStorage.getItem('userId')

  const sync = (bm) => { setLinks(bm.relatedLinks); if (onUpdate) onUpdate(bm.relatedLinks) }
  const handleAdd = async () => {
    if (!newUrl.trim()) return
    try { const r = await bookmarkAPI.addRelatedLink(bookmarkId, userId, newUrl.trim(), newDesc.trim()); sync(r.data); setNewUrl(''); setNewDesc('') } catch {}
  }
  const handleUpdate = async (id) => {
    try { const r = await bookmarkAPI.updateRelatedLink(bookmarkId, id, userId, editUrl.trim(), editDesc.trim()); sync(r.data); setEditId(null) } catch {}
  }
  const handleDelete = async (id) => {
    try { const r = await bookmarkAPI.deleteRelatedLink(bookmarkId, id, userId); sync(r.data) } catch {}
  }

  return (
    <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(87,230,255,0.04)', border: '1px solid rgba(87,230,255,0.12)', borderRadius: '10px' }}>
      <p style={{ margin: '0 0 10px 0', fontSize: '10px', fontWeight: '700', color: '#57E6FF', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Manage related links</p>
      {links.map(link => (
        <div key={link._id} style={{ marginBottom: '6px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
          {editId === link._id ? (
            <div style={{ display: 'grid', gap: '6px' }}>
              <input value={editUrl} onChange={e => setEditUrl(e.target.value)} placeholder="URL" style={inp} onFocus={fi} onBlur={fo} />
              <input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description" style={inp} onFocus={fi} onBlur={fo} />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleUpdate(link._id)} style={{ padding: '5px 12px', background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                <button onClick={() => setEditId(null)} style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.06)', color: '#A7B0C0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '12px', color: '#57E6FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onMouseOver={e => e.target.style.textDecoration = 'underline'} onMouseOut={e => e.target.style.textDecoration = 'none'}>{link.url}</a>
                {link.description && <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#6E7687' }}>{link.description}</p>}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button onClick={() => { setEditId(link._id); setEditUrl(link.url); setEditDesc(link.description) }} style={{ background: 'none', border: 'none', color: '#6E7687', cursor: 'pointer', fontSize: '13px', padding: '2px 4px' }}
                  onMouseOver={e => e.target.style.color = '#B388FF'} onMouseOut={e => e.target.style.color = '#6E7687'}>✎</button>
                <button onClick={() => handleDelete(link._id)} style={{ background: 'none', border: 'none', color: '#6E7687', cursor: 'pointer', fontSize: '14px', padding: '2px 4px' }}
                  onMouseOver={e => e.target.style.color = '#EF4444'} onMouseOut={e => e.target.style.color = '#6E7687'}>×</button>
              </div>
            </div>
          )}
        </div>
      ))}
      <div style={{ display: 'grid', gap: '6px', marginTop: '8px' }}>
        <input value={newUrl} onChange={e => setNewUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="https://related-url.com" style={inp} onFocus={fi} onBlur={fo} />
        <input value={newDesc} onChange={e => setNewDesc(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Description (optional)" style={inp} onFocus={fi} onBlur={fo} />
        <button onClick={handleAdd} style={{ padding: '7px 14px', background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', alignSelf: 'start', boxShadow: '0 0 12px rgba(124,92,255,0.25)' }}>
          + Add link
        </button>
      </div>
    </div>
  )
}
export default RelatedLinks
