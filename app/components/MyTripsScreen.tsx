'use client'
import { Booking } from '@/lib/routes'
export default function MyTripsScreen({trips}:{trips:Booking[]}) {
  return (
    <div style={{minHeight:'100vh',background:'#071e30',fontFamily:'DM Sans,sans-serif',paddingBottom:100}}>
      <div style={{padding:'20px 24px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.3rem',color:'white'}}>My Trips</div>
        <div style={{fontSize:'0.78rem',color:'#7eabc5'}}>{trips.length} booking{trips.length!==1?'s':''}</div>
      </div>
      <div style={{padding:'20px 24px'}}>
        {trips.length===0?(
          <div style={{textAlign:'center',padding:'80px 0',color:'#7eabc5'}}>
            <div style={{fontSize:'3rem',marginBottom:12}}>🎫</div>
            <p>No trips booked yet.</p>
            <p style={{fontSize:'0.85rem',marginTop:6}}>Search for a ferry to get started.</p>
          </div>
        ):trips.map(b=>(
          <div key={b.ref} style={{background:'rgba(14,61,92,0.4)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:16,marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'white'}}>{b.origin} → {b.destination}</div>
              <div style={{fontSize:'0.75rem',color:'#4dd882',background:'rgba(0,165,80,0.1)',padding:'2px 8px',borderRadius:10}}>Confirmed</div>
            </div>
            <div style={{fontSize:'0.82rem',color:'#7eabc5',marginBottom:4}}>{b.ferry.ship} · {b.date}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:'0.8rem',color:'#b8d4e0'}}>{b.selectedClass} · {b.ferry.departs} departure</div>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#f5c842',fontSize:'0.9rem'}}>FJD {b.price}</div>
            </div>
            <div style={{marginTop:8,fontSize:'0.72rem',color:'#7eabc5',letterSpacing:'0.06em'}}>REF: {b.ref}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
