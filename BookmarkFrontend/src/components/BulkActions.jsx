// src/components/BulkActions.jsx
import { bookmarkAPI } from '../api/api'

const STATUS_OPTIONS = ['unread', 'reading', 'completed', 'archived']
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent']

function BulkActions({ selectedIds, onComplete, onClear }) {
  const userId = localStorage.getItem('userId')

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} bookmarks?`)) return
    try {
      await bookmarkAPI.bulkDelete(userId, selectedIds)
      onComplete('deleted')
    } catch (err) {
      console.error(err)
    }
  }

  const handleBulkStatus = async (status) => {
    try {
      await bookmarkAPI.bulkUpdate(userId, selectedIds, { status })
      onComplete('updated')
    } catch (err) {
      console.error(err)
    }
  }

  const handleBulkPriority = async (priority) => {
    try {
      await bookmarkAPI.bulkUpdate(userId, selectedIds, { priority })
      onComplete('updated')
    } catch (err) {
      console.error(err)
    }
  }

  const handleBulkFavorite = async () => {
    try {
      await bookmarkAPI.bulkUpdate(userId, selectedIds, { isFavorite: true })
      onComplete('updated')
    } catch (err) {
      console.error(err)
    }
  }

  const handleBulkArchive = async () => {
    try {
      await bookmarkAPI.bulkUpdate(userId, selectedIds, { status: 'archived' })
      onComplete('updated')
    } catch (err) {
      console.error(err)
    }
  }

  if (selectedIds.length === 0) return null

  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(0,245,255,0.3)', borderRadius: '14px',
      padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px',
      boxShadow: '0 0 30px rgba(0,245,255,0.2), 0 10px 40px rgba(0,0,0,0.8)',
      zIndex: 9000, animation: 'slideUp 0.3s ease-out', flexWrap: 'wrap'
    }}>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>

      <span style={{ color: '#00F5FF', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap' }}>
        ✓ {selectedIds.length} selected
      </span>

      <div style={{ width: '1px', height: '24px', background: 'rgba(0,245,255,0.2)' }} />

      <select onChange={e => e.target.value && handleBulkStatus(e.target.value)} defaultValue=""
        style={{ padding: '7px 12px', background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(0,245,255,0.3)', borderRadius: '8px', color: '#E5E7EB', fontSize: '13px', cursor: 'pointer' }}>
        <option value="" disabled>Set Status</option>
        {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ background: '#111827' }}>{s}</option>)}
      </select>

      <select onChange={e => e.target.value && handleBulkPriority(e.target.value)} defaultValue=""
        style={{ padding: '7px 12px', background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: '#E5E7EB', fontSize: '13px', cursor: 'pointer' }}>
        <option value="" disabled>Set Priority</option>
        {PRIORITY_OPTIONS.map(p => <option key={p} value={p} style={{ background: '#111827' }}>{p}</option>)}
      </select>

      <button onClick={handleBulkFavorite} style={{ padding: '7px 14px', background: 'rgba(255,165,0,0.15)', border: '1px solid rgba(255,165,0,0.3)', borderRadius: '8px', color: '#FFB800', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
        ⭐ Favorite
      </button>

      <button onClick={handleBulkArchive} style={{ padding: '7px 14px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: '#8B5CF6', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
        🗄️ Archive
      </button>

      <button onClick={handleBulkDelete} style={{ padding: '7px 14px', background: 'rgba(255,0,255,0.15)', border: '1px solid rgba(255,0,255,0.3)', borderRadius: '8px', color: '#FF00FF', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
        🗑️ Delete
      </button>

      <button onClick={onClear} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#9CA3AF', fontSize: '13px', cursor: 'pointer' }}>
        ✕ Clear
      </button>
    </div>
  )
}

export default BulkActions
