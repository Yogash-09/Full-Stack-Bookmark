// src/components/Toast.jsx
import { useState, useEffect } from 'react'

export function Toast({ message, type = 'success', duration = 3000 }) {
  const [visible, setVisible] = useState(true)
  useEffect(() => { const t = setTimeout(() => setVisible(false), duration); return () => clearTimeout(t) }, [duration])
  if (!visible) return null
  const s = {
    success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: '#10B981', icon: '✓' },
    error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  text: '#EF4444', icon: '✕' },
    info:    { bg: 'rgba(124,92,255,0.12)', border: 'rgba(124,92,255,0.25)', text: '#B388FF', icon: 'i' },
    warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#F59E0B', icon: '!' },
  }[type] || { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: '#10B981', icon: '✓' }
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000, background: 'rgba(22,26,35,0.95)', backdropFilter: 'blur(20px)', border: `1px solid ${s.border}`, borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: `0 0 20px ${s.border}, 0 8px 32px rgba(0,0,0,0.4)`, animation: 'slideIn 0.25s ease-out', fontSize: '13px', fontWeight: '500', color: s.text, maxWidth: '360px' }}>
      <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>{s.icon}</span>
      <span style={{ color: '#F5F7FA' }}>{message}</span>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState([])
  const show = (message, type = 'success', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }
  return { toasts, show }
}
