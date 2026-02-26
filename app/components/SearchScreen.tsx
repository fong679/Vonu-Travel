'use client'
import { useState } from 'react'
import { PORTS, Passenger, formatDate, getRoutesForDate } from '@/lib/routes'
import AvatarIcon from '@/components/AvatarIcon'

interface Props {
  origin:string; setOrigin:(v:string)=>void
  destination:string; setDestination:(v:string)=>void
  selectedDate:Date; setSelectedDate:(d:Date)=>void
  passengers:Passenger; setPassengers:(p:Passenger)=>void
  onSearch:()=>void; user:any; theme:'dark'|'light'
}

export default function SearchScreen({origin,setOrigin,destination,setDestination,selectedDate,setSelectedDate,passengers,setPassengers,onSearch,user,theme}:Props) {
  const [showPassengers,setShowPassengers]=useState(false)
  const [showCalendar,setShowCalendar]=useState(false)
  const dark=theme==='dark'
  const bg=dark?'#071e30':'#f0f4f8'
  const card=dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'
  const border=dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'
  const text=dark?'white':'#1a2e3b'
  const sub=dark?'#7eabc5':'#5a7a8a'

  function swap(){const t=origin;setOrigin(destination);setDestination(t)}

  const totalPax=passengers.adults+passengers.children+passengers.infants
  const paxLabel=`${passengers.adults} Adult${passengers.adults>1?'s':''}${passengers.children>0?`, ${passengers.children} Child${passengers.children>1?'ren':''}` :''}${passengers.infants>0?`, ${passengers.infants} Infant${passengers.infants>1?'s':''}`:''}`

  // Calendar helpers
  const today=new Date()
  const [calMonth,setCalMonth]=useState(selectedDate.getMonth())
  const [calYear,setCalYear]=useState(selectedDate.getFullYear())
  const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December']
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate()
  const firstDay=new Date(calYear,calMonth,1).getDay()
  const availableDays:number[]=[]
  for(let d=1;d<=daysInMonth;d++){
    const dt=new Date(calYear,calMonth,d)
    if(dt>=today&&getRoutesForDate(origin,destination,dt).length>0) availableDays.push(d)
  }

  const sel={flex:1,padding:'12px 14px',background:'transparent',border:'none',outline:'none',color:text,fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'1rem',cursor:'pointer',appearance:'none' as const}

  return (
    <div style={{minHeight:'100vh',background:bg,fontFamily:'DM Sans,sans-serif',paddingBottom:100}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px 16px',borderBottom:`1px solid ${border}`}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.3rem',color:text}}>Vonu<span style={{color:'#ff5c3a'}}>-</span>Travel</div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:card,border:`1px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',cursor:'pointer'}}>🔔</div>
          <AvatarIcon user={user} theme={theme}/>
        </div>
      </nav>

      <div style={{padding:'28px 24px 20px'}}>
        {user&&<div style={{background:'rgba(0,165,80,0.08)',border:'1px solid rgba(0,165,80,0.2)',borderRadius:10,padding:'8px 14px',marginBottom:16,fontSize:'0.8rem',color:'#4dd882'}}>👋 Welcome back, {user.email.split('@')[0]}!</div>}
        <p style={{fontSize:'0.7rem',fontWeight:500,letterSpacing:'0.12em',textTransform:'uppercase',color:'#ff5c3a',marginBottom:6}}>Plan your journey</p>
        <h1 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.7rem',lineHeight:1.15,color:text,marginBottom:24}}>Where are you<br/>headed?</h1>

        {/* Route Card */}
        <div style={{background:card,border:`1px solid ${border}`,borderRadius:18,padding:6,marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',padding:'4px 8px 4px 0'}}>
            <div style={{width:32,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <div style={{width:10,height:10,borderRadius:'50%',border:'2px solid #ff5c3a',background:'transparent'}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.65rem',textTransform:'uppercase',letterSpacing:'0.1em',color:sub,marginBottom:2,paddingLeft:6}}>FROM</div>
              <select value={origin} onChange={e=>setOrigin(e.target.value)} style={{...sel,paddingLeft:6,paddingTop:4,paddingBottom:4}}>{PORTS.map(p=><option key={p} value={p} style={{background:dark?'#0b2e4a':'white'}}>{p}</option>)}</select>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',margin:'0 8px'}}>
            <div style={{width:24,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
              <div style={{width:1,height:6,background:dark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.15)'}}/>
              <div style={{width:1,height:6,background:dark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.15)'}}/>
            </div>
            <div style={{flex:1,height:1,background:border}}/>
            <button onClick={swap} style={{width:34,height:34,borderRadius:'50%',background:'#ff5c3a',border:'none',color:'white',fontSize:'0.9rem',cursor:'pointer',boxShadow:'0 4px 16px rgba(255,92,58,0.4)',flexShrink:0}}>⇅</button>
          </div>
          <div style={{display:'flex',alignItems:'center',padding:'4px 8px 4px 0'}}>
            <div style={{width:32,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <div style={{width:10,height:10,borderRadius:2,background:'#ff5c3a'}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.65rem',textTransform:'uppercase',letterSpacing:'0.1em',color:sub,marginBottom:2,paddingLeft:6}}>TO</div>
              <select value={destination} onChange={e=>setDestination(e.target.value)} style={{...sel,paddingLeft:6,paddingTop:4,paddingBottom:4}}>{PORTS.map(p=><option key={p} value={p} style={{background:dark?'#0b2e4a':'white'}}>{p}</option>)}</select>
            </div>
          </div>
        </div>

        {/* Date & Passengers */}
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <div onClick={()=>{setShowCalendar(true);setShowPassengers(false)}} style={{flex:1,padding:'12px 14px',background:card,border:`1px solid ${border}`,borderRadius:12,cursor:'pointer'}}>
            <span style={{fontSize:'0.72rem',color:sub,display:'block',textTransform:'uppercase',letterSpacing:'0.08em'}}>📅 Departure</span>
            <strong style={{fontSize:'0.9rem',color:text,display:'block',marginTop:2}}>{formatDate(selectedDate)}</strong>
          </div>
          <div onClick={()=>{setShowPassengers(!showPassengers);setShowCalendar(false)}} style={{flex:1,padding:'12px 14px',background:card,border:`1px solid ${border}`,borderRadius:12,cursor:'pointer'}}>
            <span style={{fontSize:'0.72rem',color:sub,display:'block',textTransform:'uppercase',letterSpacing:'0.08em'}}>👥 Passengers</span>
            <strong style={{fontSize:'0.85rem',color:text,display:'block',marginTop:2}}>{paxLabel}</strong>
          </div>
        </div>

        {/* Passenger Selector */}
        {showPassengers&&(
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:16,marginBottom:12}}>
            {[
              {label:'Adults',sub:'Age 12+',key:'adults',min:1},
              {label:'Children',sub:'Age 6–11 (50% off)',key:'children',min:0},
              {label:'Infants',sub:'Under 6 (Free)',key:'infants',min:0},
            ].map(p=>(
              <div key={p.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <div>
                  <div style={{fontWeight:600,color:text,fontSize:'0.9rem'}}>{p.label}</div>
                  <div style={{fontSize:'0.75rem',color:sub}}>{p.sub}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <button onClick={()=>setPassengers({...passengers,[p.key]:Math.max(p.min,(passengers as any)[p.key]-1)})} style={{width:32,height:32,borderRadius:'50%',background:'rgba(255,92,58,0.15)',border:'1px solid rgba(255,92,58,0.3)',color:'#ff5c3a',fontSize:'1.1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                  <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1rem',color:text,minWidth:20,textAlign:'center'}}>{(passengers as any)[p.key]}</span>
                  <button onClick={()=>setPassengers({...passengers,[p.key]:(passengers as any)[p.key]+1})} style={{width:32,height:32,borderRadius:'50%',background:'rgba(255,92,58,0.15)',border:'1px solid rgba(255,92,58,0.3)',color:'#ff5c3a',fontSize:'1.1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                </div>
              </div>
            ))}
            <button onClick={()=>setShowPassengers(false)} style={{width:'100%',padding:'10px',background:'#ff5c3a',border:'none',borderRadius:10,color:'white',fontFamily:'Syne,sans-serif',fontWeight:700,cursor:'pointer'}}>Done</button>
          </div>
        )}

        {/* Calendar */}
        {showCalendar&&(
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:16,marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <button onClick={()=>{if(calMonth===0){setCalMonth(11);setCalYear(calYear-1)}else setCalMonth(calMonth-1)}} style={{background:'none',border:'none',color:text,fontSize:'1.2rem',cursor:'pointer'}}>‹</button>
              <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:text}}>{monthNames[calMonth]} {calYear}</span>
              <button onClick={()=>{if(calMonth===11){setCalMonth(0);setCalYear(calYear+1)}else setCalMonth(calMonth+1)}} style={{background:'none',border:'none',color:text,fontSize:'1.2rem',cursor:'pointer'}}>›</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:8}}>
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><div key={d} style={{textAlign:'center',fontSize:'0.7rem',color:sub,fontWeight:600}}>{d}</div>)}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
              {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`}/>)}
              {Array(daysInMonth).fill(null).map((_,i)=>{
                const d=i+1
                const dt=new Date(calYear,calMonth,d)
                const isSelected=dt.toDateString()===selectedDate.toDateString()
                const hasRoutes=availableDays.includes(d)
                const isPast=dt<today
                return (
                  <button key={d} disabled={isPast||!hasRoutes} onClick={()=>{setSelectedDate(new Date(calYear,calMonth,d));setShowCalendar(false)}}
                    style={{aspectRatio:'1',borderRadius:'50%',border:'none',fontSize:'0.82rem',cursor:isPast||!hasRoutes?'default':'pointer',fontWeight:isSelected?700:400,background:isSelected?'#ff5c3a':hasRoutes?'rgba(255,92,58,0.1)':'transparent',color:isSelected?'white':isPast?dark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.2)':hasRoutes?'#ff5c3a':text,position:'relative'}}>
                    {d}
                    {hasRoutes&&!isSelected&&<div style={{position:'absolute',bottom:2,left:'50%',transform:'translateX(-50%)',width:4,height:4,borderRadius:'50%',background:'#ff5c3a'}}/>}
                  </button>
                )
              })}
            </div>
            <div style={{marginTop:10,fontSize:'0.75rem',color:sub,display:'flex',gap:12,alignItems:'center'}}>
              <span><span style={{color:'#ff5c3a'}}>●</span> Ferry available</span>
              <span style={{color:dark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.3)'}}>● No service</span>
            </div>
          </div>
        )}

        <button onClick={onSearch} style={{width:'100%',padding:15,background:'#ff5c3a',border:'none',borderRadius:14,color:'white',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1rem',cursor:'pointer',boxShadow:'0 6px 24px rgba(255,92,58,0.4)'}}>Search Ferries →</button>
      </div>

      <div style={{padding:'0 24px'}}>
        <p style={{fontSize:'0.7rem',fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:sub,marginBottom:12}}>Popular Routes</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
          {[['Suva','Savusavu'],['Suva','Lautoka'],['Suva','Taveuni'],['Suva','Kadavu'],['Lautoka','Yasawa']].map(([o,d])=>(
            <button key={o+d} onClick={()=>{setOrigin(o);setDestination(d)}} style={{padding:'7px 14px',background:card,border:`1px solid ${border}`,borderRadius:20,color:sub,fontSize:'0.8rem',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>{o} → {d}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
