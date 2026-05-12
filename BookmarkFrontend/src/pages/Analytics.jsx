// src/pages/Analytics.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { analyticsAPI, aiAPI } from '../api/api'

const BAR_COLORS = ['#00F5FF', '#8B5CF6', '#FF00FF', '#FFB800', '#00FF80', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

function BarChart({ data, labelKey, valueKey, title, color = '#00F5FF' }) {
  if (!data?.length) return <p style={{ color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No data available</p>
  const max = Math.max(...data.map(d => d[valueKey]))
  return (
    <div>
      {title && <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#9CA3AF', width: '100px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item[labelKey]}>{item[labelKey]}</span>
            <div style={{ flex: 1, height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${max > 0 ? (item[valueKey] / max) * 100 : 0}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: '4px', transition: 'width 0.8s ease', minWidth: item[valueKey] > 0 ? '4px' : '0' }} />
            </div>
            <span style={{ fontSize: '12px', color, fontWeight: '700', width: '28px', textAlign: 'right', flexShrink: 0 }}>{item[valueKey]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DonutChart({ data, title }) {
  if (!data || Object.keys(data).length === 0) return <p style={{ color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No data</p>
  const total = Object.values(data).reduce((a, b) => a + b, 0)
  if (total === 0) return <p style={{ color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No data</p>

  let cumulative = 0
  const segments = Object.entries(data).map(([label, value], i) => {
    const pct = (value / total) * 100
    const start = cumulative
    cumulative += pct
    return { label, value, pct, start, color: BAR_COLORS[i % BAR_COLORS.length] }
  })

  const radius = 60, cx = 80, cy = 80, strokeWidth = 22
  const circumference = 2 * Math.PI * radius

  return (
    <div>
      {title && <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
          {segments.map((seg, i) => (
            <circle key={i} cx={cx} cy={cy} r={radius} fill="none" stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${(seg.pct / 100) * circumference} ${circumference}`}
              strokeDashoffset={-((seg.start / 100) * circumference)}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-dasharray 0.8s ease' }} />
          ))}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="#E5E7EB" fontSize="20" fontWeight="bold">{total}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="#9CA3AF" fontSize="10">total</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {segments.map((seg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: seg.color, flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{seg.label}</span>
              <span style={{ fontSize: '12px', color: seg.color, fontWeight: '700' }}>{seg.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color = '#00F5FF', sub }) {
  return (
    <div style={{ padding: '20px', background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: `1px solid rgba(${hexToRgb(color)},0.2)`, boxShadow: `0 0 20px rgba(${hexToRgb(color)},0.08)`, transition: 'all 0.3s' }}
      onMouseOver={e => { e.currentTarget.style.borderColor = `rgba(${hexToRgb(color)},0.4)`; e.currentTarget.style.boxShadow = `0 0 30px rgba(${hexToRgb(color)},0.15)`; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = `rgba(${hexToRgb(color)},0.2)`; e.currentTarget.style.boxShadow = `0 0 20px rgba(${hexToRgb(color)},0.08)`; }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '28px' }}>{icon}</span>
        <div>
          <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color, lineHeight: 1 }}>{value}</p>
          {sub && <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#9CA3AF' }}>{sub}</p>}
        </div>
      </div>
    </div>
  )
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '0,245,255'
}

function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(true)
  const userId = localStorage.getItem('userId')

  useEffect(() => {
    Promise.all([
      analyticsAPI.getAnalytics(userId),
      aiAPI.getRecommendations(userId)
    ]).then(([aRes, rRes]) => {
      setAnalytics(aRes.data)
      setRecommendations(rRes.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #0D0D0D, #111827)', fontFamily: 'Arial, sans-serif' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 80px)' }}>
        <p style={{ color: '#00F5FF', fontSize: '18px', fontWeight: 'bold' }}>⏳ Loading analytics...</p>
      </div>
    </div>
  )

  const a = analytics

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #0D0D0D, #111827)', fontFamily: 'Arial, sans-serif', backgroundAttachment: 'fixed' }}>
      <Navbar />
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #00F5FF, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>📊 Smart Analytics</h1>
            <p style={{ margin: 0, color: '#9CA3AF', fontSize: '14px' }}>Insights into your bookmark collection</p>
          </div>
          <Link to="/dashboard"><button style={{ padding: '10px 20px', background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', borderRadius: '8px', color: '#00F5FF', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>← Dashboard</button></Link>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <StatCard icon="📚" label="Total Bookmarks" value={a?.total || 0} color="#00F5FF" />
          <StatCard icon="⭐" label="Favorites" value={a?.favorites || 0} color="#FFB800" />
          <StatCard icon="📌" label="Pinned" value={a?.pinned || 0} color="#8B5CF6" />
          <StatCard icon="✅" label="Completed" value={a?.statusDist?.completed || 0} color="#00FF80" sub={`${a?.completionRate || 0}% completion rate`} />
          <StatCard icon="📖" label="Unread" value={a?.statusDist?.unread || 0} color="#00F5FF" />
          <StatCard icon="💀" label="Dead Links" value={a?.dead || 0} color="#FF4444" />
          <StatCard icon="⏱️" label="Total Read Time" value={`${a?.totalReadTime || 0}m`} color="#4ECDC4" sub="estimated" />
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0,245,255,0.15)' }}>
            <DonutChart data={a?.statusDist} title="📖 Reading Status" />
          </div>
          <div style={{ background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.15)' }}>
            <DonutChart data={a?.contentTypeDist} title="🎯 Content Types" />
          </div>
          <div style={{ background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,165,0,0.15)' }}>
            <DonutChart data={a?.priorityDist} title="⚡ Priority Distribution" />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0,245,255,0.15)' }}>
            <BarChart data={a?.topTags} labelKey="tag" valueKey="count" title="🏷️ Top Tags" color="#8B5CF6" />
          </div>
          <div style={{ background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0,245,255,0.15)' }}>
            <BarChart data={a?.topDomains} labelKey="domain" valueKey="count" title="🌐 Top Domains" color="#00F5FF" />
          </div>
        </div>

        {/* Monthly Activity */}
        <div style={{ background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0,245,255,0.15)', marginBottom: '20px' }}>
          <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📈 Monthly Activity (Last 6 Months)</p>
          {a?.monthlyActivity && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '120px' }}>
              {a.monthlyActivity.map((m, i) => {
                const max = Math.max(...a.monthlyActivity.map(x => x.count), 1)
                const height = Math.max((m.count / max) * 100, m.count > 0 ? 8 : 0)
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#00F5FF', fontWeight: '700' }}>{m.count}</span>
                    <div style={{ width: '100%', height: `${height}%`, minHeight: m.count > 0 ? '8px' : '2px', background: `linear-gradient(180deg, #00F5FF, #8B5CF6)`, borderRadius: '4px 4px 0 0', transition: 'height 0.8s ease', opacity: m.count > 0 ? 1 : 0.2 }} />
                    <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{m.month}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Most Viewed + Recommendations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0,245,255,0.15)' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔥 Most Viewed</p>
            {a?.mostViewed?.length > 0 ? a.mostViewed.map((b, i) => (
              <div key={b._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(0,245,255,0.06)' }}>
                <span style={{ fontSize: '14px', color: '#00F5FF', fontWeight: '800', width: '20px' }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <a href={b.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#E5E7EB', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    onMouseOver={e => e.target.style.color = '#00F5FF'} onMouseOut={e => e.target.style.color = '#E5E7EB'}>{b.title}</a>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>{b.domain}</p>
                </div>
                <span style={{ fontSize: '12px', color: '#00F5FF', fontWeight: '700', flexShrink: 0 }}>👁️ {b.viewCount}</span>
              </div>
            )) : <p style={{ color: '#9CA3AF', fontSize: '13px' }}>No data yet</p>}
          </div>

          <div style={{ background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.15)' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🤖 AI Recommendations</p>
            {recommendations?.recommendations?.map((r, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', marginBottom: '8px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#E5E7EB' }}>💡 {r}</p>
              </div>
            ))}
            {recommendations?.relatedTopics?.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#9CA3AF' }}>Explore these topics:</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {recommendations.relatedTopics.map(t => (
                    <span key={t} style={{ padding: '4px 10px', background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '12px', fontSize: '12px', color: '#00F5FF' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Learning Paths */}
        {recommendations?.learningPaths?.length > 0 && (
          <div style={{ background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0,245,255,0.15)' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🎓 Suggested Learning Paths</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {recommendations.learningPaths.map(lp => (
                <div key={lp.category} style={{ padding: '16px', background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)', borderRadius: '10px' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#00F5FF' }}>🚀 {lp.category}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {lp.path.map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,245,255,0.15)', border: '1px solid rgba(0,245,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#00F5FF', fontWeight: '700', flexShrink: 0 }}>{i + 1}</div>
                        <span style={{ fontSize: '12px', color: '#E5E7EB' }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics
