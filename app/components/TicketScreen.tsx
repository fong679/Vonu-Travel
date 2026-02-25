'use client'
import { Booking } from '@/lib/routes'
export default function TicketScreen({booking,onDone,theme}:{booking:Booking;onDone:()=>void;theme:'dark'|'light'}) {
  const dark=theme==='dark'
  const text=dark?'white':'#1a2e3b'
  const sub=dark?'#7eabc5':'#5a7a8a'
  const totalPax=(booking.passengers?.adults||1)+(booking.passengers?.children||0)+(booking.passengers?.infants||0)
  return (
    <div style={{minHeight:'100vh',background:dark?'#071e30':'#f0f4f8',fontFamily:'DM Sans,sans-serif',display:'flex',alignItems:'flex-end'}}>
      <div style={{background:dark?'#0e3d5c':'white',borderRadius:'24px 24px 0 0',border:`1px solid ${dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)'}`,borderBottom:'none',width:'100%',padding:'28px 24px 100px'}}>
        <div style={{width:40,height:4,background:dark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.1)',borderRadius:2,margin:'0 auto 24px'}}/>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(0,165,80,0.15)',border:'2px solid #00a550',margin:'0 auto 12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem'}}>✓</div>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.3rem',color:text,marginBottom:4}}>Booking Confirmed!</div>
          <div style={{fontSize:'0.85rem',color:sub}}>Ticket saved to My Trips</div>
        </div>
        <div style={{background:dark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)',border:`1px solid ${dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}`,borderRadius:18,overflow:'hidden',marginBottom:16}}>
          <div style={{background:'#ff5c3a',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.7)'}}>E-Ticket</div>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1rem',color:'white'}}>{booking.origin} → {booking.destination}</div>
            </div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'0.9rem',color:'white',background:'rgba(255,255,255,0.15)',padding:'4px 10px',borderRadius:6}}>{booking.ref}</div>
          </div>
          <div style={{padding:'18px 20px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px 8px'}}>
            {[
              {label:'Passenger',value:booking.passengerName},
              {label:'Date',value:booking.date},
              {label:'Departs',value:booking.ferry.departs},
              {label:'Vessel',value:booking.ferry.ship},
              {label:'Class',value:booking.selectedClass},
              {label:'Paid',value:`FJD ${booking.price}`},
            ].map(item=>(
              <div key={item.label}>
                <div style={{fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.08em',color:sub,marginBottom:3}}>{item.label}</div>
                <div style={{fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.85rem',color:text}}>{item.value}</div>
              </div>
            ))}
          </div>
          {totalPax>1&&(
            <div style={{padding:'0 20px 14px',fontSize:'0.78rem',color:sub}}>
              👥 {booking.passengers?.adults||1} Adult{(booking.passengers?.adults||1)>1?'s':''}
              {booking.passengers?.children?` · ${booking.passengers.children} Child`:''}
              {booking.passengers?.infants?` · ${booking.passengers.infants} Infant (free)`:''}
            </div>
          )}
          <div style={{height:1,background:dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)',margin:'0 20px'}}/>
          <div style={{padding:20,display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:90,height:90,background:'white',borderRadius:10,padding:8,flexShrink:0}}>
              <div style={{width:'100%',height:'100%',background:'repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 0 0 / 8px 8px, repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 4px 4px / 8px 8px',borderRadius:3}}/>
            </div>
            <div>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1rem',color:text,marginBottom:4}}>{booking.passengerName}</div>
              <div style={{display:'inline-block',padding:'3px 10px',background:'rgba(245,200,66,0.15)',border:'1px solid rgba(245,200,66,0.3)',color:'#f5c842',fontSize:'0.75rem',fontWeight:600,borderRadius:20,marginBottom:6}}>{booking.selectedClass} Class</div>
              <div style={{fontSize:'0.75rem',color:sub,lineHeight:1.4}}>Show QR to the ship's purser at boarding.</div>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:10,marginBottom:12}}>
          {['📥 Save to Phone','📤 Share Ticket'].map(l=><button key={l} style={{flex:1,padding:12,borderRadius:12,border:`1px solid ${dark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.1)'}`,background:dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',color:text,fontSize:'0.85rem',cursor:'pointer'}}>{l}</button>)}
        </div>
        <button onClick={onDone} style={{width:'100%',padding:14,borderRadius:12,border:'none',background:'#ff5c3a',color:'white',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.95rem',cursor:'pointer'}}>Done — View My Trips</button>
      </div>
    </div>
  )
}
