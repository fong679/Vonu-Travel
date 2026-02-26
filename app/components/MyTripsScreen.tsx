'use client'
import { useState, useEffect } from 'react'
import { Booking } from '@/lib/routes'
import { createClient } from '@/lib/supabase'

function Countdown({departureDateTime}:{departureDateTime:string}) {
  const [timeLeft,setTimeLeft]=useState('')
  const [urgent,setUrgent]=useState(false)
  useEffect(()=>{
    function update(){
      const diff=new Date(departureDateTime).getTime()-Date.now()
      if(diff<=0){setTimeLeft('Departed');return}
      const days=Math.floor(diff/86400000)
      const hrs=Math.floor((diff%86400000)/3600000)
      const mins=Math.floor((diff%3600000)/60000)
      const secs=Math.floor((diff%60000)/1000)
      setUrgent(diff<3600000)
      if(days>0) setTimeLeft(`${days}d ${hrs}h ${mins}m ${secs}s`)
      else if(hrs>0) setTimeLeft(`${hrs}h ${mins}m ${secs}s`)
      else setTimeLeft(`${mins}m ${secs}s`)
    }
    update()
    const iv=setInterval(update,1000)
    return()=>clearInterval(iv)
  },[departureDateTime])
  if(!timeLeft) return null
  return (
    <div style={{marginTop:10,padding:'8px 12px',borderRadius:10,background:urgent?'rgba(255,92,58,0.12)':'rgba(245,200,66,0.08)',border:`1px solid ${urgent?'rgba(255,92,58,0.3)':'rgba(245,200,66,0.2)'}`,display:'flex',alignItems:'center',gap:8}}>
      <span>{urgent?'🚨':'⏱️'}</span>
      <div>
        <div style={{fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.08em',color:urgent?'#ff7a5c':'#f5c842'}}>Departing in</div>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.95rem',color:urgent?'#ff5c3a':'#f5c842'}}>{timeLeft}</div>
      </div>
    </div>
  )
}

type BookingWithCancel = Booking & { cancellation_requested?: boolean; cancellation_requested_at?: string }

function BookingCard({b,dark,onRequestCancel,onUndoCancel}:{b:BookingWithCancel;dark:boolean;onRequestCancel:(ref:string)=>void;onUndoCancel:(ref:string)=>void}) {
  const [expanded,setExpanded]=useState(false)
  const card=dark?'rgba(14,61,92,0.4)':'rgba(255,255,255,0.9)'
  const border=dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'
  const text=dark?'white':'#1a2e3b'
  const sub=dark?'#7eabc5':'#5a7a8a'
  const isPending=b.cancellation_requested

  return (
    <div style={{background:card,border:`1px solid ${isPending?'rgba(245,200,66,0.3)':border}`,borderRadius:16,marginBottom:12,overflow:'hidden',boxShadow:dark?'none':'0 2px 12px rgba(0,0,0,0.06)',opacity:isPending?0.85:1}}>

      {/* Pending banner */}
      {isPending&&(
        <div style={{background:'rgba(245,200,66,0.1)',borderBottom:'1px solid rgba(245,200,66,0.2)',padding:'8px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span>⏳</span>
            <div>
              <div style={{fontSize:'0.75rem',fontWeight:600,color:'#f5c842'}}>Cancellation Pending</div>
              <div style={{fontSize:'0.68rem',color:'#a89040'}}>Awaiting ferry operator confirmation</div>
            </div>
          </div>
          <button onClick={()=>onUndoCancel(b.ref)}
            style={{padding:'5px 12px',borderRadius:20,border:'1px solid rgba(245,200,66,0.4)',background:'rgba(245,200,66,0.1)',color:'#f5c842',fontSize:'0.72rem',fontWeight:600,cursor:'pointer',fontFamily:'Syne,sans-serif'}}>
            Keep Ticket
          </button>
        </div>
      )}

      <div onClick={()=>setExpanded(!expanded)} style={{padding:16,cursor:'pointer'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:text,fontSize:'1rem'}}>{b.origin} → {b.destination}</div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{fontSize:'0.75rem',color:isPending?'#f5c842':'#4dd882',background:isPending?'rgba(245,200,66,0.1)':'rgba(0,165,80,0.1)',padding:'2px 10px',borderRadius:10,border:`1px solid ${isPending?'rgba(245,200,66,0.2)':'rgba(0,165,80,0.2)'}`}}>
              {isPending?'Pending':'Confirmed'}
            </div>
            <span style={{color:sub,fontSize:'0.8rem'}}>{expanded?'▲':'▼'}</span>
          </div>
        </div>
        <div style={{fontSize:'0.82rem',color:sub,marginBottom:2}}>{b.ferry.ship} · {b.date}</div>
        <div style={{fontSize:'0.82rem',color:sub,marginBottom:4}}>{b.selectedClass} · Departs {b.ferry.departs}</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontSize:'0.78rem',color:sub}}>
            {b.passengers?.adults||1} Adult{(b.passengers?.adults||1)>1?'s':''}
            {b.passengers?.children?`, ${b.passengers.children} Child`:''}
            {b.passengers?.infants?`, ${b.passengers.infants} Infant`:''}
          </div>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#f5c842',fontSize:'0.9rem'}}>FJD {b.price}</div>
        </div>
        {!isPending&&b.departureDateTime&&<Countdown departureDateTime={b.departureDateTime}/>}
      </div>

      {expanded&&(
        <div style={{borderTop:`1px solid ${border}`,padding:16}}>
          {/* QR */}
          <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:16,padding:14,background:dark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)',borderRadius:12,border:`1px solid ${border}`}}>
            <div style={{width:80,height:80,background:'white',borderRadius:10,padding:6,flexShrink:0,opacity:isPending?0.4:1}}>
              <div style={{width:'100%',height:'100%',background:'repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 0 0 / 8px 8px, repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 4px 4px / 8px 8px',borderRadius:3}}/>
            </div>
            <div>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.85rem',color:isPending?sub:text,marginBottom:4}}>{b.passengerName}</div>
              <div style={{fontSize:'0.72rem',color:sub,marginBottom:4}}>{b.selectedClass} · {b.ferry.departs}</div>
              <div style={{fontSize:'0.7rem',color:sub,letterSpacing:'0.06em'}}>REF: {b.ref}</div>
              {isPending
                ? <div style={{fontSize:'0.7rem',color:'#f5c842',marginTop:4}}>⏳ QR disabled pending cancellation</div>
                : <div style={{fontSize:'0.7rem',color:'#7eabc5',marginTop:4}}>Show to purser at boarding</div>
              }
            </div>
          </div>

          {/* Details grid */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 16px',marginBottom:16}}>
            {[
              {label:'Vessel',value:b.ferry.ship},
              {label:'Departs',value:b.ferry.departs},
              {label:'Arrives',value:b.ferry.arrives||'—'},
              {label:'Class',value:b.selectedClass},
            ].map(item=>(
              <div key={item.label}>
                <div style={{fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.08em',color:sub,marginBottom:2}}>{item.label}</div>
                <div style={{fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.85rem',color:text}}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          {isPending?(
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <div style={{padding:'12px',borderRadius:10,background:'rgba(245,200,66,0.06)',border:'1px solid rgba(245,200,66,0.2)',fontSize:'0.8rem',color:'#a89040',textAlign:'center',lineHeight:1.5}}>
                🕐 Your cancellation request has been sent to the ferry operator. You will be notified once confirmed.
              </div>
              <button onClick={()=>onUndoCancel(b.ref)}
                style={{width:'100%',padding:'11px',borderRadius:10,border:'1px solid rgba(0,165,80,0.3)',background:'rgba(0,165,80,0.08)',color:'#4dd882',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.85rem',cursor:'pointer'}}>
                ↩ Keep Ticket — Undo Cancellation
              </button>
            </div>
          ):(
            <button onClick={()=>onRequestCancel(b.ref)}
              style={{width:'100%',padding:'11px',borderRadius:10,border:'1px solid rgba(255,92,58,0.3)',background:'rgba(255,92,58,0.08)',color:'#ff5c3a',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.85rem',cursor:'pointer'}}>
              ✕ Request Cancellation
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function MyTripsScreen({trips,user,theme}:{trips:Booking[];user:any;theme:'dark'|'light'}) {
  const [localTrips,setLocalTrips]=useState<BookingWithCancel[]>(trips)
  const dark=theme==='dark'
  const bg=dark?'#071e30':'#f0f4f8'
  const border=dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'
  const text=dark?'white':'#1a2e3b'
  const sub=dark?'#7eabc5':'#5a7a8a'
  const supabase=createClient()

  useEffect(()=>setLocalTrips(trips),[trips])

  const confirmed=localTrips.filter(t=>!t.cancellation_requested)
  const pending=localTrips.filter(t=>t.cancellation_requested)

  async function handleRequestCancel(ref:string){
    const now=new Date().toISOString()
    setLocalTrips(prev=>prev.map(t=>t.ref===ref?{...t,cancellation_requested:true,cancellation_requested_at:now}:t))
    if(user){
      await supabase.from('bookings').update({cancellation_requested:true,cancellation_requested_at:now}).eq('ref',ref).eq('user_id',user.id)
    }
  }

  async function handleUndoCancel(ref:string){
    setLocalTrips(prev=>prev.map(t=>t.ref===ref?{...t,cancellation_requested:false,cancellation_requested_at:undefined}:t))
    if(user){
      await supabase.from('bookings').update({cancellation_requested:false,cancellation_requested_at:null}).eq('ref',ref).eq('user_id',user.id)
    }
  }

  if(!user) return (
    <div style={{minHeight:'100vh',background:bg,fontFamily:'DM Sans,sans-serif',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'3rem',marginBottom:16}}>🔐</div>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.2rem',color:text,marginBottom:8}}>Sign in to see your trips</div>
        <p style={{color:sub,fontSize:'0.85rem',marginBottom:24}}>Your bookings are saved to your account</p>
        <a href="/login" style={{display:'inline-block',padding:'13px 32px',background:'#ff5c3a',borderRadius:14,color:'white',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.95rem',textDecoration:'none',boxShadow:'0 6px 24px rgba(255,92,58,0.4)'}}>Sign In</a>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:bg,fontFamily:'DM Sans,sans-serif',paddingBottom:100}}>
      <div style={{padding:'20px 24px',borderBottom:`1px solid ${border}`}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.3rem',color:text}}>My Trips</div>
        <div style={{fontSize:'0.78rem',color:sub}}>{confirmed.length} confirmed · {pending.length} pending cancellation</div>
      </div>

      <div style={{padding:'20px 24px'}}>
        {/* Confirmed trips */}
        {confirmed.length>0&&(
          <>
            <div style={{fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.12em',color:sub,marginBottom:10,paddingLeft:4}}>Upcoming Trips</div>
            {confirmed.map(b=><BookingCard key={b.ref} b={b} dark={dark} onRequestCancel={handleRequestCancel} onUndoCancel={handleUndoCancel}/>)}
          </>
        )}

        {/* Pending cancellation */}
        {pending.length>0&&(
          <>
            <div style={{fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.12em',color:'#f5c842',marginBottom:10,paddingLeft:4,marginTop:confirmed.length>0?20:0}}>⏳ Pending Cancellation</div>
            {pending.map(b=><BookingCard key={b.ref} b={b} dark={dark} onRequestCancel={handleRequestCancel} onUndoCancel={handleUndoCancel}/>)}
          </>
        )}

        {localTrips.length===0&&(
          <div style={{textAlign:'center',padding:'80px 0',color:sub}}>
            <div style={{fontSize:'3rem',marginBottom:12}}>🎫</div>
            <p style={{fontWeight:600,color:text}}>No upcoming trips</p>
            <p style={{fontSize:'0.85rem',marginTop:6}}>Search for a ferry to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
