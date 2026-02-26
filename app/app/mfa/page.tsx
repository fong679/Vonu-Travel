'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

function MFAFlow() {
  const [stage, setStage] = useState<'loading'|'enroll'|'verify'|'success'>('loading')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [factorId, setFactorId] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') // 'enroll' or 'verify'
  const supabase = createClient()

  useEffect(() => { init() }, [])

  async function init() {
    const { data: factors } = await supabase.auth.mfa.listFactors()
    const totp = factors?.totp || []
    const verified = totp.find(f => f.status === 'verified')
    const unverified = totp.find(f => f.status === 'unverified')

    if (mode === 'enroll' || (!verified && !unverified)) {
      // Need to enroll
      await startEnrollment()
    } else if (unverified) {
      // Have unverified factor, continue enrollment
      setFactorId(unverified.id)
      setStage('enroll')
    } else {
      // Already enrolled, need to verify
      setFactorId(verified!.id)
      setStage('verify')
    }
  }

  async function startEnrollment() {
    setLoading(true)
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Vonu-Travel Operator' })
    if (error) { setError(error.message); setLoading(false); return }
    setQrCode(data.totp.qr_code)
    setSecret(data.totp.secret)
    setFactorId(data.id)
    setStage('enroll')
    setLoading(false)
  }

  async function verifyEnrollment() {
    if (code.length !== 6) return
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
    if (error) { setError('Invalid code. Try again.'); setLoading(false); return }
    setStage('success')
    setTimeout(() => router.push('/operator'), 1500)
    setLoading(false)
  }

  async function verifyLogin() {
    if (code.length !== 6) return
    setLoading(true); setError('')
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId })
    if (cErr) { setError(cErr.message); setLoading(false); return }
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code })
    if (vErr) { setError('Invalid code. Try again.'); setLoading(false); return }
    router.push('/operator')
    setLoading(false)
  }

  const inp = { width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', fontSize: '1.5rem', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'Syne,sans-serif', fontWeight: 700, textAlign: 'center' as const, letterSpacing: '0.3em' }

  if (stage === 'loading') return (
    <div style={{ minHeight: '100vh', background: '#071e30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white', fontFamily: 'DM Sans,sans-serif' }}>Setting up security...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#071e30', fontFamily: 'DM Sans,sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="/login" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none' }}>←</a>
        <div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>Vonu<span style={{ color: '#ff5c3a' }}>-</span>Travel</div>
          <div style={{ fontSize: '0.72rem', color: '#7eabc5' }}>Operator Security</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* ENROLL */}
          {stage === 'enroll' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,92,58,0.12)', border: '2px solid rgba(255,92,58,0.3)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🔐</div>
                <p style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ff5c3a', marginBottom: 8 }}>Two-Factor Authentication</p>
                <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'white', marginBottom: 8 }}>Secure Your Account</h1>
                <p style={{ fontSize: '0.85rem', color: '#7eabc5', lineHeight: 1.6 }}>Scan this QR code with Google Authenticator, Authy, or any TOTP app.</p>
              </div>

              {/* QR Code */}
              {qrCode && (
                <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
                  <img src={qrCode} alt="MFA QR Code" style={{ width: 200, height: 200 }}/>
                </div>
              )}

              {/* Manual secret */}
              {secret && (
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7eabc5', marginBottom: 6 }}>Manual Entry Key</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'white', wordBreak: 'break-all', letterSpacing: '0.1em' }}>{secret}</div>
                </div>
              )}

              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7eabc5', display: 'block', marginBottom: 8 }}>Enter the 6-digit code from your app</label>
                <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" maxLength={6} style={inp} onKeyDown={e => e.key==='Enter'&&verifyEnrollment()}/>
              </div>

              {error && <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(255,92,58,0.1)', border: '1px solid rgba(255,92,58,0.3)', color: '#ff7a5c', fontSize: '0.82rem', textAlign: 'center', marginBottom: 12 }}>{error}</div>}

              <button onClick={verifyEnrollment} disabled={loading || code.length !== 6}
                style={{ width: '100%', padding: 15, background: '#ff5c3a', border: 'none', borderRadius: 14, color: 'white', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: loading || code.length !== 6 ? 0.6 : 1, boxShadow: '0 6px 24px rgba(255,92,58,0.4)' }}>
                {loading ? 'Verifying...' : 'Activate MFA →'}
              </button>
            </div>
          )}

          {/* VERIFY */}
          {stage === 'verify' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,92,58,0.12)', border: '2px solid rgba(255,92,58,0.3)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🔑</div>
                <p style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ff5c3a', marginBottom: 8 }}>Two-Factor Authentication</p>
                <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'white', marginBottom: 8 }}>Enter Your Code</h1>
                <p style={{ fontSize: '0.85rem', color: '#7eabc5', lineHeight: 1.6 }}>Open your authenticator app and enter the 6-digit code for Vonu-Travel.</p>
              </div>

              <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" maxLength={6} style={{ ...inp, marginBottom: 8 }} onKeyDown={e => e.key==='Enter'&&verifyLogin()}/>

              {error && <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(255,92,58,0.1)', border: '1px solid rgba(255,92,58,0.3)', color: '#ff7a5c', fontSize: '0.82rem', textAlign: 'center', marginBottom: 12 }}>{error}</div>}

              <button onClick={verifyLogin} disabled={loading || code.length !== 6}
                style={{ width: '100%', padding: 15, background: '#ff5c3a', border: 'none', borderRadius: 14, color: 'white', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: loading || code.length !== 6 ? 0.6 : 1, boxShadow: '0 6px 24px rgba(255,92,58,0.4)', marginBottom: 12 }}>
                {loading ? 'Verifying...' : 'Verify & Sign In →'}
              </button>

              <p style={{ color: '#7eabc5', fontSize: '0.82rem', textAlign: 'center' }}>
                Lost access to your authenticator?{' '}
                <a href="mailto:support@vonu-travel.com" style={{ color: '#ff5c3a' }}>Contact support</a>
              </p>
            </div>
          )}

          {/* SUCCESS */}
          {stage === 'success' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,165,80,0.15)', border: '2px solid #00a550', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>✓</div>
              <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'white', marginBottom: 8 }}>MFA Activated!</h1>
              <p style={{ fontSize: '0.85rem', color: '#7eabc5' }}>Redirecting to operator dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MFAPage() {
  return <Suspense><MFAFlow/></Suspense>
}
