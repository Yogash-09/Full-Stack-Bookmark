// src/pages/LandingPage.jsx
import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: '#0F1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'rgba(22,26,35,0.9)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '56px 48px', width: '100%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 0 60px rgba(124,92,255,0.1), 0 24px 64px rgba(0,0,0,0.5)' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 30px rgba(124,92,255,0.4)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #F5F7FA, #A7B0C0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>Markly</h1>
        <p style={{ fontSize: '14px', color: '#6E7687', marginBottom: '36px', lineHeight: '1.6' }}>Your AI-powered bookmark manager. Organise, discover, and learn.</p>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,92,255,0.3), transparent)', marginBottom: '28px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => navigate('/login')} style={{ padding: '13px', background: 'linear-gradient(135deg, #7C5CFF, #5B8CFF)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 0 20px rgba(124,92,255,0.35)', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(124,92,255,0.6)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(124,92,255,0.35)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            Sign in
          </button>
          <button onClick={() => navigate('/register')} style={{ padding: '13px', background: 'rgba(255,255,255,0.04)', color: '#A7B0C0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#F5F7FA' }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#A7B0C0' }}>
            Create account
          </button>
        </div>
      </div>
    </div>
  )
}
export default LandingPage
