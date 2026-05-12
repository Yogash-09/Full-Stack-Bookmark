// src/components/FolderList.jsx
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { folderAPI, bookmarkAPI } from '../api/api'

const COLORS = ['#7C5CFF','#57E6FF','#B388FF','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444']

const NavItem = ({ to, icon, label, count, active, color }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 12px', borderRadius: '10px', cursor: 'pointer',
      background: active ? `linear-gradient(135deg, ${color}22, ${color}11)` : 'transparent',
      border: active ? `1px solid ${color}33` : '1px solid transparent',
      transition: 'all 0.2s', marginBottom: '2px'
    }}
      onMouseOver={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' } }}
      onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
        <span style={{ color: active ? color : '#6E7687', transition: 'color 0.2s' }}>{icon}</span>
        <span style={{ fontSize: '13px', fontWeight: active ? '600' : '400', color: active ? '#F5F7FA' : '#A7B0C0' }}>{label}</span>
      </div>
      {count !== undefined && (
        <span style={{
          fontSize: '11px', fontWeight: '600', minWidth: '20px', textAlign: 'center',
          padding: '1px 6px', borderRadius: '6px',
          background: active ? `${color}33` : 'rgba(255,255,255,0.06)',
          color: active ? color : '#6E7687'
        }}>{count}</span>
      )}
    </div>
  </Link>
)

function FolderList() {
  const [folders, setFolders] = useState([])
  const [counts, setCounts] = useState({})
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#7C5CFF')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const userId = localStorage.getItem('userId')
  const location = useLocation()
  const activeFolderId = location.pathname.includes('/folders/') ? location.pathname.split('/folders/')[1] : null

  useEffect(() => {
    folderAPI.getFolders(userId).then(r => setFolders(r.data)).catch(() => {})
    bookmarkAPI.getBookmarks(userId).then(r => {
      const c = {}; r.data.forEach(b => { if (b.folderId) c[b.folderId] = (c[b.folderId] || 0) + 1 }); setCounts(c)
    }).catch(() => {})
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); if (!newName.trim()) return; setLoading(true)
    try { await folderAPI.createFolder({ name: newName.trim(), userId, color: newColor, icon: '' }); const r = await folderAPI.getFolders(userId); setFolders(r.data); setNewName(''); setShowForm(false) }
    catch {} finally { setLoading(false) }
  }
  const handleDelete = async (id) => {
    if (!confirm('Delete folder?')) return
    try { await folderAPI.deleteFolder(id, userId); setFolders(f => f.filter(x => x._id !== id)) } catch {}
  }

  const isHome = !activeFolderId && location.pathname === '/dashboard'

  return (
    <div style={{
      background: 'rgba(22,26,35,0.8)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px',
      padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px'
    }}>
      {/* Section label */}
      <div style={{ padding: '4px 12px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#6E7687', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Library</span>
        <button onClick={() => setShowForm(v => !v)} style={{
          width: '22px', height: '22px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)',
          background: showForm ? 'rgba(239,68,68,0.15)' : 'rgba(124,92,255,0.15)',
          color: showForm ? '#EF4444' : '#7C5CFF', fontSize: '16px', lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: '700'
        }}>{showForm ? '×' : '+'}</button>
      </div>

      {/* New folder form */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ margin: '0 4px 8px', padding: '12px', background: 'rgba(124,92,255,0.06)', border: '1px solid rgba(124,92,255,0.15)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Folder name..." autoFocus
            style={{ padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#F5F7FA', outline: 'none' }}
            onFocus={e => { e.target.style.borderColor = 'rgba(124,92,255,0.5)'; e.target.style.boxShadow = '0 0 0 2px rgba(124,92,255,0.1)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
          />
          <div style={{ display: 'flex', gap: '5px' }}>
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => setNewColor(c)} style={{
                width: '18px', height: '18px', borderRadius: '50%', background: c, border: newColor === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', flexShrink: 0
              }} />
            ))}
          </div>
          <button type="submit" disabled={loading} style={{
            padding: '7px', background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', color: '#fff',
            border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1
          }}>{loading ? 'Creating...' : 'Create folder'}</button>
        </form>
      )}

      {/* All bookmarks */}
      <NavItem to="/dashboard" active={isHome} color="#7C5CFF"
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>}
        label="All bookmarks"
      />

      {/* Divider */}
      {folders.length > 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '6px 4px' }} />}

      {/* Folders */}
      {folders.length === 0 ? (
        <p style={{ padding: '8px 12px', fontSize: '12px', color: '#6E7687', textAlign: 'center' }}>No folders yet</p>
      ) : folders.map(folder => {
        const color = folder.color || '#7C5CFF'
        const isActive = activeFolderId === folder._id
        return (
          <div key={folder._id} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <div style={{ flex: 1 }}>
              <NavItem to={`/folders/${folder._id}`} active={isActive} color={color}
                icon={<span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }} />}
                label={folder.name} count={counts[folder._id] || 0}
              />
            </div>
            <button onClick={() => handleDelete(folder._id)} style={{
              width: '22px', height: '22px', border: 'none', background: 'transparent',
              color: '#6E7687', cursor: 'pointer', borderRadius: '5px', fontSize: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0
            }}
              onMouseOver={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#EF4444' }}
              onMouseOut={e => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6E7687' }}
            >×</button>
          </div>
        )
      })}
    </div>
  )
}

export default FolderList
