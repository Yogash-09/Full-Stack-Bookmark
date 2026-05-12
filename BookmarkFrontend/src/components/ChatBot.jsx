// src/components/ChatBot.jsx
import { useState, useRef, useEffect } from 'react'
import { aiAPI } from '../api/api'

const SUGGESTIONS = ['Show my React tutorials', 'Find unread bookmarks', 'Show my favourites', 'Find video resources']

function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I\'m your AI bookmark assistant.\n\nTry: "Show my React tutorials" or "Find unread bookmarks"' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)
  const userId = localStorage.getItem('userId')

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const msg = text || input.trim(); if (!msg) return
    setInput(''); setMessages(prev => [...prev, { role: 'user', text: msg }]); setLoading(true)
    try {
      const res = await aiAPI.chat(msg, userId)
      const { message, bookmarks, totalFound } = res.data
      setMessages(prev => [...prev, { role: 'assistant', text: message, bookmarks: bookmarks || [], totalFound }])
    } catch { setMessages(prev => [...prev, { role: 'assistant', text: 'Something went wrong. Please try again.' }]) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', bottom: '92px', right: '28px', width: '360px', height: '500px', background: 'rgba(15,17,23,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(124,92,255,0.25)', borderRadius: '20px', boxShadow: '0 0 40px rgba(124,92,255,0.15), 0 24px 64px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', zIndex: 9999, overflow: 'hidden', animation: 'fadeUp 0.25s ease-out' }}>
      <style>{`::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(124,92,255,0.3);border-radius:2px}@keyframes chatBounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>

      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(124,92,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(124,92,255,0.4)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/></svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#F5F7FA' }}>AI Assistant</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#6E7687' }}>Powered by smart search</p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6E7687', cursor: 'pointer', fontSize: '18px', padding: '4px', lineHeight: 1, transition: 'color 0.15s' }}
          onMouseOver={e => e.target.style.color = '#EF4444'} onMouseOut={e => e.target.style.color = '#6E7687'}>×</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '85%', padding: '9px 13px', borderRadius: msg.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px', background: msg.role === 'user' ? 'linear-gradient(135deg, #7C5CFF, #5B8CFF)' : 'rgba(255,255,255,0.05)', border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.07)', color: '#F5F7FA', fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap', boxShadow: msg.role === 'user' ? '0 0 16px rgba(124,92,255,0.25)' : 'none' }}>
              {msg.text}
            </div>
            {msg.bookmarks?.length > 0 && (
              <div style={{ maxWidth: '95%', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {msg.bookmarks.slice(0, 5).map(b => (
                  <a key={b._id} href={b.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '8px 11px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '9px', textDecoration: 'none', transition: 'all 0.15s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(124,92,255,0.3)'; e.currentTarget.style.background = 'rgba(124,92,255,0.08)' }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}>
                    <p style={{ margin: '0 0 1px 0', fontSize: '12px', fontWeight: '600', color: '#F5F7FA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#6E7687' }}>{b.domain || b.url.substring(0, 40)}</p>
                  </a>
                ))}
                {msg.totalFound > 5 && <p style={{ margin: '2px 0 0 4px', fontSize: '11px', color: '#6E7687' }}>+{msg.totalFound - 5} more</p>}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px 14px 14px 3px' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0,1,2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7C5CFF', animation: `chatBounce 1s ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '5px', overflowX: 'auto' }}>
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => send(s)} style={{ padding: '4px 10px', background: 'rgba(124,92,255,0.08)', border: '1px solid rgba(124,92,255,0.15)', borderRadius: '8px', color: '#A7B0C0', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
            onMouseOver={e => { e.target.style.background = 'rgba(124,92,255,0.18)'; e.target.style.color = '#B388FF'; e.target.style.borderColor = 'rgba(124,92,255,0.35)' }}
            onMouseOut={e => { e.target.style.background = 'rgba(124,92,255,0.08)'; e.target.style.color = '#A7B0C0'; e.target.style.borderColor = 'rgba(124,92,255,0.15)' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about your bookmarks..."
          style={{ flex: 1, padding: '9px 12px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '13px', outline: 'none', color: '#F5F7FA', background: 'rgba(255,255,255,0.04)', transition: 'all 0.2s' }}
          onFocus={e => { e.target.style.borderColor = 'rgba(124,92,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,92,255,0.1)' }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{ padding: '9px 14px', background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer', opacity: loading || !input.trim() ? 0.4 : 1, transition: 'all 0.15s', boxShadow: '0 0 12px rgba(124,92,255,0.25)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  )
}
export default ChatBot
