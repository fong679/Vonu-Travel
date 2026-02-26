'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export default function LandingPage() {
  const [currentVideo, setCurrentVideo] = useState(0)
  const supabase = createClient()

  const videos = [
    'https://assets.mixkit.co/videos/preview/mixkit-boat-sailing-in-the-sea-1738-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-ocean-waves-under-a-blue-sky-4932-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-the-sea-1178-large.mp4',
  ]

  // Auto rotate videos
  useEffect(() => {
    const iv = setInterval(() => setCurrentVideo(v => (v + 1) % videos.length), 6000)
    return () => clearInterval(iv)
  }, [])

  // 30 min inactivity logout
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    function resetTimer() {
      clearTimeout(timer)
      timer = setTimeout(async () => {
        await supabase.auth.signOut()
      }, 30 * 60 * 1000)
    }
    const events = ['mousemove','keydown','touchstart','click','scroll']
    events.forEach(e => window.addEventListener(e, resetTimer))
    resetTimer()
    return () => {
      clearTimeout(timer)
      events.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'DM Sans,sans-serif', position: 'relative', overflow: 'hidden', background: '#071e30' }}>
      {/* Video Background */}
      {videos.map((src, i) => (
        <video key={i} autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: i === currentVideo ? 1 : 0, transition: 'opacity 1.5s ease', zIndex: 0 }}>
          <source src={src} type="video/mp4"/>
        </video>
      ))}

      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,30,48,0.6) 0%, rgba(7,30,48,0.2) 40%, rgba(7,30,48,0.9) 100%)', zIndex: 1 }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 480, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 16px' }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.4rem', color: 'white' }}>
            Vonu<span style={{ color: '#ff5c3a' }}>-</span>Travel
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="/login?mode=signin" style={{ padding: '8px 18px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.4)', color: 'white', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>Sign In</a>
            <a href="/login?mode=signup" style={{ padding: '8px 18px', borderRadius: 20, border: 'none', background: '#ff5c3a', color: 'white', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(255,92,58,0.5)' }}>Sign Up</a>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 24px 100px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ff5c3a', background: 'rgba(255,92,58,0.15)', border: '1px solid rgba(255,92,58,0.4)', padding: '4px 12px', borderRadius: 20, display: 'inline-block', marginBottom: 16 }}>🇫🇯 Fiji Ferry Booking</span>

          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '2.6rem', lineHeight: 1.1, color: 'white', marginBottom: 16, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            Explore Fiji's<br/><span style={{ color: '#ff5c3a' }}>Islands</span> by Sea
          </h1>

          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 28, textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
            Book ferry tickets across Fiji's most beautiful routes. Fast, simple, and built for island life.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {['Suva → Savusavu', 'Suva → Taveuni', 'Suva → Kadavu', 'Lautoka → Yasawa'].map(r => (
              <span key={r} style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '0.8rem' }}>{r}</span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a href="/login?mode=signup" style={{ display: 'block', padding: '16px', background: '#ff5c3a', borderRadius: 14, color: 'white', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1rem', textAlign: 'center', textDecoration: 'none', boxShadow: '0 8px 28px rgba(255,92,58,0.5)' }}>
              Start Booking
            </a>
            <a href="/" style={{ display: 'block', padding: '16px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14, color: 'white', fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: '0.95rem', textAlign: 'center', textDecoration: 'none' }}>
              Browse as Guest
            </a>
          </div>

          {/* Video dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
            {videos.map((_, i) => (
              <div key={i} onClick={() => setCurrentVideo(i)}
                style={{ width: i === currentVideo ? 20 : 6, height: 6, borderRadius: 3, background: i === currentVideo ? '#ff5c3a' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s', cursor: 'pointer' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
