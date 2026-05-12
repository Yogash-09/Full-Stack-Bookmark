// src/components/BookmarkCard.jsx
import { Link, useNavigate } from 'react-router-dom'
import { bookmarkAPI } from '../api/api'
import { useState } from 'react'
import { Toast } from './Toast'
import RelatedLinks from './RelatedLinks'

const STATUS = {
  unread:    { bg: 'rgba(91,140,255,0.12)', text: '#5B8CFF', dot: '#5B8CFF' },
  reading:   { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B', dot: '#F59E0B' },
  completed: { bg: 'rgba(16,185,129,0.12)', text: '#10B981', dot: '#10B981' },
  archived:  { bg: 'rgba(110,118,135,0.12)', text: '#6E7687', dot: '#6E7687' },
}
const PRIORITY_GLOW = { low: 'transparent', medium: '#7C5CFF', high: '#F59E0B', urgent: '#EF4444' }
const PRIORITY_COLOR = { low: '#6E7687', medium: '#7C5CFF', high: '#F59E0B', urgent: '#EF4444' }

const IC = {
  star: (f) => <svg width="15" height="15" viewBox="0 0 24 24" fill={f ? '#F59E0B' : 'none'} stroke={f ? '#F59E0B' : '#6E7687'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  pin: (a) => <svg width="13" height="13" viewBox="0 0 24 24" fill={a ? '#7C5CFF' : 'none'} stroke={a ? '#7C5CFF' : '#6E7687'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  edit: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>,
  note: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  link: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  sparkle: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75z"/></svg>,
  ext: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  eye: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  clock: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
}

function ActionBtn({ onClick, icon, label, active, danger }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '5px 9px', borderRadius: '7px', fontSize: '11px', fontWeight: '500',
        cursor: 'pointer', border: '1px solid', transition: 'all 0.15s', whiteSpace: 'nowrap',
        background: danger ? (hov ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)')
          : active ? 'rgba(124,92,255,0.15)' : (hov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'),
        color: danger ? '#EF4444' : active ? '#B388FF' : (hov ? '#F5F7FA' : '#A7B0C0'),
        borderColor: danger ? 'rgba(239,68,68,0.25)' : active ? 'rgba(124,92,255,0.3)' : 'rgba(255,255,255,0.06)'
      }}>
      {icon}{label}
    </button>
  )
}

function BookmarkCard({ bookmark, onDelete, onFavoriteToggle, isSelected, onSelect }) {
  const navigate = useNavigate()
  const [isFav, setIsFav] = useState(bookmark.isFavorite)
  const [isPinned, setIsPinned] = useState(bookmark.isPinned)
  const [status, setStatus] = useState(bookmark.status || 'unread')
  const [hovered, setHovered] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showLinks, setShowLinks] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [relatedLinks, setRelatedLinks] = useState(bookmark.relatedLinks || [])
  const [notes, setNotes] = useState(bookmark.notes || [])
  const [noteInput, setNoteInput] = useState('')
  const [toast, setToast] = useState(null)
  const userId = localStorage.getItem('userId')

  const toast_ = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500) }
  const getDomain = (url) => { try { return new URL(url).hostname.replace('www.', '') } catch { return '' } }

  const handleFav = async () => { try { await bookmarkAPI.toggleFavorite(bookmark._id, userId); setIsFav(f => !f); if (onFavoriteToggle) onFavoriteToggle() } catch {} }
  const handlePin = async () => { try { await bookmarkAPI.togglePin(bookmark._id, userId); setIsPinned(p => !p) } catch {} }
  const handleStatus = async (s) => { try { await bookmarkAPI.updateStatus(bookmark._id, userId, s); setStatus(s) } catch {} }
  const handleAddNote = async () => {
    if (!noteInput.trim()) return
    try { const r = await bookmarkAPI.addNote(bookmark._id, userId, noteInput.trim()); setNotes(r.data.notes); setNoteInput(''); toast_('Note added') } catch {}
  }
  const handleDeleteNote = async (nid) => { try { const r = await bookmarkAPI.deleteNote(bookmark._id, nid, userId); setNotes(r.data.notes) } catch {} }
  const handleClick = async () => { try { await bookmarkAPI.accessBookmark(bookmark._id, userId) } catch {} }
  const handleDelete = () => { if (confirm('Delete this bookmark?')) onDelete(bookmark._id) }

  const st = STATUS[status] || STATUS.unread
  const pColor = PRIORITY_COLOR[bookmark.priority] || PRIORITY_COLOR.medium
  const pGlow = PRIORITY_GLOW[bookmark.priority] || 'transparent'

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? 'rgba(28,34,48,0.95)' : 'rgba(22,26,35,0.8)',
          backdropFilter: 'blur(20px)',
          border: hovered ? '1px solid rgba(124,92,255,0.25)' : '1px solid rgba(255,255,255,0.06)',
          borderLeft: `2px solid ${pColor}`,
          borderRadius: '14px',
          padding: '16px 18px',
          transition: 'all 0.2s',
          boxShadow: hovered
            ? `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,92,255,0.1), inset 0 1px 0 rgba(255,255,255,0.04)`
            : '0 2px 8px rgba(0,0,0,0.2)',
          opacity: bookmark.isDead ? 0.5 : 1,
          animation: 'fadeUp 0.3s ease-out',
          position: 'relative', overflow: 'hidden'
        }}
      >
        {/* Subtle glow bg on hover */}
        {hovered && pGlow !== 'transparent' && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${pGlow}44, transparent)`, pointerEvents: 'none' }} />
        )}

        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          {onSelect && (
            <input type="checkbox" checked={isSelected} onChange={() => onSelect(bookmark._id)}
              style={{ marginTop: '4px', accentColor: '#7C5CFF', flexShrink: 0 }} />
          )}

          {/* Favicon / type badge */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '700', color: '#7C5CFF'
          }}>
            {bookmark.favicon
              ? <img src={bookmark.favicon} alt="" style={{ width: '20px', height: '20px', borderRadius: '4px' }} onError={e => { e.target.style.display = 'none'; e.target.parentNode.textContent = '#' }} />
              : (bookmark.contentType?.[0]?.toUpperCase() || '#')}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '5px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap', marginBottom: '3px' }}>
                  {isPinned && <span style={{ fontSize: '10px', padding: '1px 6px', background: 'rgba(124,92,255,0.15)', color: '#B388FF', borderRadius: '5px', fontWeight: '600', border: '1px solid rgba(124,92,255,0.2)' }}>Pinned</span>}
                  {bookmark.isDead && <span style={{ fontSize: '10px', padding: '1px 6px', background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '5px', fontWeight: '600' }}>Dead link</span>}
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer" onClick={handleClick}
                    style={{ fontSize: '14px', fontWeight: '600', color: '#F5F7FA', textDecoration: 'none', wordBreak: 'break-word', transition: 'color 0.15s' }}
                    onMouseOver={e => e.target.style.color = '#B388FF'} onMouseOut={e => e.target.style.color = '#F5F7FA'}>
                    {bookmark.title}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: '#6E7687' }}>{getDomain(bookmark.url)}</span>
                  {bookmark.category && (
                    <span style={{ fontSize: '11px', padding: '1px 7px', background: 'rgba(124,92,255,0.1)', color: '#B388FF', borderRadius: '5px', border: '1px solid rgba(124,92,255,0.15)' }}>
                      {bookmark.category}
                    </span>
                  )}
                  {bookmark.estimatedReadTime > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#6E7687' }}>
                      {IC.clock()} {bookmark.estimatedReadTime} min
                    </span>
                  )}
                </div>
              </div>

              {/* Star + Pin */}
              <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                <button onClick={handlePin} style={{ background: 'none', border: 'none', padding: '5px', cursor: 'pointer', opacity: isPinned ? 1 : 0.4, transition: 'opacity 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = isPinned ? '1' : '0.4'}>
                  {IC.pin(isPinned)}
                </button>
                <button onClick={handleFav} style={{ background: 'none', border: 'none', padding: '5px', cursor: 'pointer', transition: 'transform 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                  {IC.star(isFav)}
                </button>
              </div>
            </div>

            {/* Description */}
            {bookmark.description && (
              <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#A7B0C0', lineHeight: '1.55', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {bookmark.description}
              </p>
            )}

            {/* AI Summary */}
            {showAI && bookmark.aiSummary && (
              <div style={{ margin: '0 0 10px 0', padding: '10px 12px', background: 'rgba(124,92,255,0.06)', border: '1px solid rgba(124,92,255,0.15)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                  {IC.sparkle()}
                  <span style={{ fontSize: '11px', color: '#B388FF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Summary</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#A7B0C0', lineHeight: '1.55' }}>{bookmark.aiSummary}</p>
                {bookmark.aiKeyPoints?.length > 0 && (
                  <div style={{ marginTop: '7px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {bookmark.aiKeyPoints.map((kp, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <span style={{ color: '#7C5CFF', fontSize: '10px', marginTop: '3px', flexShrink: 0 }}>◆</span>
                        <span style={{ fontSize: '11px', color: '#A7B0C0' }}>{kp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Meta row */}
            <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: '#6E7687', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>{IC.eye()} {bookmark.viewCount || 0}</span>
              <span>{new Date(bookmark.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>

              {/* Status pill */}
              <select value={status} onChange={e => handleStatus(e.target.value)} style={{
                padding: '2px 8px', background: st.bg, color: st.text,
                border: `1px solid ${st.text}33`, borderRadius: '6px',
                fontSize: '11px', fontWeight: '600', cursor: 'pointer', outline: 'none'
              }}>
                <option value="unread">Unread</option>
                <option value="reading">Reading</option>
                <option value="completed">Done</option>
                <option value="archived">Archived</option>
              </select>

              <span style={{ fontSize: '11px', fontWeight: '600', color: pColor, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: pColor, display: 'inline-block' }} />
                {bookmark.priority}
              </span>
            </div>

            {/* Tags */}
            {bookmark.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {bookmark.tags.map(tag => (
                  <button key={tag} onClick={() => navigate(`/search?tag=${encodeURIComponent(tag)}`)}
                    style={{ padding: '2px 9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#A7B0C0', fontSize: '11px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.15s' }}
                    onMouseOver={e => { e.target.style.background = 'rgba(124,92,255,0.12)'; e.target.style.color = '#B388FF'; e.target.style.borderColor = 'rgba(124,92,255,0.25)' }}
                    onMouseOut={e => { e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.color = '#A7B0C0'; e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}>
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Related links — always visible */}
            {relatedLinks.length > 0 && (
              <div style={{ marginBottom: '10px', padding: '10px 12px', background: 'rgba(87,230,255,0.04)', border: '1px solid rgba(87,230,255,0.1)', borderRadius: '10px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#57E6FF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {IC.link()} Related links
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {relatedLinks.map((link, i) => (
                    <div key={link._id || i} style={{ display: 'flex', alignItems: 'baseline', gap: '7px' }}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: '#57E6FF', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}>
                        {IC.ext()} {link.url}
                      </a>
                      {link.description && <span style={{ fontSize: '11px', color: '#6E7687', flexShrink: 0 }}>— {link.description}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manage links panel */}
            {showLinks && <RelatedLinks bookmarkId={bookmark._id} initialLinks={relatedLinks} onUpdate={setRelatedLinks} />}

            {/* Notes panel */}
            {showNotes && (
              <div style={{ marginTop: '8px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '10px', color: '#A7B0C0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes</p>
                {notes.map(note => (
                  <div key={note._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#A7B0C0', flex: 1 }}>{note.content}</p>
                    <button onClick={() => handleDeleteNote(note._id)} style={{ background: 'none', border: 'none', color: '#6E7687', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}
                      onMouseOver={e => e.target.style.color = '#EF4444'} onMouseOut={e => e.target.style.color = '#6E7687'}>×</button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <input value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                    placeholder="Add a note..." style={{ flex: 1, padding: '6px 10px', borderRadius: '7px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#F5F7FA', outline: 'none' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(124,92,255,0.5)' }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
                  />
                  <button onClick={handleAddNote} style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }}>Add</button>
                </div>
              </div>
            )}

            {/* Action row — always visible */}
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Link to={`/bookmarks/edit/${bookmark._id}`}>
                <ActionBtn icon={IC.edit()} label="Edit" />
              </Link>
              <ActionBtn onClick={() => setShowLinks(v => !v)} icon={IC.link()} label={`Links${relatedLinks.length > 0 ? ` (${relatedLinks.length})` : ''}`} active={showLinks} />
              <ActionBtn onClick={() => setShowNotes(v => !v)} icon={IC.note()} label={`Notes${notes.length > 0 ? ` (${notes.length})` : ''}`} active={showNotes} />
              <ActionBtn onClick={() => setShowAI(v => !v)} icon={IC.sparkle()} label="AI" active={showAI} />
              <ActionBtn onClick={handleDelete} icon={IC.trash()} label="Delete" danger />
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.msg} type={toast.type} duration={2500} />}
    </>
  )
}

export default BookmarkCard
