'use client'
import { Booking } from '@/lib/routes'
export default function HistoryScreen({trips,theme}:{trips:Booking[];theme:'dark'|'light'}) {
  const dark=theme==='dark'
  const bg=dark?'#071e30':'#f0f4f8'
  const card=dark?'rgba(14,61,92,0.4)':'rgba(255,255,255,0.9)'
  const border=dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'
  const text=dark?'white':'#1a2e3b'
  const sub=dark?'#7eabc5':'#5a7a8a'
  return (
    <div style={{minHeight:'100vh',background:bg,fontFamily:'DM Sans,sans-serif',paddingBottom:100}}>
      <div style={{padding:'20px 24px',borderBottom:`1px solid ${border}`}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.3rem',color:text}}>History</div>
        <div style={{fontSize:'0.78rem',color:sub}}>{trips.length} completed trip{trips.length!==1?'s':''}</div>
      </div>
      <div style={{padding:'20px 24px'}}>
        {trips.length===0?(
          <div style={{textAlign:'center',padding:'80px 0',color:sub}}>
            <div style={{fontSize:'3rem',marginBottom:12}}>🕒</div>
            <p style={{fontWeight:600,color:text}}>No completed trips yet</p>
            <p style={{fontSize:'0.85rem',marginTop:6}}>Your past journeys will appear here.</p>
          </div>
        ):trips.map(b=>(
          <div key={b.ref} style={{background:card,border:`1px solid ${border}`,borderRadius:16,padding:16,marginBottom:12,boxShadow:dark?'none':'0 2px 12px rgba(0,0,0,0.06)'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:text}}>{b.origin} → {b.destination}</div>
              <div style={{fontSize:'0.75rem',color:sub,background:dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)',padding:'2px 10px',borderRadius:10}}>Completed</div>
            </div>
            <div style={{fontSize:'0.82rem',color:sub,marginBottom:2}}>{b.ferry.ship} · {b.date}</div>
            <div style={{fontSize:'0.82rem',color:sub,marginBottom:8}}>{b.selectedClass} · Departed {b.ferry.departs}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:8,borderTop:`1px solid ${border}`}}>
              <div style={{fontSize:'0.72rem',color:sub,letterSpacing:'0.06em'}}>REF: {b.ref}</div>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#f5c842',fontSize:'0.9rem'}}>FJD {b.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
