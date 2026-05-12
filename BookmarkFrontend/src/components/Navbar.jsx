// src/components/Navbar.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userAPI } from '../api/api'

const IC = {
  bookmark: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#ng)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7C5CFF"/><stop offset="100%" stopColor="#5B8CFF"/></linearGradient></defs><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  search: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6E7687" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  logout: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  cmd: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>,
}

function Navbar() {
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || ''

  const handleSearch = (e) => {
    e.preventDefault()
    if (q.trim()) { navigate(`/search?q=${encodeURIComponent(q.trim())}`); setQ('') }
  }
  const handleLogout = async () => {
    try { await userAPI.logout() } catch {}
    localStorage.removeItem('userId'); localStorage.removeItem('userName')
    window.dispatchEvent(new Event('storage')); navigate('/')
  }

  return (
    <nav style={{
      height: '64px', position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(15,17,23,0.85)', backdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px',
      boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)'
    }}>
      {/* Logo */}
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none', flexShrink: 0 }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(124,92,255,0.4)'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <span style={{ fontWeight: '700', fontSize: '16px', background: 'linear-gradient(135deg, #F5F7FA, #A7B0C0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Markly
        </span>
      </Link>

      {/* AI Search bar */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '480px', margin: '0 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: focused ? 'rgba(124,92,255,0.08)' : 'rgba(255,255,255,0.04)',
          border: focused ? '1px solid rgba(124,92,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', padding: '0 14px', height: '40px',
          transition: 'all 0.2s',
          boxShadow: focused ? '0 0 0 3px rgba(124,92,255,0.1), 0 0 20px rgba(124,92,255,0.08)' : 'none'
        }}>
          {IC.search}
          <input type="text" placeholder="Search bookmarks, tags, AI..." value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '13px', outline: 'none', color: '#F5F7FA' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', opacity: 0.4 }}>
            {IC.cmd}
            <span style={{ fontSize: '11px', color: '#6E7687' }}>K</span>
          </div>
        </div>
      </form>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* New bookmark */}
        <Link to="/bookmarks/new">
          <button style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)',
            color: '#fff', border: 'none', borderRadius: '10px',
            fontSize: '13px', fontWeight: '600',
            boxShadow: '0 0 20px rgba(124,92,255,0.35)',
            transition: 'all 0.2s'
          }}
            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(124,92,255,0.6)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(124,92,255,0.35)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {IC.plus} New bookmark
          </button>
        </Link>

        {/* User */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 12px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C5CFF, #57E6FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '700', color: '#fff',
            boxShadow: '0 0 10px rgba(124,92,255,0.4)'
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#A7B0C0' }}>{userName}</span>
        </div>

        {/* Sign out */}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 12px', background: 'transparent', color: '#6E7687',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
          fontSize: '13px', fontWeight: '500', transition: 'all 0.2s'
        }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6E7687'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
        >
          {IC.logout} Sign out
        </button>
      </div>
    </nav>
  )
}

export default Navbar
