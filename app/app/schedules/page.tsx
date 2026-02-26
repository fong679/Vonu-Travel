'use client'
import { useState } from 'react'
import { PORTS, getRoutes, Ferry } from '@/lib/routes'

function getDays() {
  const days = []
  for (let i = 0; i < 3; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

function formatDay(d: Date) {
  if (d.toDateString() === new Date().toDateString()) return 'Today'
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-FJ', { weekday: 'long' })
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-FJ', { day: 'numeric', month: 'short', year: 'numeric' })
}

const ALL_ROUTES = [
  ['Suva','Savusavu'],['Suva','Labasa'],['Suva','Lautoka'],
  ['Suva','Levuka'],['Suva','Koro'],['Suva','Taveuni'],
  ['Suva','Kadavu'],['Lautoka','Yasawa'],
]

export default function SchedulesPage() {
  const days = getDays()
  const [activeDay, setActiveDay] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)

  const activeDate = days[activeDay]
  const dayOfWeek = activeDate.getDay()

  const routesWithFerries = ALL_ROUTES.map(([o, d]) => ({
    origin: o, destination: d,
    ferries: getRoutes(o, d).filter(f => f.daysOfWeek.includes(dayOfWeek))
  })).filter(r => r.ferries.length > 0)

  return (
    <div style={{ minHeight: '100vh', background: '#071e30', fontFamily: 'DM Sans,sans-serif', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <a href="/landing" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', fontSize: '1rem' }}>←</a>
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>Ferry Schedules</div>
            <div style={{ fontSize: '0.75rem', color: '#7eabc5' }}>All routes · Live timetable</div>
          </div>
        </div>

        {/* Day tabs */}
        <div style={{ display: 'flex', gap: 8, paddingBottom: 16 }}>
          {days.map((d, i) => (
            <button key={i} onClick={() => setActiveDay(i)}
              style={{ flex: 1, padding: '10px 8px', borderRadius: 12, border: 'none', background: activeDay === i ? '#ff5c3a' : 'rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '0.85rem', color: activeDay === i ? 'white' : '#7eabc5' }}>{formatDay(d)}</div>
              <div style={{ fontSize: '0.7rem', color: activeDay === i ? 'rgba(255,255,255,0.8)' : '#4a6a7c', marginTop: 2 }}>{formatDate(d)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ padding: '14px 24px', background: 'rgba(255,92,58,0.06)', borderBottom: '1px solid rgba(255,92,58,0.1)' }}>
        <span style={{ fontSize: '0.82rem', color: '#ff7a5c' }}>🚢 {routesWithFerries.reduce((a, r) => a + r.ferries.length, 0)} ferries operating on {formatDay(activeDate)} across {routesWithFerries.length} routes</span>
      </div>

      {/* Routes */}
      <div style={{ padding: '16px 24px' }}>
        {routesWithFerries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#7eabc5' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🚢</div>
            <p style={{ fontWeight: 600, color: 'white' }}>No ferries scheduled</p>
            <p style={{ fontSize: '0.85rem', marginTop: 6 }}>Check another day</p>
          </div>
        ) : routesWithFerries.map(route => {
          const key = `${route.origin}-${route.destination}`
          const isExpanded = expanded === key
          return (
            <div key={key} style={{ marginBottom: 12, background: 'rgba(14,61,92,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              {/* Route header */}
              <div onClick={() => setExpanded(isExpanded ? null : key)}
                style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1rem', color: 'white' }}>{route.origin} → {route.destination}</div>
                  <div style={{ fontSize: '0.75rem', color: '#7eabc5', marginTop: 2 }}>{route.ferries.length} ferry{route.ferries.length > 1 ? 's' : ''} available</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: '#7eabc5' }}>From</div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#f5c842', fontSize: '0.95rem' }}>${Math.min(...route.ferries.map(f => f.economy))} FJD</div>
                  </div>
                  <span style={{ color: '#7eabc5', fontSize: '0.8rem' }}>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Ferry details */}
              {isExpanded && route.ferries.map(ferry => (
                <div key={ferry.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{ferry.icon}</div>
                    <div>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>{ferry.operator}</div>
                      <div style={{ fontSize: '0.75rem', color: '#7eabc5' }}>{ferry.ship}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600, border: `1px solid ${ferry.tagColor === 'green' ? 'rgba(0,165,80,0.3)' : ferry.tagColor === 'blue' ? 'rgba(0,120,255,0.3)' : 'rgba(245,200,66,0.3)'}`, color: ferry.tagColor === 'green' ? '#4dd882' : ferry.tagColor === 'blue' ? '#60a5fa' : '#f5c842' }}>{ferry.tag}</span>
                    </div>
                  </div>

                  {/* Times */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>{ferry.departs}</div>
                      <div style={{ fontSize: '0.7rem', color: '#7eabc5' }}>{route.origin}</div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 12px', gap: 3 }}>
                      <div style={{ fontSize: '0.68rem', color: '#7eabc5' }}>{ferry.duration}</div>
                      <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2, position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', background: '#ff5c3a' }} />
                        <div style={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', background: '#ff5c3a' }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>{ferry.arrives}</div>
                      <div style={{ fontSize: '0.7rem', color: '#7eabc5' }}>{route.destination}</div>
                    </div>
                  </div>

                  {/* Prices & Seats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.68rem', color: '#7eabc5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Economy</div>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#f5c842', fontSize: '1rem' }}>${ferry.economy} FJD</div>
                      <div style={{ fontSize: '0.7rem', color: ferry.seatsEconomy < 10 ? '#ff5c3a' : ferry.seatsEconomy < 30 ? '#f5c842' : '#4dd882', marginTop: 2 }}>● {ferry.seatsEconomy} seats</div>
                    </div>
                    {ferry.cabin > 0 && (
                      <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.68rem', color: '#7eabc5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cabin</div>
                        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#f5c842', fontSize: '1rem' }}>${ferry.cabin} FJD</div>
                        <div style={{ fontSize: '0.7rem', color: ferry.seatsCabin < 5 ? '#ff5c3a' : ferry.seatsCabin < 10 ? '#f5c842' : '#4dd882', marginTop: 2 }}>● {ferry.seatsCabin} cabins</div>
                      </div>
                    )}
                  </div>

                  <a href="/" style={{ display: 'block', padding: '11px', background: '#ff5c3a', borderRadius: 10, color: 'white', fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', textDecoration: 'none', boxShadow: '0 4px 14px rgba(255,92,58,0.35)' }}>
                    Book This Ferry →
                  </a>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
