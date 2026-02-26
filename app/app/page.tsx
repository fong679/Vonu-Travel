'use client'
import { useState, useEffect } from 'react'
import { Ferry, Booking } from '@/lib/routes'
import { createClient } from '@/lib/supabase'
import SearchScreen from '@/components/SearchScreen'
import ResultsScreen from '@/components/ResultsScreen'
import BookingScreen from '@/components/BookingScreen'
import TicketScreen from '@/components/TicketScreen'
import MyTripsScreen from '@/components/MyTripsScreen'
import BottomNav from '@/components/BottomNav'

export default function Home() {
  const [tab,setTab]=useState('search')
  const [stage,setStage]=useState('search')
  const [origin,setOrigin]=useState('Suva')
  const [destination,setDestination]=useState('Savusavu')
  const [date]=useState('Wed, 4 Mar 2026')
  const [selectedFerry,setSelectedFerry]=useState<Ferry|null>(null)
  const [selectedClass,setSelectedClass]=useState<'Economy'|'Cabin'>('Economy')
  const [currentBooking,setCurrentBooking]=useState<Booking|null>(null)
  const [trips,setTrips]=useState<Booking[]>([])
  const [user,setUser]=useState<any>(null)
  const supabase=createClient()

  useEffect(()=>{
    // Get current user
    supabase.auth.getUser().then(({data})=>{
      setUser(data.user)
      if(data.user) loadTrips(data.user.id)
    })
    // Listen for auth changes
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user??null)
      if(session?.user) loadTrips(session.user.id)
      else setTrips([])
    })
    return ()=>subscription.unsubscribe()
  },[])

  async function loadTrips(userId: string){
    const {data}=await supabase.from('bookings').select('*').eq('user_id',userId).order('created_at',{ascending:false})
    if(data){
      setTrips(data.map((r:any)=>({
        ferry:{id:0,operator:r.ferry_operator,ship:r.ferry_ship,icon:'🚢',departs:r.ferry_departs,arrives:r.ferry_arrives,duration:'',economy:r.price,cabin:r.price,tag:'',tagColor:''},
        selectedClass:r.selected_class,origin:r.origin,destination:r.destination,date:r.date,
        passengerName:r.passenger_name,passengerId:r.passenger_id,phone:r.phone,ref:r.ref,price:r.price,passengers:r.passengers||{adults:1,children:0,infants:0},status:r.status||'upcoming',departureDateTime:r.departure_datetime||''
      })))
    }
  }

  async function handleConfirmBooking(name:string,id:string,phone:string){
    if(!selectedFerry)return
    const price=selectedClass==='Economy'?selectedFerry.economy:selectedFerry.cabin
    const ref='VT-'+Math.floor(1000+Math.random()*9000)
    const booking:Booking={ferry:selectedFerry,selectedClass,origin,destination,date,passengerName:name,passengerId:id,phone,ref,price}
    setCurrentBooking(booking)
    setTrips(prev=>[booking,...prev])
    setStage('ticket')
    // Save to Supabase if logged in
    if(user){
      await supabase.from('bookings').insert({
        user_id:user.id,ref,origin,destination,date,
        passenger_name:name,passenger_id:id,phone,
        ferry_operator:selectedFerry.operator,ferry_ship:selectedFerry.ship,
        ferry_departs:selectedFerry.departs,ferry_arrives:selectedFerry.arrives,
        selected_class:selectedClass,price
      })
    }
  }

  function handleSelectFerry(ferry:Ferry,cls:'Economy'|'Cabin'){
    setSelectedFerry(ferry);setSelectedClass(cls);setStage('booking')
  }

  return (
    <div style={{maxWidth:480,margin:'0 auto',minHeight:'100vh',position:'relative'}}>
      {tab==='search'&&(
        <>
          {stage==='search'&&<SearchScreen origin={origin} setOrigin={setOrigin} destination={destination} setDestination={setDestination} date={date} onSearch={()=>setStage('results')} user={user}/>}
          {stage==='results'&&<ResultsScreen origin={origin} destination={destination} date={date} onSelect={handleSelectFerry} onBack={()=>setStage('search')}/>}
          {stage==='booking'&&selectedFerry&&<BookingScreen ferry={selectedFerry} selectedClass={selectedClass} origin={origin} destination={destination} date={date} onConfirm={handleConfirmBooking} onBack={()=>setStage('results')}/>}
          {stage==='ticket'&&currentBooking&&<TicketScreen booking={currentBooking} onDone={()=>{setStage('search');setTab('trips')}}/>}
        </>
      )}
      {tab==='trips'&&<MyTripsScreen trips={trips} user={user}/>}
      {tab==='history'&&<div style={{padding:'80px 24px',color:'#7eabc5',textAlign:'center',fontFamily:'DM Sans,sans-serif',marginTop:80}}>No history yet.</div>}
      {tab==='settings'&&<div style={{padding:'80px 24px',color:'#7eabc5',textAlign:'center',fontFamily:'DM Sans,sans-serif',marginTop:80}}>Settings coming soon.</div>}
      <BottomNav active={tab} onChange={t=>{setTab(t);setStage('search')}}/>
    </div>
  )
}
