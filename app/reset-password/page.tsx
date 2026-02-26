'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetForm() {
  const [stage, setStage] = useState<'request'|'reset'|'done'>('request')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // If we have a code in URL, user clicked reset link from email
    const code = searchParams.get('code')
    if (code) setStage('reset')
  }, [])

  async function handleRequest() {
    if (!email) return
    setLoading(true); setMessage('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) setMessage(error.message)
    else setStage('done')
    setLoading(false)
  }

  async function handleReset() {
    if (!password || password !== confirm) { setMessage('Passwords do not match'); return }
    if (password.length < 6) { setMessage('Password must be at least 6 characters'); return }
    setLoading(true); setMessage('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setMessage(error.message)
    else { setMessage('Password updated!'); setTimeout(() => router.push('/login'), 1500) }
    setLoading(false)
  }

  const inp = { width: '100%', padding: '13px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'DM Sans,sans-serif' }

  return (
    <div style={{ minHeight: '100vh', background: '#071e30', display: 'flex', flexDirection: 'column', fontFamily: 'DM Sans,sans-serif' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="/login" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none' }}>←</a>
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'white' }}>Vonu<span style={{ color: '#ff5c3a' }}>-</span>Travel</div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* REQUEST STAGE */}
          {stage === 'request' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,92,58,0.12)', border: '2px solid rgba(255,92,58,0.3)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🔑</div>
                <p style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ff5c3a', marginBottom: 8 }}>Account Recovery</p>
                <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.6rem', color: 'white', marginBottom: 8 }}>Forgot Password?</h1>
                <p style={{ fontSize: '0.85rem', color: '#7eabc5', lineHeight: 1.6 }}>Enter your email and we'll send you a link to reset your password.</p>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7eabc5', display: 'block', marginBottom: 6 }}>Email Address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" style={inp} onKeyDown={e => e.key === 'Enter' && handleRequest()}/>
              </div>
              {message && <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(255,92,58,0.1)', border: '1px solid rgba(255,92,58,0.3)', color: '#ff7a5c', fontSize: '0.82rem', textAlign: 'center', marginBottom: 12 }}>{message}</div>}
              <button onClick={handleRequest} disabled={loading || !email}
                style={{ width: '100%', padding: 15, background: '#ff5c3a', border: 'none', borderRadius: 14, color: 'white', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: loading || !email ? 0.6 : 1, boxShadow: '0 6px 24px rgba(255,92,58,0.4)', marginBottom: 16 }}>
                {loading ? 'Sending...' : 'Send Reset Link →'}
              </button>
              <p style={{ color: '#7eabc5', fontSize: '0.85rem', textAlign: 'center' }}>
                Remember your password? <a href="/login" style={{ color: '#ff5c3a', fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
              </p>
            </>
          )}

          {/* DONE STAGE */}
          {stage === 'done' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,165,80,0.15)', border: '2px solid #00a550', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>✉️</div>
              <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'white', marginBottom: 12 }}>Check Your Email</h1>
              <p style={{ fontSize: '0.85rem', color: '#7eabc5', lineHeight: 1.6, marginBottom: 24 }}>We've sent a password reset link to <strong style={{ color: 'white' }}>{email}</strong>. Click the link in the email to set a new password.</p>
              <div style={{ padding: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: '0.8rem', color: '#7eabc5', marginBottom: 20, lineHeight: 1.6 }}>
                💡 Don't see it? Check your spam folder. The link expires in 1 hour.
              </div>
              <a href="/login" style={{ display: 'block', padding: '13px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center', textDecoration: 'none' }}>Back to Sign In</a>
            </div>
          )}

          {/* RESET STAGE */}
          {stage === 'reset' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,92,58,0.12)', border: '2px solid rgba(255,92,58,0.3)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🔐</div>
                <p style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ff5c3a', marginBottom: 8 }}>Set New Password</p>
                <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.6rem', color: 'white', marginBottom: 8 }}>Create New Password</h1>
                <p style={{ fontSize: '0.85rem', color: '#7eabc5' }}>Choose a strong password for your account.</p>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7eabc5', display: 'block', marginBottom: 6 }}>New Password</label>
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" type="password" style={inp}/>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7eabc5', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" type="password" style={inp} onKeyDown={e => e.key === 'Enter' && handleReset()}/>
              </div>

              {/* Password strength */}
              {password && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: password.length >= i*3 ? i<=1?'#ff5c3a':i<=2?'#f5c842':i<=3?'#7eabc5':'#4dd882' : 'rgba(255,255,255,0.1)' }}/>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#7eabc5' }}>{password.length < 6 ? 'Too short' : password.length < 9 ? 'Weak' : password.length < 12 ? 'Good' : 'Strong'}</div>
                </div>
              )}

              {confirm && password !== confirm && (
                <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,92,58,0.08)', border: '1px solid rgba(255,92,58,0.2)', color: '#ff7a5c', fontSize: '0.78rem', marginBottom: 12 }}>Passwords don't match</div>
              )}

              {message && (
                <div style={{ padding: '10px', borderRadius: 8, background: message.includes('updated') ? 'rgba(0,165,80,0.1)' : 'rgba(255,92,58,0.1)', border: `1px solid ${message.includes('updated') ? 'rgba(0,165,80,0.3)' : 'rgba(255,92,58,0.3)'}`, color: message.includes('updated') ? '#4dd882' : '#ff7a5c', fontSize: '0.82rem', textAlign: 'center', marginBottom: 12 }}>{message}</div>
              )}

              <button onClick={handleReset} disabled={loading || !password || password !== confirm}
                style={{ width: '100%', padding: 15, background: '#ff5c3a', border: 'none', borderRadius: 14, color: 'white', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: loading || !password || password !== confirm ? 0.6 : 1, boxShadow: '0 6px 24px rgba(255,92,58,0.4)' }}>
                {loading ? 'Updating...' : 'Update Password →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm/></Suspense>
}
