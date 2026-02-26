'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [swipeHint, setSwipeHint] = useState(true)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const router = useRouter()
  const supabase = createClient()

  const videos = [
    'https://assets.mixkit.co/videos/preview/mixkit-boat-sailing-in-the-sea-1738-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-ocean-waves-under-a-blue-sky-4932-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-the-sea-1178-large.mp4',
  ]

  const gradients = [
    'linear-gradient(135deg, #071e30 0%, #0e3d5c 40%, #1a6b8a 70%, #071e30 100%)',
    'linear-gradient(135deg, #0a2a1e 0%, #0d4a35 40%, #1a7a5a 70%, #071e30 100%)',
    'linear-gradient(135deg, #1a0e30 0%, #2d1b5c 40%, #3d2a8a 70%, #071e30 100%)',
  ]

  useEffect(() => {
    const iv = setInterval(() => setCurrentVideo(v => (v + 1) % videos.length), 6000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setSwipeHint(false), 4000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    function resetTimer() {
      clearTimeout(timer)
      timer = setTimeout(async () => { await supabase.auth.signOut() }, 30 * 60 * 1000)
    }
    const events = ['mousemove','keydown','touchstart','click','scroll']
    events.forEach(e => window.addEventListener(e, resetTimer))
    resetTimer()
    return () => { clearTimeout(timer); events.forEach(e => window.removeEventListener(e, resetTimer)) }
  }, [])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (dx > 60 && dy < 80) router.push('/schedules')
    if (dx < -60 && dy < 80) router.push('/login')
  }

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
      style={{ minHeight: '100vh', fontFamily: 'DM Sans,sans-serif', position: 'relative', overflow: 'hidden' }}>

      {/* Gradient fallback */}
      <div style={{ position: 'absolute', inset: 0, background: gradients[currentVideo], transition: 'background 1.5s ease', zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 80px)' }}/>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,92,58,0.08)', top: -100, right: -80, filter: 'blur(60px)' }}/>
        <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(30,150,200,0.1)', bottom: 100, left: -80, filter: 'blur(50px)' }}/>
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(245,200,66,0.06)', top: '40%', right: '20%', filter: 'blur(40px)' }}/>
      </div>

      {/* Videos */}
      {videos.map((src, i) => (
        <video key={i} autoPlay muted loop playsInline onCanPlay={() => setVideoLoaded(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: videoLoaded && i === currentVideo ? 1 : 0, transition: 'opacity 1.5s ease', zIndex: 1 }}>
          <source src={src} type="video/mp4"/>
        </video>
      ))}

      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,30,48,0.55) 0%, rgba(7,30,48,0.15) 35%, rgba(7,30,48,0.92) 100%)', zIndex: 2 }} />

      {/* Island silhouette */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, zIndex: 2, overflow: 'hidden', opacity: 0.15 }}>
        <svg viewBox="0 0 480 180" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0,180 L0,120 Q20,90 40,110 Q60,130 80,100 Q100,70 120,85 Q140,100 160,80 Q180,60 200,75 Q220,90 240,70 Q260,50 280,65 Q300,80 320,60 Q340,40 360,55 Q380,70 400,50 Q420,30 440,45 Q460,60 480,40 L480,180 Z" fill="rgba(255,255,255,0.5)"/>
        </svg>
      </div>

      {/* Swipe hint */}
      {swipeHint && (
        <div style={{ position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, animation: 'pulse 1.5s infinite' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '8px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '1.2rem' }}>👉</span>
            <span style={{ fontSize: '0.65rem', color: 'white', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>Swipe right<br/>for schedules</span>
          </div>
        </div>
      )}

      {/* Schedules peek indicator */}
      <div onClick={() => router.push('/schedules')}
        style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0 12px 12px 0', padding: '12px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: '1rem' }}>🚢</span>
        <span style={{ fontSize: '0.6rem', color: 'white', fontWeight: 600, writingMode: 'vertical-rl', textOrientation: 'mixed', letterSpacing: '0.05em' }}>SCHEDULES</span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>›</span>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, maxWidth: 480, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 16px' }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.4rem', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            Vonu<span style={{ color: '#ff5c3a' }}>-</span>Travel
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="/login?mode=signin" style={{ padding: '8px 18px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.4)', color: 'white', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>Sign In</a>
            <a href="/login?mode=signup" style={{ padding: '8px 18px', borderRadius: 20, border: 'none', background: '#ff5c3a', color: 'white', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(255,92,58,0.5)' }}>Sign Up</a>
          </div>
        </nav>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 24px 100px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ff5c3a', background: 'rgba(255,92,58,0.15)', border: '1px solid rgba(255,92,58,0.4)', padding: '4px 12px', borderRadius: 20, display: 'inline-block', marginBottom: 16 }}>🇫🇯 Fiji Ferry Booking</span>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '2.6rem', lineHeight: 1.1, color: 'white', marginBottom: 16, textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
            Explore Fiji's<br/><span style={{ color: '#ff5c3a' }}>Islands</span> by Sea
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: 28, textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
            Book ferry tickets across Fiji's most beautiful routes. Fast, simple, and built for island life.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {['Suva → Savusavu','Suva → Taveuni','Suva → Kadavu','Lautoka → Yasawa'].map(r => (
              <span key={r} style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '0.8rem' }}>{r}</span>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a href="/login?mode=signup" style={{ display: 'block', padding: '16px', background: '#ff5c3a', borderRadius: 14, color: 'white', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1rem', textAlign: 'center', textDecoration: 'none', boxShadow: '0 8px 28px rgba(255,92,58,0.5)' }}>Start Booking</a>
            <a href="/" style={{ display: 'block', padding: '16px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14, color: 'white', fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: '0.95rem', textAlign: 'center', textDecoration: 'none' }}>Browse as Guest</a>
          </div>
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
