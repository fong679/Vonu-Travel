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

type BookingWithCancel = Booking & {id?:string;cancellation_requested?:boolean;cancellation_requested_at?:string;status?:string}

function BookingCard({b,dark,onRequestCancel,onUndoCancel}:{b:BookingWithCancel;dark:boolean;onRequestCancel:(ref:string)=>void;onUndoCancel:(ref:string)=>void}) {
  const [expanded,setExpanded]=useState(false)
  const [confirming,setConfirming]=useState(false)
  const card=dark?'rgba(14,61,92,0.4)':'rgba(255,255,255,0.9)'
  const border=dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'
  const text=dark?'white':'#1a2e3b'
  const sub=dark?'#7eabc5':'#5a7a8a'
  const isPending=b.cancellation_requested
  const isCancelled=b.status==='cancelled'

  return (
    <div style={{background:isCancelled?'rgba(255,92,58,0.05)':card,border:`1px solid ${isCancelled?'rgba(255,92,58,0.2)':isPending?'rgba(245,200,66,0.3)':border}`,borderRadius:16,marginBottom:12,overflow:'hidden',boxShadow:dark?'none':'0 2px 12px rgba(0,0,0,0.06)'}}>

      {/* Cancelled banner */}
      {isCancelled&&(
        <div style={{background:'rgba(255,92,58,0.1)',borderBottom:'1px solid rgba(255,92,58,0.2)',padding:'8px 16px',display:'flex',alignItems:'center',gap:8}}>
          <span>❌</span>
          <div>
            <div style={{fontSize:'0.75rem',fontWeight:600,color:'#ff5c3a'}}>Booking Cancelled</div>
            <div style={{fontSize:'0.68rem',color:'#ff7a5c'}}>This booking has been cancelled by the operator</div>
          </div>
        </div>
      )}

      {/* Pending banner */}
      {isPending&&!isCancelled&&(
        <div style={{background:'rgba(245,200,66,0.1)',borderBottom:'1px solid rgba(245,200,66,0.2)',padding:'8px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span>⏳</span>
            <div>
              <div style={{fontSize:'0.75rem',fontWeight:600,color:'#f5c842'}}>Cancellation Pending</div>
              <div style={{fontSize:'0.68rem',color:'#a89040'}}>Awaiting ferry operator confirmation</div>
            </div>
          </div>
          <button onClick={()=>onUndoCancel(b.ref)} style={{padding:'5px 12px',borderRadius:20,border:'1px solid rgba(245,200,66,0.4)',background:'rgba(245,200,66,0.1)',color:'#f5c842',fontSize:'0.72rem',fontWeight:600,cursor:'pointer'}}>Keep Ticket</button>
        </div>
      )}

      <div onClick={()=>setExpanded(!expanded)} style={{padding:16,cursor:'pointer'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:isCancelled?sub:text,fontSize:'1rem',textDecoration:isCancelled?'line-through':'none'}}>{b.origin} → {b.destination}</div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{fontSize:'0.75rem',
              color:isCancelled?'#ff5c3a':isPending?'#f5c842':'#4dd882',
              background:isCancelled?'rgba(255,92,58,0.1)':isPending?'rgba(245,200,66,0.1)':'rgba(0,165,80,0.1)',
              padding:'2px 10px',borderRadius:10,
              border:`1px solid ${isCancelled?'rgba(255,92,58,0.2)':isPending?'rgba(245,200,66,0.2)':'rgba(0,165,80,0.2)'}`}}>
              {isCancelled?'Cancelled':isPending?'Pending':'Confirmed'}
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
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:isCancelled?sub:'#f5c842',fontSize:'0.9rem',textDecoration:isCancelled?'line-through':'none'}}>FJD {b.price}</div>
        </div>
        {!isPending&&!isCancelled&&b.departureDateTime&&<Countdown departureDateTime={b.departureDateTime}/>}
      </div>

      {expanded&&(
        <div style={{borderTop:`1px solid ${border}`,padding:16}}>
          {/* QR */}
          <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:16,padding:14,background:dark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)',borderRadius:12,border:`1px solid ${border}`}}>
            <div style={{width:80,height:80,background:'white',borderRadius:10,padding:6,flexShrink:0,opacity:isPending||isCancelled?0.3:1}}>
              <div style={{width:'100%',height:'100%',background:'repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 0 0 / 8px 8px, repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 4px 4px / 8px 8px',borderRadius:3}}/>
            </div>
            <div>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.85rem',color:isCancelled?sub:text,marginBottom:4}}>{b.passengerName}</div>
              <div style={{fontSize:'0.72rem',color:sub,marginBottom:4}}>{b.selectedClass} · {b.ferry.departs}</div>
              <div style={{fontSize:'0.7rem',color:sub,letterSpacing:'0.06em'}}>REF: {b.ref}</div>
              {isCancelled
                ?<div style={{fontSize:'0.7rem',color:'#ff5c3a',marginTop:4}}>❌ Ticket cancelled</div>
                :isPending
                  ?<div style={{fontSize:'0.7rem',color:'#f5c842',marginTop:4}}>⏳ QR disabled pending cancellation</div>
                  :<div style={{fontSize:'0.7rem',color:'#7eabc5',marginTop:4}}>Show to purser at boarding</div>
              }
            </div>
          </div>

          {/* Details */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 16px',marginBottom:16}}>
            {[{label:'Vessel',value:b.ferry.ship},{label:'Departs',value:b.ferry.departs},{label:'Arrives',value:b.ferry.arrives||'—'},{label:'Class',value:b.selectedClass}].map(item=>(
              <div key={item.label}>
                <div style={{fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.08em',color:sub,marginBottom:2}}>{item.label}</div>
                <div style={{fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.85rem',color:text}}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {!isCancelled&&(
            isPending?(
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <div style={{padding:'12px',borderRadius:10,background:'rgba(245,200,66,0.06)',border:'1px solid rgba(245,200,66,0.2)',fontSize:'0.8rem',color:'#a89040',textAlign:'center',lineHeight:1.5}}>
                  🕐 Cancellation request sent to ferry operator. You will be notified once actioned.
                </div>
                <button onClick={()=>onUndoCancel(b.ref)} style={{width:'100%',padding:'11px',borderRadius:10,border:'1px solid rgba(0,165,80,0.3)',background:'rgba(0,165,80,0.08)',color:'#4dd882',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.85rem',cursor:'pointer'}}>↩ Keep Ticket — Undo Cancellation</button>
              </div>
            ):(
              !confirming?(
                <button onClick={()=>setConfirming(true)} style={{width:'100%',padding:'11px',borderRadius:10,border:'1px solid rgba(255,92,58,0.3)',background:'rgba(255,92,58,0.08)',color:'#ff5c3a',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.85rem',cursor:'pointer'}}>✕ Request Cancellation</button>
              ):(
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  <div style={{padding:'12px',borderRadius:10,background:'rgba(255,92,58,0.06)',border:'1px solid rgba(255,92,58,0.15)',fontSize:'0.82rem',color:'#ff7a5c',textAlign:'center'}}>Are you sure you want to cancel this booking?</div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setConfirming(false)} style={{flex:1,padding:'11px',borderRadius:10,border:`1px solid ${border}`,background:'transparent',color:sub,fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.85rem',cursor:'pointer'}}>No, Keep It</button>
                    <button onClick={()=>{onRequestCancel(b.ref);setConfirming(false)}} style={{flex:1,padding:'11px',borderRadius:10,border:'none',background:'#ff5c3a',color:'white',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.85rem',cursor:'pointer'}}>Yes, Cancel</button>
                  </div>
                </div>
              )
            )
          )}
        </div>
      )}
    </div>
  )
}

export default function MyTripsScreen({trips,user,theme,onReload}:{trips:Booking[];user:any;theme:'dark'|'light';onReload?:()=>void}) {
  const [localTrips,setLocalTrips]=useState<BookingWithCancel[]>(trips)
  const [notifications,setNotifications]=useState<any[]>([])
  const dark=theme==='dark'
  const bg=dark?'#071e30':'#f0f4f8'
  const border=dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'
  const text=dark?'white':'#1a2e3b'
  const sub=dark?'#7eabc5':'#5a7a8a'
  const supabase=createClient()

  useEffect(()=>{
    if(trips.length===0) return
    setLocalTrips(prev=>{
      if(prev.length===0) return trips
      // Merge fresh data but keep realtime status updates
      return trips.map(fresh=>{
        const existing=prev.find(p=>p.ref===fresh.ref)
        if(!existing) return fresh
        return {
          ...fresh,
          status:(existing as any).status!==fresh.status?(existing as any).status:fresh.status,
          cancellation_requested:(existing as any).cancellation_requested??fresh.cancellation_requested
        }
      })
    })
  },[trips])

  useEffect(()=>{
    if(!user) return
    loadNotifications()
    // Realtime subscription for cancellation updates
    const channel=supabase
      .channel('booking-updates')
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'bookings',filter:`user_id=eq.${user.id}`},
        (payload:any)=>{
          const updated=payload.new
          setLocalTrips(prev=>prev.map(t=>{
            if((t as any).id===updated.id||t.ref===updated.ref){
              return {...t,
                status:updated.status,
                cancellation_requested:updated.cancellation_requested,
                cancellation_requested_at:updated.cancellation_requested_at
              }
            }
            return t
          }))
          if(updated.status==='cancelled'&&payload.old.status!=='cancelled'){
            loadNotifications()
          }
        }
      )
      .subscribe()
    return()=>{supabase.removeChannel(channel)}
  },[user])

  async function loadNotifications(){
    if(!user) return
    const {data}=await supabase
      .from('notifications')
      .select('*')
      .eq('user_id',user.id)
      .eq('read',false)
      .order('created_at',{ascending:false})
    if(data) setNotifications(data)
  }

  async function dismissNotification(id:string){
    await supabase.from('notifications').update({read:true}).eq('id',id)
    setNotifications(prev=>prev.filter(n=>n.id!==id))
  }

  async function handleRequestCancel(ref:string){
    const now=new Date().toISOString()
    setLocalTrips(prev=>prev.map(t=>t.ref===ref?{...t,cancellation_requested:true,cancellation_requested_at:now}:t))
    if(user){
      await supabase.from('bookings')
        .update({cancellation_requested:true,cancellation_requested_at:now})
        .eq('ref',ref)
        .eq('user_id',user.id)
    }
  }

  async function handleUndoCancel(ref:string){
    setLocalTrips(prev=>prev.map(t=>t.ref===ref?{...t,cancellation_requested:false,cancellation_requested_at:undefined}:t))
    if(user){
      await supabase.from('bookings')
        .update({cancellation_requested:false,cancellation_requested_at:null})
        .eq('ref',ref)
        .eq('user_id',user.id)
    }
  }

  const activeTrips=localTrips.filter(t=>t.status!=='cancelled')
  const cancelledTrips=localTrips.filter(t=>t.status==='cancelled')
  const confirmed=activeTrips.filter(t=>!t.cancellation_requested)
  const pending=activeTrips.filter(t=>t.cancellation_requested)

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

      {/* Notifications */}
      {notifications.length>0&&(
        <div style={{padding:'12px 24px 0'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <div style={{fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.1em',color:sub}}>🔔 {notifications.length} Notification{notifications.length>1?'s':''}</div>
            <button onClick={async()=>{
              await supabase.from('notifications').update({read:true}).eq('user_id',user.id).eq('read',false)
              setNotifications([])
            }} style={{fontSize:'0.75rem',color:'#ff5c3a',background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Clear all</button>
          </div>
          {notifications.map(n=>(
            <div key={n.id} style={{background:'rgba(255,92,58,0.08)',border:'1px solid rgba(255,92,58,0.25)',borderRadius:12,padding:'12px 14px',marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.85rem',color:'#ff5c3a',marginBottom:4}}>
                  {n.type==='cancellation_confirmed'?'❌':n.type==='cancellation_rejected'?'✅':'ℹ️'} {n.title}
                </div>
                <div style={{fontSize:'0.78rem',color:sub,lineHeight:1.5}}>{n.message}</div>
                <div style={{fontSize:'0.68rem',color:sub,marginTop:4}}>{new Date(n.created_at).toLocaleString()}</div>
              </div>
              <button onClick={()=>dismissNotification(n.id)} style={{background:'none',border:'none',color:sub,cursor:'pointer',fontSize:'1rem',padding:'0 0 0 12px',flexShrink:0}}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div style={{padding:'20px 24px'}}>
        {/* Confirmed */}
        {confirmed.length>0&&(
          <>
            <div style={{fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.12em',color:sub,marginBottom:10,paddingLeft:4}}>Upcoming Trips</div>
            {confirmed.map(b=><BookingCard key={b.ref} b={b} dark={dark} onRequestCancel={handleRequestCancel} onUndoCancel={handleUndoCancel}/>)}
          </>
        )}

        {/* Pending */}
        {pending.length>0&&(
          <>
            <div style={{fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.12em',color:'#f5c842',marginBottom:10,paddingLeft:4,marginTop:confirmed.length>0?20:0}}>⏳ Pending Cancellation</div>
            {pending.map(b=><BookingCard key={b.ref} b={b} dark={dark} onRequestCancel={handleRequestCancel} onUndoCancel={handleUndoCancel}/>)}
          </>
        )}

        {/* Cancelled */}
        {cancelledTrips.length>0&&(
          <>
            <div style={{fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.12em',color:'#ff7a5c',marginBottom:10,paddingLeft:4,marginTop:20}}>❌ Cancelled</div>
            {cancelledTrips.map(b=><BookingCard key={b.ref} b={b} dark={dark} onRequestCancel={handleRequestCancel} onUndoCancel={handleUndoCancel}/>)}
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
