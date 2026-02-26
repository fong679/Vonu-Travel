'use client'
import { useState, useEffect } from 'react'

type Booking = {
  id: string; ref: string; origin: string; destination: string
  date: string; ferry_ship: string; ferry_operator: string
  ferry_departs: string; selected_class: string; price: number
  passenger_name: string; passenger_id: string; phone: string
  status: string; cancellation_requested: boolean
  cancellation_requested_at: string; departure_datetime: string
  passengers: any
}

const TABS = [
  {key:'dashboard',icon:'📊',label:'Dashboard'},
  {key:'bookings',icon:'🎫',label:'Bookings'},
  {key:'cancellations',icon:'⏳',label:'Cancellations'},
  {key:'routes',icon:'🗺️',label:'Routes'},
  {key:'settings',icon:'⚙️',label:'Settings'},
]

export default function OperatorDashboard({user,profile,supabase}:{user:any;profile:any;supabase:any}) {
  const [tab, setTab] = useState('dashboard')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadBookings() }, [])

  async function loadBookings() {
    setLoading(true)
    const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })
    if (data) setBookings(data)
    setLoading(false)
  }

  async function markComplete(id: string) {
    await supabase.from('bookings').update({ status: 'completed' }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' } : b))
  }

  async function confirmCancellation(id: string) {
    await supabase.from('bookings').update({ status: 'cancelled', cancellation_requested: false }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled', cancellation_requested: false } : b))
  }

  async function rejectCancellation(id: string) {
    await supabase.from('bookings').update({ cancellation_requested: false, cancellation_requested_at: null }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, cancellation_requested: false } : b))
  }

  const upcoming = bookings.filter(b => b.status === 'upcoming' && !b.cancellation_requested)
  const pending = bookings.filter(b => b.cancellation_requested)
  const completed = bookings.filter(b => b.status === 'completed')
  const cancelled = bookings.filter(b => b.status === 'cancelled')
  const totalRevenue = bookings.filter(b => b.status !== 'cancelled').reduce((a, b) => a + b.price, 0)

  const bg = '#071e30'
  const card = 'rgba(14,61,92,0.5)'
  const border = 'rgba(255,255,255,0.08)'
  const text = 'white'
  const sub = '#7eabc5'

  function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { color: string; bg: string; label: string }> = {
      upcoming: { color: '#4dd882', bg: 'rgba(0,165,80,0.1)', label: 'Confirmed' },
      completed: { color: '#7eabc5', bg: 'rgba(126,171,197,0.1)', label: 'Completed' },
      cancelled: { color: '#ff7a5c', bg: 'rgba(255,92,58,0.1)', label: 'Cancelled' },
    }
    const s = map[status] || map.upcoming
    return <span style={{ fontSize: '0.72rem', color: s.color, background: s.bg, padding: '2px 10px', borderRadius: 10, border: `1px solid ${s.color}40` }}>{s.label}</span>
  }

  function BookingRow({ b }: { b: Booking }) {
    const [expanded, setExpanded] = useState(false)
    return (
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, marginBottom: 8, overflow: 'hidden' }}>
        <div onClick={() => setExpanded(!expanded)} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '0.9rem', color: text }}>{b.origin} → {b.destination}</span>
              <StatusBadge status={b.status}/>
            </div>
            <div style={{ fontSize: '0.75rem', color: sub }}>{b.passenger_name} · {b.ferry_ship} · {b.date} · {b.ferry_departs}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#f5c842', fontSize: '0.9rem' }}>FJD {b.price}</div>
            <div style={{ fontSize: '0.7rem', color: sub }}>{expanded ? '▲' : '▼'}</div>
          </div>
        </div>
        {expanded && (
          <div style={{ borderTop: `1px solid ${border}`, padding: '14px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px 16px', marginBottom: 14 }}>
              {[
                { label: 'REF', value: b.ref },
                { label: 'Class', value: b.selected_class },
                { label: 'Phone', value: b.phone },
                { label: 'ID/Passport', value: b.passenger_id },
                { label: 'Vessel', value: b.ferry_ship },
                { label: 'Operator', value: b.ferry_operator },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: sub, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: '0.82rem', color: text, fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {b.status === 'upcoming' && (
                <button onClick={() => markComplete(b.id)}
                  style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: 'rgba(126,171,197,0.15)', color: '#7eabc5', fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                  ✓ Mark Completed
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: 'DM Sans,sans-serif', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: text }}>Vonu<span style={{ color: '#ff5c3a' }}>-</span>Travel <span style={{ color: '#ff5c3a', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(255,92,58,0.1)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(255,92,58,0.3)' }}>OPERATOR</span></div>
          <div style={{ fontSize: '0.75rem', color: sub, marginTop: 2 }}>{profile.operator_name || user.email}</div>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/landing' }}
          style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${border}`, background: 'transparent', color: sub, fontSize: '0.8rem', cursor: 'pointer' }}>Sign Out</button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 24px' }}>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: text, marginBottom: 16 }}>Overview</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Total Bookings', value: bookings.length, color: '#7eabc5', icon: '🎫' },
                { label: 'Upcoming', value: upcoming.length, color: '#4dd882', icon: '🚢' },
                { label: 'Pending Cancel', value: pending.length, color: '#f5c842', icon: '⏳' },
                { label: 'Revenue (FJD)', value: totalRevenue, color: '#ff5c3a', icon: '💰' },
              ].map(s => (
                <div key={s.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.4rem', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', color: sub, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent bookings */}
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '0.95rem', color: text, marginBottom: 12 }}>Recent Bookings</div>
            {loading ? <div style={{ color: sub, textAlign: 'center', padding: 20 }}>Loading...</div>
              : bookings.slice(0, 5).map(b => <BookingRow key={b.id} b={b} />)}

            {/* Pending cancellations alert */}
            {pending.length > 0 && (
              <div onClick={() => setTab('cancellations')} style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.3)', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f5c842' }}>⏳ {pending.length} cancellation{pending.length > 1 ? 's' : ''} awaiting review</div>
                  <div style={{ fontSize: '0.75rem', color: '#a89040', marginTop: 2 }}>Tap to review and action</div>
                </div>
                <span style={{ color: '#f5c842' }}>›</span>
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS */}
        {tab === 'bookings' && (
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: text, marginBottom: 4 }}>All Bookings</div>
            <div style={{ fontSize: '0.78rem', color: sub, marginBottom: 16 }}>{bookings.length} total</div>
            {loading ? <div style={{ color: sub, textAlign: 'center', padding: 20 }}>Loading...</div>
              : bookings.filter(b => b.status !== 'cancelled').map(b => <BookingRow key={b.id} b={b} />)}
          </div>
        )}

        {/* CANCELLATIONS */}
        {tab === 'cancellations' && (
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: text, marginBottom: 4 }}>Cancellation Requests</div>
            <div style={{ fontSize: '0.78rem', color: sub, marginBottom: 16 }}>{pending.length} pending review</div>
            {pending.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: sub }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✓</div>
                <p style={{ color: text, fontWeight: 600 }}>No pending cancellations</p>
              </div>
            ) : pending.map(b => (
              <div key={b.id} style={{ background: card, border: '1px solid rgba(245,200,66,0.3)', borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: text }}>{b.origin} → {b.destination}</div>
                    <div style={{ fontSize: '0.78rem', color: sub, marginTop: 2 }}>{b.ferry_ship} · {b.date} · {b.ferry_departs}</div>
                  </div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#f5c842' }}>FJD {b.price}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 14 }}>
                  {[
                    { label: 'Passenger', value: b.passenger_name },
                    { label: 'REF', value: b.ref },
                    { label: 'Phone', value: b.phone },
                    { label: 'Requested', value: b.cancellation_requested_at ? new Date(b.cancellation_requested_at).toLocaleDateString() : '—' },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: sub, marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: '0.82rem', color: text }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => rejectCancellation(b.id)}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(0,165,80,0.3)', background: 'rgba(0,165,80,0.08)', color: '#4dd882', fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                    ↩ Reject — Keep Booking
                  </button>
                  <button onClick={() => confirmCancellation(b.id)}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(255,92,58,0.3)', background: 'rgba(255,92,58,0.08)', color: '#ff5c3a', fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                    ✓ Confirm Cancel
                  </button>
                </div>
              </div>
            ))}

            {/* Cancelled history */}
            {cancelled.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: sub, marginBottom: 10 }}>Cancelled Bookings</div>
                {cancelled.map(b => <BookingRow key={b.id} b={b} />)}
              </div>
            )}
          </div>
        )}

        {/* ROUTES */}
        {tab === 'routes' && (
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: text, marginBottom: 4 }}>Ferry Routes</div>
            <div style={{ fontSize: '0.78rem', color: sub, marginBottom: 16 }}>Manage schedules and pricing</div>
            <div style={{ padding: '60px 0', textAlign: 'center', color: sub }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗺️</div>
              <p style={{ color: text, fontWeight: 600, marginBottom: 8 }}>Route Management</p>
              <p style={{ fontSize: '0.85rem' }}>Upload and manage ferry schedules coming soon.</p>
              <div style={{ marginTop: 20, padding: '14px', background: card, border: `1px solid ${border}`, borderRadius: 12, textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: '#f5c842', fontWeight: 600, marginBottom: 8 }}>📋 Planned Features</div>
                {['Add / edit ferry routes','Set departure times per day','Update economy & cabin prices','Manage seat availability','Blackout dates / cancellations'].map(f => (
                  <div key={f} style={{ fontSize: '0.8rem', color: sub, padding: '4px 0', borderBottom: `1px solid ${border}` }}>· {f}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: text, marginBottom: 16 }}>Operator Settings</div>
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
              {[
                { icon: '🏢', label: 'Operator Name', value: profile.operator_name || 'Not set' },
                { icon: '✉️', label: 'Email', value: user.email },
                { icon: '🔑', label: 'Role', value: 'Operator' },
              ].map(item => (
                <div key={item.label} style={{ padding: '14px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span>{item.icon}</span>
                    <span style={{ fontSize: '0.9rem', color: text }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: sub }}>{item.value}</span>
                </div>
              ))}
            </div>
            <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/landing' }}
              style={{ width: '100%', marginTop: 16, padding: '13px', borderRadius: 12, border: '1px solid rgba(255,92,58,0.3)', background: 'rgba(255,92,58,0.08)', color: '#ff5c3a', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'rgba(7,30,48,0.97)', backdropFilter: 'blur(16px)', borderTop: `1px solid ${border}`, display: 'flex', zIndex: 10 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: 1, padding: '12px 4px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', border: 'none', background: 'transparent', color: tab === t.key ? '#ff5c3a' : sub, fontFamily: 'DM Sans,sans-serif', fontSize: '0.62rem', position: 'relative' }}>
            {t.key === 'cancellations' && pending.length > 0 && (
              <div style={{ position: 'absolute', top: 8, right: '22%', width: 16, height: 16, borderRadius: '50%', background: '#f5c842', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#071e30' }}>{pending.length}</div>
            )}
            <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
