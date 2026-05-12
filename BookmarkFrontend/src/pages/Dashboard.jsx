// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BookmarkCard from '../components/BookmarkCard'
import FolderList from '../components/FolderList'
import { Toast, useToast } from '../components/Toast'
import { bookmarkAPI } from '../api/api'
import ChatBot from '../components/ChatBot'

const IC = {
  sparkle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75z"/></svg>,
  bookmark: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  star: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  tag: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  folder: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  download: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  chat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  close: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  filter: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  sort: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
}

const StatCard = ({ icon, label, value, color, glow }) => (
  <div style={{
    padding: '16px', borderRadius: '14px',
    background: `linear-gradient(135deg, ${color}12, ${color}06)`,
    border: `1px solid ${color}22`,
    boxShadow: `0 0 20px ${color}10`,
    display: 'flex', alignItems: 'center', gap: '12px',
    transition: 'all 0.2s'
  }}
    onMouseOver={e => { e.currentTarget.style.boxShadow = `0 0 30px ${color}25`; e.currentTarget.style.borderColor = `${color}44` }}
    onMouseOut={e => { e.currentTarget.style.boxShadow = `0 0 20px ${color}10`; e.currentTarget.style.borderColor = `${color}22` }}
  >
    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#F5F7FA', lineHeight: 1 }}>{value}</p>
      <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#6E7687', fontWeight: '500' }}>{label}</p>
    </div>
  </div>
)

function Dashboard() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('recent')
  const [showFavOnly, setShowFavOnly] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [stats, setStats] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const { toasts, show: showToast } = useToast()
  const userId = localStorage.getItem('userId')

  useEffect(() => { fetchBookmarks(); fetchStats() }, [])
  useEffect(() => { applySort() }, [sortBy])

  const fetchBookmarks = async () => {
    try { const r = await bookmarkAPI.getBookmarks(userId); setBookmarks(r.data) }
    catch { showToast('Failed to load', 'error') }
    finally { setLoading(false) }
  }
  const fetchStats = async () => { try { const r = await bookmarkAPI.getBookmarkStats(userId); setStats(r.data) } catch {} }
  const handleDelete = async (id) => {
    try { await bookmarkAPI.deleteBookmark(id, userId); setBookmarks(b => b.filter(x => x._id !== id)); fetchStats(); showToast('Deleted') }
    catch { showToast('Failed', 'error') }
  }
  const applySort = async () => {
    try {
      if (sortBy === 'recent') { const r = await bookmarkAPI.getBookmarks(userId); setBookmarks(r.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))) }
      else { const r = await bookmarkAPI.getBookmarksWithSort(userId, sortBy); setBookmarks(r.data) }
    } catch {}
  }
  const handleExport = async (fmt) => {
    try {
      const r = await bookmarkAPI.exportBookmarks(userId)
      const content = fmt === 'json' ? JSON.stringify(r.data, null, 2)
        : ['Title,URL,Description,Tags'].concat(r.data.map(b => `"${b.title}","${b.url}","${b.description || ''}","${b.tags?.join(';') || ''}"`)).join('\n')
      const blob = new Blob([content], { type: fmt === 'json' ? 'application/json' : 'text/csv' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
      a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.${fmt}`; a.click()
      showToast(`Exported ${fmt.toUpperCase()}`)
    } catch { showToast('Export failed', 'error') }
    setExportOpen(false)
  }

  const allTags = [...new Set(bookmarks.flatMap(b => b.tags || []))].sort()
  const displayed = bookmarks
    .filter(b => !showFavOnly || b.isFavorite)
    .filter(b => selectedTags.length === 0 || b.tags?.some(t => selectedTags.includes(t)))

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0F1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(124,92,255,0.2)', borderTop: '2px solid #7C5CFF', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <span style={{ fontSize: '13px', color: '#6E7687' }}>Loading your workspace...</span>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0F1117' }}>
      <Navbar />

      <div style={{ display: 'flex', padding: '20px 24px', gap: '20px', maxWidth: '1440px', margin: '0 auto' }}>

        {/* ── Sidebar ── */}
        <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px', position: 'sticky', top: '84px', height: 'fit-content' }}>
          <FolderList />

          {/* Stats */}
          {stats && (
            <div style={{ background: 'rgba(22,26,35,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '600', color: '#6E7687', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Overview</p>
              <StatCard icon={IC.bookmark} label="Total" value={stats.totalBookmarks} color="#7C5CFF" />
              <StatCard icon={IC.star} label="Starred" value={stats.favoriteCount} color="#F59E0B" />
              <StatCard icon={IC.tag} label="Tags" value={stats.uniqueTagsCount} color="#57E6FF" />
              <StatCard icon={IC.folder} label="Folders" value={stats.totalFoldersUsed} color="#10B981" />
            </div>
          )}
        </div>

        {/* ── Main ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Toolbar */}
          <div style={{
            background: 'rgba(22,26,35,0.8)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px',
            padding: '14px 18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Sort */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px' }}>
                  <span style={{ color: '#6E7687' }}>{IC.sort}</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
                    border: 'none', background: 'transparent', fontSize: '12px', color: '#A7B0C0', cursor: 'pointer', outline: 'none', fontWeight: '500'
                  }}>
                    <option value="recent" style={{ background: '#1C2230' }}>Recent</option>
                    <option value="title" style={{ background: '#1C2230' }}>A–Z</option>
                    <option value="favorite" style={{ background: '#1C2230' }}>Starred first</option>
                    <option value="mostViewed" style={{ background: '#1C2230' }}>Most viewed</option>
                  </select>
                </div>

                {/* Starred toggle */}
                <button onClick={() => setShowFavOnly(v => !v)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '9px', fontSize: '12px', fontWeight: '500',
                  cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                  background: showFavOnly ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
                  color: showFavOnly ? '#F59E0B' : '#A7B0C0',
                  borderColor: showFavOnly ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'
                }}>
                  {IC.star} {showFavOnly ? 'Starred' : 'All'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Count badge */}
                <span style={{ fontSize: '12px', color: '#6E7687', padding: '4px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {displayed.length} bookmark{displayed.length !== 1 ? 's' : ''}
                </span>

                {/* Export */}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setExportOpen(v => !v)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '9px', fontSize: '12px', color: '#A7B0C0', cursor: 'pointer', fontWeight: '500', transition: 'all 0.15s'
                  }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                  >
                    {IC.download} Export
                  </button>
                  {exportOpen && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', background: 'rgba(22,26,35,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 100, minWidth: '140px', overflow: 'hidden' }}>
                      {['json', 'csv'].map(f => (
                        <button key={f} onClick={() => handleExport(f)} style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', textAlign: 'left', fontSize: '12px', color: '#A7B0C0', cursor: 'pointer', fontWeight: '500', transition: 'all 0.15s' }}
                          onMouseOver={e => { e.currentTarget.style.background = 'rgba(124,92,255,0.1)'; e.currentTarget.style.color = '#B388FF' }}
                          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A7B0C0' }}>
                          Export {f.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tag filters */}
            {allTags.length > 0 && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#6E7687', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.6px', marginRight: '4px' }}>
                  {IC.filter} Tags
                </span>
                {allTags.map(tag => {
                  const active = selectedTags.includes(tag)
                  return (
                    <button key={tag} onClick={() => setSelectedTags(active ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag])}
                      style={{ padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                        background: active ? 'rgba(124,92,255,0.15)' : 'rgba(255,255,255,0.04)',
                        color: active ? '#B388FF' : '#A7B0C0',
                        borderColor: active ? 'rgba(124,92,255,0.35)' : 'rgba(255,255,255,0.08)' }}>
                      {tag}
                    </button>
                  )
                })}
                {selectedTags.length > 0 && (
                  <button onClick={() => setSelectedTags([])} style={{ padding: '3px 8px', borderRadius: '8px', fontSize: '11px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}>
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bookmark list */}
          {displayed.length === 0 ? (
            <div style={{
              background: 'rgba(22,26,35,0.8)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px',
              padding: '80px 40px', textAlign: 'center'
            }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#7C5CFF' }}>
                {IC.bookmark}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F5F7FA', marginBottom: '8px' }}>
                {showFavOnly ? 'No starred bookmarks' : selectedTags.length > 0 ? 'No matches found' : 'Your library is empty'}
              </h3>
              <p style={{ fontSize: '13px', color: '#6E7687', marginBottom: '24px', lineHeight: '1.6' }}>
                {showFavOnly ? 'Star bookmarks to see them here.' : selectedTags.length > 0 ? 'Try different tags or clear filters.' : 'Start building your knowledge base.'}
              </p>
              {!showFavOnly && selectedTags.length === 0 && (
                <Link to="/bookmarks/new">
                  <button style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 0 20px rgba(124,92,255,0.35)' }}>
                    Add your first bookmark
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {displayed.map(b => (
                <BookmarkCard key={b._id} bookmark={b} onDelete={handleDelete} onFavoriteToggle={fetchBookmarks} />
              ))}
            </div>
          )}
        </div>
      </div>

      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} duration={t.duration} />)}

      {showChat && <ChatBot onClose={() => setShowChat(false)} />}

      {/* AI FAB */}
      <button onClick={() => setShowChat(v => !v)} title="AI Assistant" style={{
        position: 'fixed', bottom: '28px', right: '28px',
        width: '52px', height: '52px', borderRadius: '50%',
        background: showChat ? 'rgba(22,26,35,0.95)' : 'linear-gradient(135deg, #7C5CFF, #5B8CFF)',
        border: showChat ? '1px solid rgba(124,92,255,0.4)' : 'none',
        color: '#fff', cursor: 'pointer', zIndex: 9998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: showChat ? '0 0 20px rgba(124,92,255,0.2)' : '0 0 30px rgba(124,92,255,0.5), 0 4px 16px rgba(0,0,0,0.4)',
        transition: 'all 0.2s', animation: showChat ? 'none' : 'glowPulse 3s ease-in-out infinite'
      }}
        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.08)' }}
        onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        {showChat ? IC.close : IC.chat}
      </button>
    </div>
  )
}

export default Dashboard
