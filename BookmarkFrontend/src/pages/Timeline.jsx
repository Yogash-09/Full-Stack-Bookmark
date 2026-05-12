// src/pages/Timeline.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { analyticsAPI } from '../api/api'

const STATUS_COLORS = { unread: '#00F5FF', reading: '#FFB800', completed: '#00FF80', archived: '#9CA3AF' }
const CONTENT_ICONS = { tutorial: '🎓', article: '📰', documentation: '📚', video: '🎬', research: '🔬', entertainment: '🎮', other: '🔗' }

function Timeline() {
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const userId = localStorage.getItem('userId')

  useEffect(() => {
    analyticsAPI.getTimeline(userId)
      .then(res => setTimeline(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const groupByDate = (items) => {
    const groups = {}
    items.forEach(item => {
      const date = new Date(item.createdAt)
      const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    return groups
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #0D0D0D, #111827)', fontFamily: 'Arial, sans-serif' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 80px)' }}>
        <p style={{ color: '#00F5FF', fontSize: '18px', fontWeight: 'bold' }}>⏳ Loading timeline...</p>
      </div>
    </div>
  )

  const grouped = groupByDate(timeline)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #0D0D0D, #111827)', fontFamily: 'Arial, sans-serif', backgroundAttachment: 'fixed' }}>
      <Navbar />
      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #00F5FF, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>⏱️ Activity Timeline</h1>
            <p style={{ margin: 0, color: '#9CA3AF', fontSize: '14px' }}>Your bookmark history</p>
          </div>
          <Link to="/dashboard"><button style={{ padding: '10px 20px', background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', borderRadius: '8px', color: '#00F5FF', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>← Dashboard</button></Link>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(17,24,39,0.4)', borderRadius: '12px', border: '1px solid rgba(0,245,255,0.15)' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>📭</p>
            <p style={{ color: '#9CA3AF', fontSize: '16px' }}>No bookmark history yet</p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(180deg, #00F5FF, #8B5CF6, transparent)', opacity: 0.3 }} />

            {Object.entries(grouped).map(([date, items]) => (
              <div key={date} style={{ marginBottom: '32px', paddingLeft: '52px', position: 'relative' }}>
                {/* Date dot */}
                <div style={{ position: 'absolute', left: '10px', top: '6px', width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #00F5FF, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', boxShadow: '0 0 10px rgba(0,245,255,0.4)' }}>📅</div>

                <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#00F5FF', fontWeight: '700' }}>{date}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {items.map(item => (
                    <div key={item._id} style={{ padding: '14px 18px', background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(10px)', borderRadius: '10px', border: '1px solid rgba(0,245,255,0.12)', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(0,245,255,0.3)'; e.currentTarget.style.background = 'rgba(0,245,255,0.04)'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(0,245,255,0.12)'; e.currentTarget.style.background = 'rgba(17,24,39,0.4)'; }}>

                      <span style={{ fontSize: '22px', flexShrink: 0 }}>{CONTENT_ICONS[item.contentType] || '🔗'}</span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '14px', fontWeight: '600', color: '#E5E7EB', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          onMouseOver={e => e.target.style.color = '#00F5FF'} onMouseOut={e => e.target.style.color = '#E5E7EB'}>
                          {item.title}
                        </a>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{item.domain}</span>
                          {item.category && <span style={{ fontSize: '11px', color: '#8B5CF6', background: 'rgba(139,92,246,0.1)', padding: '1px 6px', borderRadius: '6px' }}>{item.category}</span>}
                          {item.tags?.slice(0, 2).map(t => <span key={t} style={{ fontSize: '11px', color: '#9CA3AF', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '6px' }}>#{t}</span>)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', background: `rgba(${STATUS_COLORS[item.status]?.replace('#', '').match(/.{2}/g)?.map(h => parseInt(h, 16)).join(',') || '0,245,255'},0.1)`, border: `1px solid rgba(${STATUS_COLORS[item.status]?.replace('#', '').match(/.{2}/g)?.map(h => parseInt(h, 16)).join(',') || '0,245,255'},0.3)`, borderRadius: '6px', color: STATUS_COLORS[item.status] || '#00F5FF', fontWeight: '600' }}>{item.status}</span>
                        {item.isFavorite && <span style={{ fontSize: '14px' }}>⭐</span>}
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>👁️ {item.viewCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Timeline
