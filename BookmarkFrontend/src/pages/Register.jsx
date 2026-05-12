// src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { userAPI } from '../api/api'

const inp = { width: '100%', padding: '11px 14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#F5F7FA', borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }
const fi = e => { e.target.style.borderColor = 'rgba(124,92,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,92,255,0.1)' }
const fo = e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }

function Register({ onRegister }) {
  const [form, setForm] = useState({ name: '', email: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try { const r = await userAPI.createUser(form); localStorage.setItem('userId', r.data._id); localStorage.setItem('userName', r.data.name); onRegister(); navigate('/dashboard') }
    catch (err) { setError(err.response?.data?.error || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'rgba(22,26,35,0.9)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '380px', boxShadow: '0 0 60px rgba(124,92,255,0.08), 0 24px 64px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 20px rgba(124,92,255,0.35)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#F5F7FA', marginBottom: '4px' }}>Create account</h2>
          <p style={{ fontSize: '13px', color: '#6E7687' }}>Start building your knowledge base</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#A7B0C0', marginBottom: '6px' }}>Full name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required disabled={loading} placeholder="Jane Smith" style={inp} onFocus={fi} onBlur={fo} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#A7B0C0', marginBottom: '6px' }}>Email address</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required disabled={loading} placeholder="you@example.com" style={inp} onFocus={fi} onBlur={fo} />
          </div>
          {error && <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontSize: '12px', color: '#EF4444' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ padding: '12px', background: loading ? 'rgba(124,92,255,0.4)' : 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 0 20px rgba(124,92,255,0.3)', marginTop: '4px' }}
            onMouseOver={e => { if (!loading) e.currentTarget.style.boxShadow = '0 0 30px rgba(124,92,255,0.5)' }}
            onMouseOut={e => { if (!loading) e.currentTarget.style.boxShadow = '0 0 20px rgba(124,92,255,0.3)' }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#6E7687', marginTop: '20px' }}>
          Already have an account? <Link to="/login" style={{ color: '#B388FF', fontWeight: '600' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
export default Register
