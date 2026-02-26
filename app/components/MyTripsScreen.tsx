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
      <span style={{fontSize:'0.9rem'}}>{urgent?'🚨':'⏱️'}</span>
      <div>
        <div style={{fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.08em',color:urgent?'#ff7a5c':'#f5c842'}}>Departing in</div>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.95rem',color:urgent?'#ff5c3a':'#f5c842'}}>{timeLeft}</div>
      </div>
    </div>
  )
}

function BookingCard({b,dark,onCancel}:{b:Booking;dark:boolean;onCancel:(ref:string)=>void}) {
  const [expanded,setExpanded]=useState(false)
  const [cancelling,setCancelling]=useState(false)
  const card=dark?'rgba(14,61,92,0.4)':'rgba(255,255,255,0.9)'
  const border=dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'
  const text=dark?'white':'#1a2e3b'
  const sub=dark?'#7eabc5':'#5a7a8a'

  async function handleCancel(){
    if(!confirm('Cancel this booking?')) return
    setCancelling(true)
    onCancel(b.ref)
  }

  return (
    <div style={{background:card,border:`1px solid ${border}`,borderRadius:16,marginBottom:12,overflow:'hidden',boxShadow:dark?'none':'0 2px 12px rgba(0,0,0,0.06)'}}>
      <div onClick={()=>setExpanded(!expanded)} style={{padding:16,cursor:'pointer'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:text,fontSize:'1rem'}}>{b.origin} → {b.destination}</div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{fontSize:'0.75rem',color:'#4dd882',background:'rgba(0,165,80,0.1)',padding:'2px 10px',borderRadius:10,border:'1px solid rgba(0,165,80,0.2)'}}>Confirmed</div>
            <span style={{color:sub,fontSize:'0.8rem'}}>{expanded?'▲':'▼'}</span>
          </div>
        </div>
        <div style={{fontSize:'0.82rem',color:sub,marginBottom:2}}>{b.ferry.ship} · {b.date}</div>
        <div style={{fontSize:'0.82rem',color:sub,marginBottom:4}}>{b.selectedClass} · Departs {b.ferry.departs}</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontSize:'0.78rem',color:sub}}>{b.passengers?.adults||1} Adult{(b.passengers?.adults||1)>1?'s':''}{b.passengers?.children?`, ${b.passengers.children} Child`:''}{b.passengers?.infants?`, ${b.passengers.infants} Infant`:''}</div>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#f5c842',fontSize:'0.9rem'}}>FJD {b.price}</div>
        </div>
        {b.departureDateTime&&<Countdown departureDateTime={b.departureDateTime}/>}
      </div>

      {expanded&&(
        <div style={{borderTop:`1px solid ${border}`,padding:16}}>
          {/* QR Code */}
          <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:16,padding:14,background:dark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)',borderRadius:12,border:`1px solid ${border}`}}>
            <div style={{width:80,height:80,background:'white',borderRadius:10,padding:6,flexShrink:0}}>
              <div style={{width:'100%',height:'100%',background:'repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 0 0 / 8px 8px, repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 4px 4px / 8px 8px',borderRadius:3}}/>
            </div>
            <div>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.85rem',color:text,marginBottom:4}}>{b.passengerName}</div>
              <div style={{fontSize:'0.72rem',color:sub,marginBottom:4}}>{b.selectedClass} Class · {b.ferry.departs}</div>
              <div style={{fontSize:'0.7rem',color:sub,letterSpacing:'0.06em'}}>REF: {b.ref}</div>
              <div style={{fontSize:'0.7rem',color:'#7eabc5',marginTop:4}}>Show to purser at boarding</div>
            </div>
          </div>

          {/* Trip details */}
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

          <button onClick={handleCancel} disabled={cancelling}
            style={{width:'100%',padding:'11px',borderRadius:10,border:'1px solid rgba(255,92,58,0.3)',background:'rgba(255,92,58,0.08)',color:'#ff5c3a',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.85rem',cursor:'pointer',opacity:cancelling?0.6:1}}>
            {cancelling?'Cancelling...':'✕ Cancel Booking'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function MyTripsScreen({trips,user,theme}:{trips:Booking[];user:any;theme:'dark'|'light'}) {
  const [localTrips,setLocalTrips]=useState(trips)
  const dark=theme==='dark'
  const bg=dark?'#071e30':'#f0f4f8'
  const border=dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'
  const text=dark?'white':'#1a2e3b'
  const sub=dark?'#7eabc5':'#5a7a8a'
  const supabase=createClient()

  useEffect(()=>setLocalTrips(trips),[trips])

  async function handleCancel(ref:string){
    setLocalTrips(prev=>prev.filter(t=>t.ref!==ref))
    if(user){
      await supabase.from('bookings').update({status:'cancelled'}).eq('ref',ref).eq('user_id',user.id)
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
        <div style={{fontSize:'0.78rem',color:sub}}>{localTrips.length} upcoming booking{localTrips.length!==1?'s':''}</div>
      </div>
      <div style={{padding:'20px 24px'}}>
        {localTrips.length===0?(
          <div style={{textAlign:'center',padding:'80px 0',color:sub}}>
            <div style={{fontSize:'3rem',marginBottom:12}}>🎫</div>
            <p style={{fontWeight:600,color:text}}>No upcoming trips</p>
            <p style={{fontSize:'0.85rem',marginTop:6}}>Search for a ferry to get started.</p>
          </div>
        ):localTrips.map(b=>(
          <BookingCard key={b.ref} b={b} dark={dark} onCancel={handleCancel}/>
        ))}
      </div>
    </div>
  )
}
