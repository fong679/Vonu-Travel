'use client'
import { useState, useEffect, useMemo } from 'react'
import MFASettings from '@/components/operator/MFASettings'

type Booking = {
  id:string; ref:string; origin:string; destination:string
  date:string; ferry_ship:string; ferry_operator:string
  ferry_departs:string; selected_class:string; price:number
  passenger_name:string; passenger_id:string; phone:string
  status:string; cancellation_requested:boolean
  cancellation_requested_at:string; departure_datetime:string
  passengers:any; created_at:string; user_id:string
}

type Route = {
  id:string; origin:string; destination:string; ferry_name:string
  operator_name:string; departs:string; arrives:string; duration:string
  economy_fare:number; cabin_fare:number; seats_economy:number
  seats_cabin:number; days_of_week:number[]; active:boolean; created_at:string
}

const TABS=[{key:'dashboard',icon:'📊',label:'Dashboard'},{key:'bookings',icon:'🎫',label:'Bookings'},{key:'cancellations',icon:'⏳',label:'Cancels'},{key:'routes',icon:'🗺️',label:'Routes'},{key:'settings',icon:'⚙️',label:'Settings'}]
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const PORTS=['Suva','Savusavu','Labasa','Lautoka','Levuka','Koro','Taveuni','Kadavu','Rotuma','Yasawa']

export default function OperatorDashboard({user,profile,supabase}:{user:any;profile:any;supabase:any}) {
  const [tab,setTab]=useState('dashboard')
  const [bookings,setBookings]=useState<Booking[]>([])
  const [routes,setRoutes]=useState<Route[]>([])
  const [loading,setLoading]=useState(true)
  const [filterStatus,setFilterStatus]=useState('all')
  const [filterVessel,setFilterVessel]=useState('all')
  const [filterDestination,setFilterDestination]=useState('all')
  const [filterDate,setFilterDate]=useState('')
  const [sortBy,setSortBy]=useState('date_desc')
  const [search,setSearch]=useState('')
  const [expandedId,setExpandedId]=useState<string|null>(null)
  const [showRouteForm,setShowRouteForm]=useState(false)
  const [editingRoute,setEditingRoute]=useState<Route|null>(null)
  const [routeForm,setRouteForm]=useState({origin:'Suva',destination:'Savusavu',ferry_name:'',operator_name:'',departs:'08:00',arrives:'18:00',duration:'',economy_fare:0,cabin_fare:0,seats_economy:0,seats_cabin:0,days_of_week:[] as number[],active:true})
  const [savingRoute,setSavingRoute]=useState(false)

  useEffect(()=>{loadBookings();loadRoutes()},[])

  async function loadBookings(){
    setLoading(true)
    const {data}=await supabase.from('bookings').select('*').order('created_at',{ascending:false})
    if(data) setBookings(data)
    setLoading(false)
  }

  async function loadRoutes(){
    const {data}=await supabase.from('ferry_routes').select('*').order('created_at',{ascending:false})
    if(data) setRoutes(data)
  }

  async function sendNotification(userId:string,title:string,message:string,type:string,bookingRef:string){
    await supabase.from('notifications').insert({
      user_id:userId,title,message,type,booking_ref:bookingRef,read:false
    })
  }

  async function markComplete(id:string){
    await supabase.from('bookings').update({status:'completed'}).eq('id',id)
    setBookings(prev=>prev.map(b=>b.id===id?{...b,status:'completed'}:b))
  }

  async function confirmCancellation(b:Booking){
    await supabase.from('bookings').update({status:'cancelled',cancellation_requested:false}).eq('id',b.id)
    setBookings(prev=>prev.map(x=>x.id===b.id?{...x,status:'cancelled',cancellation_requested:false}:x))
    // Notify passenger
    await sendNotification(
      b.user_id,
      'Booking Cancelled',
      `Your booking ${b.ref} (${b.origin} → ${b.destination} on ${b.date}) has been cancelled by the ferry operator. Please contact us if you have any questions.`,
      'cancellation_confirmed',
      b.ref
    )
  }

  async function rejectCancellation(b:Booking){
    await supabase.from('bookings').update({cancellation_requested:false,cancellation_requested_at:null}).eq('id',b.id)
    setBookings(prev=>prev.map(x=>x.id===b.id?{...x,cancellation_requested:false}:x))
    // Notify passenger
    await sendNotification(
      b.user_id,
      'Cancellation Request Rejected',
      `Your cancellation request for booking ${b.ref} (${b.origin} → ${b.destination} on ${b.date}) has been reviewed. Your ticket remains valid — we look forward to seeing you on board!`,
      'cancellation_rejected',
      b.ref
    )
  }

  async function saveRoute(){
    setSavingRoute(true)
    if(editingRoute){
      await supabase.from('ferry_routes').update(routeForm).eq('id',editingRoute.id)
      setRoutes(prev=>prev.map(r=>r.id===editingRoute.id?{...r,...routeForm}:r))
    } else {
      const {data}=await supabase.from('ferry_routes').insert(routeForm).select().single()
      if(data) setRoutes(prev=>[data,...prev])
    }
    setSavingRoute(false);setShowRouteForm(false);setEditingRoute(null);resetRouteForm()
  }

  async function toggleRouteActive(id:string,active:boolean){
    await supabase.from('ferry_routes').update({active:!active}).eq('id',id)
    setRoutes(prev=>prev.map(r=>r.id===id?{...r,active:!active}:r))
  }

  async function deleteRoute(id:string){
    if(!confirm('Delete this route?')) return
    await supabase.from('ferry_routes').delete().eq('id',id)
    setRoutes(prev=>prev.filter(r=>r.id!==id))
  }

  function resetRouteForm(){setRouteForm({origin:'Suva',destination:'Savusavu',ferry_name:'',operator_name:'',departs:'08:00',arrives:'18:00',duration:'',economy_fare:0,cabin_fare:0,seats_economy:0,seats_cabin:0,days_of_week:[],active:true})}

  function editRoute(r:Route){
    setEditingRoute(r)
    setRouteForm({origin:r.origin,destination:r.destination,ferry_name:r.ferry_name,operator_name:r.operator_name,departs:r.departs,arrives:r.arrives,duration:r.duration,economy_fare:r.economy_fare,cabin_fare:r.cabin_fare,seats_economy:r.seats_economy,seats_cabin:r.seats_cabin,days_of_week:r.days_of_week||[],active:r.active})
    setShowRouteForm(true)
  }

  const vessels=[...new Set(bookings.map(b=>b.ferry_ship))].filter(Boolean)
  const destinations=[...new Set(bookings.map(b=>b.destination))].filter(Boolean)

  const filteredBookings=useMemo(()=>{
    let b=[...bookings]
    if(filterStatus==='pending') b=b.filter(x=>x.cancellation_requested)
    else if(filterStatus!=='all') b=b.filter(x=>x.status===filterStatus)
    if(filterVessel!=='all') b=b.filter(x=>x.ferry_ship===filterVessel)
    if(filterDestination!=='all') b=b.filter(x=>x.destination===filterDestination)
    if(filterDate) b=b.filter(x=>x.date?.includes(filterDate)||x.departure_datetime?.startsWith(filterDate))
    if(search) b=b.filter(x=>x.passenger_name?.toLowerCase().includes(search.toLowerCase())||x.ref?.toLowerCase().includes(search.toLowerCase())||x.phone?.includes(search))
    b.sort((a,z)=>{
      if(sortBy==='date_desc') return new Date(z.departure_datetime||z.created_at).getTime()-new Date(a.departure_datetime||a.created_at).getTime()
      if(sortBy==='date_asc') return new Date(a.departure_datetime||a.created_at).getTime()-new Date(z.departure_datetime||z.created_at).getTime()
      if(sortBy==='price_desc') return z.price-a.price
      if(sortBy==='price_asc') return a.price-z.price
      if(sortBy==='name') return (a.passenger_name||'').localeCompare(z.passenger_name||'')
      return 0
    })
    return b
  },[bookings,filterStatus,filterVessel,filterDestination,filterDate,sortBy,search])

  const upcoming=bookings.filter(b=>b.status==='upcoming'&&!b.cancellation_requested)
  const pending=bookings.filter(b=>b.cancellation_requested)

  const bg='#071e30';const card='rgba(14,61,92,0.5)';const border='rgba(255,255,255,0.08)';const text='white';const sub='#7eabc5'
  const inp={padding:'9px 12px',background:'rgba(255,255,255,0.05)',border:`1px solid ${border}`,borderRadius:8,color:text,fontSize:'0.82rem',outline:'none',fontFamily:'DM Sans,sans-serif',width:'100%',boxSizing:'border-box' as const}
  const sel={...inp,cursor:'pointer'}

  function Badge({status,isPending}:{status:string;isPending?:boolean}){
    if(isPending) return <span style={{fontSize:'0.7rem',color:'#f5c842',background:'rgba(245,200,66,0.1)',padding:'2px 8px',borderRadius:8,border:'1px solid rgba(245,200,66,0.25)'}}>⏳ Pending</span>
    const map:Record<string,any>={upcoming:{c:'#4dd882',bg:'rgba(0,165,80,0.1)',l:'Confirmed'},completed:{c:'#7eabc5',bg:'rgba(126,171,197,0.1)',l:'Completed'},cancelled:{c:'#ff7a5c',bg:'rgba(255,92,58,0.1)',l:'Cancelled'}}
    const s=map[status]||map.upcoming
    return <span style={{fontSize:'0.7rem',color:s.c,background:s.bg,padding:'2px 8px',borderRadius:8,border:`1px solid ${s.c}30`}}>{s.l}</span>
  }

  function BookingRow({b}:{b:Booking}){
    const isExpanded=expandedId===b.id
    return (
      <div style={{background:card,border:`1px solid ${b.cancellation_requested?'rgba(245,200,66,0.3)':b.status==='cancelled'?'rgba(255,92,58,0.2)':border}`,borderRadius:12,marginBottom:8,overflow:'hidden'}}>
        <div onClick={()=>setExpandedId(isExpanded?null:b.id)} style={{padding:'12px 16px',cursor:'pointer'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
            <div>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.92rem',color:text,marginBottom:3}}>{b.origin} → {b.destination}</div>
              <div style={{fontSize:'0.75rem',color:sub}}>{b.ferry_ship} · {b.date} · {b.ferry_departs}</div>
            </div>
            <div style={{textAlign:'right',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
              <Badge status={b.status} isPending={b.cancellation_requested}/>
              <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#f5c842',fontSize:'0.88rem'}}>FJD {b.price}</span>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:'0.75rem',color:sub}}>👤 {b.passenger_name} · {b.selected_class}</div>
            <span style={{color:sub,fontSize:'0.75rem'}}>{isExpanded?'▲':'▼'}</span>
          </div>
        </div>
        {isExpanded&&(
          <div style={{borderTop:`1px solid ${border}`,padding:'14px 16px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px 12px',marginBottom:14}}>
              {[{l:'REF',v:b.ref},{l:'Phone',v:b.phone},{l:'ID',v:b.passenger_id},{l:'Operator',v:b.ferry_operator},{l:'Class',v:b.selected_class},{l:'Passengers',v:b.passengers?`${b.passengers.adults||1}A ${b.passengers.children||0}C ${b.passengers.infants||0}I`:'1A'}].map(i=>(
                <div key={i.l}>
                  <div style={{fontSize:'0.62rem',textTransform:'uppercase',letterSpacing:'0.08em',color:sub,marginBottom:2}}>{i.l}</div>
                  <div style={{fontSize:'0.8rem',color:text,fontWeight:500,wordBreak:'break-all'}}>{i.v}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {b.status==='upcoming'&&!b.cancellation_requested&&(
                <button onClick={()=>markComplete(b.id)} style={{flex:1,padding:'9px',borderRadius:8,border:'none',background:'rgba(126,171,197,0.12)',color:'#7eabc5',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.8rem',cursor:'pointer'}}>✓ Mark Complete</button>
              )}
              {b.cancellation_requested&&(
                <>
                  <button onClick={()=>rejectCancellation(b)} style={{flex:1,padding:'9px',borderRadius:8,border:'1px solid rgba(0,165,80,0.3)',background:'rgba(0,165,80,0.08)',color:'#4dd882',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.8rem',cursor:'pointer'}}>↩ Reject Cancel</button>
                  <button onClick={()=>confirmCancellation(b)} style={{flex:1,padding:'9px',borderRadius:8,border:'1px solid rgba(255,92,58,0.3)',background:'rgba(255,92,58,0.08)',color:'#ff5c3a',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.8rem',cursor:'pointer'}}>✓ Confirm Cancel</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:bg,fontFamily:'DM Sans,sans-serif',paddingBottom:80}}>
      <div style={{padding:'16px 20px',borderBottom:`1px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,background:bg,zIndex:20}}>
        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.1rem',color:text}}>Vonu<span style={{color:'#ff5c3a'}}>-</span>Travel <span style={{color:'#ff5c3a',fontSize:'0.7rem',fontWeight:600,background:'rgba(255,92,58,0.1)',padding:'2px 7px',borderRadius:5,border:'1px solid rgba(255,92,58,0.3)'}}>OPERATOR</span></div>
          <div style={{fontSize:'0.72rem',color:sub}}>{profile.operator_name||user.email}</div>
        </div>
        <button onClick={()=>loadBookings()} style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${border}`,background:'transparent',color:sub,fontSize:'0.78rem',cursor:'pointer'}}>↻ Refresh</button>
      </div>

      <div style={{padding:'16px 20px'}}>

        {tab==='dashboard'&&(
          <div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
              {[
                {label:'Total',value:bookings.length,color:'#7eabc5',icon:'🎫',sub:'all bookings'},
                {label:'Upcoming',value:upcoming.length,color:'#4dd882',icon:'🚢',sub:'confirmed'},
                {label:'Pending',value:pending.length,color:'#f5c842',icon:'⏳',sub:'cancellations'},
                {label:'Completed',value:bookings.filter(b=>b.status==='completed').length,color:'#7eabc5',icon:'✓',sub:'trips done'},
              ].map(s=>(
                <div key={s.label} style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:'12px 14px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.5rem',color:s.color,lineHeight:1}}>{s.value}</div>
                      <div style={{fontSize:'0.7rem',color:sub,marginTop:4}}>{s.sub}</div>
                    </div>
                    <span style={{fontSize:'1.3rem'}}>{s.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.9rem',color:text,marginBottom:10}}>Today's Departures</div>
            {(()=>{
              const today=new Date().toDateString()
              const todayBookings=upcoming.filter(b=>{try{return new Date(b.departure_datetime).toDateString()===today}catch{return false}})
              if(todayBookings.length===0) return <div style={{padding:'16px',background:card,borderRadius:10,fontSize:'0.82rem',color:sub,textAlign:'center',marginBottom:16}}>No departures today</div>
              return <div style={{marginBottom:16}}>{todayBookings.map(b=><BookingRow key={b.id} b={b}/>)}</div>
            })()}

            {pending.length>0&&(
              <div onClick={()=>setTab('cancellations')} style={{padding:'14px 16px',background:'rgba(245,200,66,0.08)',border:'1px solid rgba(245,200,66,0.3)',borderRadius:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <div>
                  <div style={{fontSize:'0.85rem',fontWeight:600,color:'#f5c842'}}>⏳ {pending.length} cancellation{pending.length>1?'s':''} awaiting review</div>
                  <div style={{fontSize:'0.72rem',color:'#a89040',marginTop:2}}>Tap to review</div>
                </div>
                <span style={{color:'#f5c842',fontSize:'1.2rem'}}>›</span>
              </div>
            )}

            <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.9rem',color:text,marginBottom:10}}>Active Routes</div>
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:12,overflow:'hidden'}}>
              {routes.filter(r=>r.active).length===0
                ?<div style={{padding:'20px',fontSize:'0.82rem',color:sub,textAlign:'center'}}>No active routes. Add in Routes tab.</div>
                :routes.filter(r=>r.active).slice(0,4).map(r=>(
                  <div key={r.id} style={{padding:'10px 14px',borderBottom:`1px solid ${border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:'0.85rem',fontWeight:600,color:text}}>{r.origin} → {r.destination}</div>
                      <div style={{fontSize:'0.72rem',color:sub}}>{r.ferry_name} · {r.departs}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'0.78rem',color:'#f5c842',fontWeight:600}}>${r.economy_fare} FJD</div>
                      <div style={{fontSize:'0.68rem',color:sub}}>{r.days_of_week?.length||0} days/wk</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {tab==='bookings'&&(
          <div>
            <div style={{marginBottom:10}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, REF, phone..." style={inp}/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={sel}>
                <option value="all">All Status</option>
                <option value="upcoming">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending Cancel</option>
              </select>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={sel}>
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="price_desc">Highest Price</option>
                <option value="price_asc">Lowest Price</option>
                <option value="name">By Name</option>
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
              <select value={filterVessel} onChange={e=>setFilterVessel(e.target.value)} style={sel}>
                <option value="all">All Vessels</option>
                {vessels.map(v=><option key={v} value={v}>{v}</option>)}
              </select>
              <select value={filterDestination} onChange={e=>setFilterDestination(e.target.value)} style={sel}>
                <option value="all">All Destinations</option>
                {destinations.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <input value={filterDate} onChange={e=>setFilterDate(e.target.value)} type="date" style={{...inp,marginBottom:10}}/>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
              <span style={{fontSize:'0.78rem',color:sub}}>{filteredBookings.length} bookings</span>
              {(filterStatus!=='all'||filterVessel!=='all'||filterDestination!=='all'||filterDate||search)&&(
                <button onClick={()=>{setFilterStatus('all');setFilterVessel('all');setFilterDestination('all');setFilterDate('');setSearch('')}} style={{fontSize:'0.75rem',color:'#ff5c3a',background:'none',border:'none',cursor:'pointer'}}>Clear filters</button>
              )}
            </div>
            {loading?<div style={{color:sub,textAlign:'center',padding:40}}>Loading...</div>
              :filteredBookings.length===0?<div style={{textAlign:'center',padding:'40px 0',color:sub}}><div style={{fontSize:'2rem',marginBottom:8}}>🔍</div><p>No bookings match</p></div>
              :filteredBookings.map(b=><BookingRow key={b.id} b={b}/>)
            }
          </div>
        )}

        {tab==='cancellations'&&(
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1rem',color:text,marginBottom:4}}>Cancellation Requests</div>
            <div style={{fontSize:'0.78rem',color:sub,marginBottom:16}}>{pending.length} pending review</div>
            {pending.length===0?(
              <div style={{textAlign:'center',padding:'60px 0',color:sub}}>
                <div style={{fontSize:'2.5rem',marginBottom:12}}>✓</div>
                <p style={{color:text,fontWeight:600}}>No pending cancellations</p>
              </div>
            ):pending.map(b=>(
              <div key={b.id} style={{background:card,border:'1px solid rgba(245,200,66,0.3)',borderRadius:14,padding:16,marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <div>
                    <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:text}}>{b.origin} → {b.destination}</div>
                    <div style={{fontSize:'0.78rem',color:sub,marginTop:2}}>{b.ferry_ship} · {b.date} · {b.ferry_departs}</div>
                  </div>
                  <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#f5c842'}}>FJD {b.price}</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 16px',marginBottom:14}}>
                  {[{l:'Passenger',v:b.passenger_name},{l:'REF',v:b.ref},{l:'Phone',v:b.phone},{l:'Requested',v:b.cancellation_requested_at?new Date(b.cancellation_requested_at).toLocaleString():'—'}].map(i=>(
                    <div key={i.l}>
                      <div style={{fontSize:'0.65rem',textTransform:'uppercase',color:sub,marginBottom:2}}>{i.l}</div>
                      <div style={{fontSize:'0.82rem',color:text}}>{i.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>rejectCancellation(b)} style={{flex:1,padding:'10px',borderRadius:10,border:'1px solid rgba(0,165,80,0.3)',background:'rgba(0,165,80,0.08)',color:'#4dd882',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.82rem',cursor:'pointer'}}>↩ Reject — Keep Booking</button>
                  <button onClick={()=>confirmCancellation(b)} style={{flex:1,padding:'10px',borderRadius:10,border:'1px solid rgba(255,92,58,0.3)',background:'rgba(255,92,58,0.08)',color:'#ff5c3a',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.82rem',cursor:'pointer'}}>✓ Confirm Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==='routes'&&(
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div>
                <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1rem',color:text}}>Ferry Routes</div>
                <div style={{fontSize:'0.75rem',color:sub}}>{routes.length} routes · {routes.filter(r=>r.active).length} active</div>
              </div>
              <button onClick={()=>{setEditingRoute(null);resetRouteForm();setShowRouteForm(true)}} style={{padding:'8px 16px',borderRadius:10,border:'none',background:'#ff5c3a',color:'white',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.82rem',cursor:'pointer'}}>+ Add Route</button>
            </div>
            {showRouteForm&&(
              <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:16,marginBottom:16}}>
                <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:text,marginBottom:14}}>{editingRoute?'Edit Route':'New Ferry Route'}</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                  <div><div style={{fontSize:'0.68rem',textTransform:'uppercase',color:sub,marginBottom:4}}>From</div><select value={routeForm.origin} onChange={e=>setRouteForm(p=>({...p,origin:e.target.value}))} style={sel}>{PORTS.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
                  <div><div style={{fontSize:'0.68rem',textTransform:'uppercase',color:sub,marginBottom:4}}>To</div><select value={routeForm.destination} onChange={e=>setRouteForm(p=>({...p,destination:e.target.value}))} style={sel}>{PORTS.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                  <div><div style={{fontSize:'0.68rem',textTransform:'uppercase',color:sub,marginBottom:4}}>Ferry Name</div><input value={routeForm.ferry_name} onChange={e=>setRouteForm(p=>({...p,ferry_name:e.target.value}))} placeholder="MV Cagimaira II" style={inp}/></div>
                  <div><div style={{fontSize:'0.68rem',textTransform:'uppercase',color:sub,marginBottom:4}}>Operator</div><input value={routeForm.operator_name} onChange={e=>setRouteForm(p=>({...p,operator_name:e.target.value}))} placeholder="Goundar Shipping" style={inp}/></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:10}}>
                  <div><div style={{fontSize:'0.68rem',textTransform:'uppercase',color:sub,marginBottom:4}}>Departs</div><input type="time" value={routeForm.departs} onChange={e=>setRouteForm(p=>({...p,departs:e.target.value}))} style={inp}/></div>
                  <div><div style={{fontSize:'0.68rem',textTransform:'uppercase',color:sub,marginBottom:4}}>Arrives</div><input type="time" value={routeForm.arrives} onChange={e=>setRouteForm(p=>({...p,arrives:e.target.value}))} style={inp}/></div>
                  <div><div style={{fontSize:'0.68rem',textTransform:'uppercase',color:sub,marginBottom:4}}>Duration</div><input value={routeForm.duration} onChange={e=>setRouteForm(p=>({...p,duration:e.target.value}))} placeholder="~14 hrs" style={inp}/></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10,marginBottom:10}}>
                  {[{l:'Economy $',k:'economy_fare'},{l:'Cabin $',k:'cabin_fare'},{l:'Eco Seats',k:'seats_economy'},{l:'Cabin Seats',k:'seats_cabin'}].map(f=>(
                    <div key={f.k}><div style={{fontSize:'0.65rem',textTransform:'uppercase',color:sub,marginBottom:4}}>{f.l}</div><input type="number" value={(routeForm as any)[f.k]} onChange={e=>setRouteForm(p=>({...p,[f.k]:Number(e.target.value)}))} style={inp}/></div>
                  ))}
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:'0.68rem',textTransform:'uppercase',color:sub,marginBottom:8}}>Operating Days</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {DAYS.map((d,i)=>(
                      <button key={i} onClick={()=>setRouteForm(p=>({...p,days_of_week:p.days_of_week.includes(i)?p.days_of_week.filter(x=>x!==i):[...p.days_of_week,i]}))}
                        style={{padding:'6px 12px',borderRadius:20,border:`1px solid ${routeForm.days_of_week.includes(i)?'#ff5c3a':border}`,background:routeForm.days_of_week.includes(i)?'rgba(255,92,58,0.15)':'transparent',color:routeForm.days_of_week.includes(i)?'#ff5c3a':sub,fontSize:'0.78rem',cursor:'pointer'}}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>{setShowRouteForm(false);setEditingRoute(null)}} style={{flex:1,padding:'10px',borderRadius:10,border:`1px solid ${border}`,background:'transparent',color:sub,fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'0.85rem',cursor:'pointer'}}>Cancel</button>
                  <button onClick={saveRoute} disabled={savingRoute||!routeForm.ferry_name} style={{flex:2,padding:'10px',borderRadius:10,border:'none',background:'#ff5c3a',color:'white',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',opacity:savingRoute||!routeForm.ferry_name?0.6:1}}>{savingRoute?'Saving...':editingRoute?'Save Changes':'Add Route'}</button>
                </div>
              </div>
            )}
            {routes.length===0?(
              <div style={{textAlign:'center',padding:'40px 0',color:sub}}><div style={{fontSize:'2.5rem',marginBottom:12}}>🗺️</div><p style={{color:text,fontWeight:600}}>No routes yet</p></div>
            ):routes.map(r=>(
              <div key={r.id} style={{background:card,border:`1px solid ${r.active?border:'rgba(255,255,255,0.04)'}`,borderRadius:12,padding:'14px 16px',marginBottom:8,opacity:r.active?1:0.6}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:text,fontSize:'0.95rem'}}>{r.origin} → {r.destination}</div>
                    <div style={{fontSize:'0.75rem',color:sub,marginTop:2}}>{r.ferry_name} · {r.operator_name}</div>
                    <div style={{fontSize:'0.75rem',color:sub}}>{r.departs} → {r.arrives} · {r.duration}</div>
                  </div>
                  <span style={{fontSize:'0.7rem',color:r.active?'#4dd882':'#ff7a5c',background:r.active?'rgba(0,165,80,0.1)':'rgba(255,92,58,0.1)',padding:'2px 8px',borderRadius:8}}>{r.active?'Active':'Inactive'}</span>
                </div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                  {DAYS.map((d,i)=>(
                    <span key={i} style={{padding:'2px 8px',borderRadius:12,fontSize:'0.68rem',background:r.days_of_week?.includes(i)?'rgba(255,92,58,0.15)':'rgba(255,255,255,0.04)',color:r.days_of_week?.includes(i)?'#ff7a5c':sub,border:`1px solid ${r.days_of_week?.includes(i)?'rgba(255,92,58,0.2)':border}`}}>{d}</span>
                  ))}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <div style={{fontSize:'0.78rem',color:'#f5c842'}}>Economy ${r.economy_fare} · Cabin ${r.cabin_fare||'N/A'}</div>
                  <div style={{fontSize:'0.75rem',color:sub}}>{r.seats_economy} eco · {r.seats_cabin} cabin</div>
                </div>
                <div style={{display:'flex',gap:6}}>
                  <button onClick={()=>editRoute(r)} style={{flex:1,padding:'8px',borderRadius:8,border:`1px solid ${border}`,background:'transparent',color:sub,fontSize:'0.78rem',cursor:'pointer'}}>✏️ Edit</button>
                  <button onClick={()=>toggleRouteActive(r.id,r.active)} style={{flex:1,padding:'8px',borderRadius:8,border:`1px solid ${r.active?'rgba(245,200,66,0.3)':'rgba(0,165,80,0.3)'}`,background:r.active?'rgba(245,200,66,0.08)':'rgba(0,165,80,0.08)',color:r.active?'#f5c842':'#4dd882',fontSize:'0.78rem',cursor:'pointer'}}>{r.active?'⏸ Deactivate':'▶ Activate'}</button>
                  <button onClick={()=>deleteRoute(r.id)} style={{flex:1,padding:'8px',borderRadius:8,border:'1px solid rgba(255,92,58,0.2)',background:'rgba(255,92,58,0.06)',color:'#ff5c3a',fontSize:'0.78rem',cursor:'pointer'}}>🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==='settings'&&(
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1rem',color:text,marginBottom:16}}>Operator Settings</div>
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,overflow:'hidden',marginBottom:16}}>
              {[{icon:'🏢',label:'Operator Name',value:profile.operator_name||'Not set'},{icon:'✉️',label:'Email',value:user.email},{icon:'🔑',label:'Role',value:'Operator'}].map(item=>(
                <div key={item.label} style={{padding:'14px 16px',borderBottom:`1px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}><span>{item.icon}</span><span style={{fontSize:'0.9rem',color:text}}>{item.label}</span></div>
                  <span style={{fontSize:'0.85rem',color:sub}}>{item.value}</span>
                </div>
              ))}
            </div>
            <MFASettings supabase={supabase}/>
            <button onClick={async()=>{await supabase.auth.signOut();window.location.href='/landing'}} style={{width:'100%',marginTop:16,padding:'13px',borderRadius:12,border:'1px solid rgba(255,92,58,0.3)',background:'rgba(255,92,58,0.08)',color:'#ff5c3a',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.9rem',cursor:'pointer'}}>Sign Out</button>
          </div>
        )}
      </div>

      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:480,background:'rgba(7,30,48,0.97)',backdropFilter:'blur(16px)',borderTop:`1px solid ${border}`,display:'flex',zIndex:10}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{flex:1,padding:'12px 4px 16px',display:'flex',flexDirection:'column',alignItems:'center',gap:3,cursor:'pointer',border:'none',background:'transparent',color:tab===t.key?'#ff5c3a':sub,fontFamily:'DM Sans,sans-serif',fontSize:'0.6rem',position:'relative'}}>
            {t.key==='cancellations'&&pending.length>0&&(
              <div style={{position:'absolute',top:8,right:'18%',width:16,height:16,borderRadius:'50%',background:'#f5c842',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.6rem',fontWeight:700,color:'#071e30'}}>{pending.length}</div>
            )}
            <span style={{fontSize:'1.1rem'}}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
