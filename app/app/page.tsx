'use client'
import { useState, useEffect } from 'react'
import { Ferry, Booking, Passenger, formatDate, calculatePrice } from '@/lib/routes'
import { createClient } from '@/lib/supabase'
import SearchScreen from '@/components/SearchScreen'
import ResultsScreen from '@/components/ResultsScreen'
import BookingScreen from '@/components/BookingScreen'
import TicketScreen from '@/components/TicketScreen'
import MyTripsScreen from '@/components/MyTripsScreen'
import HistoryScreen from '@/components/HistoryScreen'
import SettingsScreen from '@/components/SettingsScreen'
import BottomNav from '@/components/BottomNav'
import OfflineBanner from '@/components/OfflineBanner'

export default function Home() {
  const [tab,setTab]=useState('search')
  const [stage,setStage]=useState('search')
  const [origin,setOrigin]=useState('Suva')
  const [destination,setDestination]=useState('Savusavu')
  const [selectedDate,setSelectedDate]=useState(new Date(2026,2,4))
  const [passengers,setPassengers]=useState<Passenger>({adults:1,children:0,infants:0})
  const [selectedFerry,setSelectedFerry]=useState<Ferry|null>(null)
  const [selectedClass,setSelectedClass]=useState<'Economy'|'Cabin'>('Economy')
  const [currentBooking,setCurrentBooking]=useState<Booking|null>(null)
  const [trips,setTrips]=useState<Booking[]>([])
  const [user,setUser]=useState<any>(null)
  const [theme,setTheme]=useState<'dark'|'light'>('dark')
  const supabase=createClient()

  useEffect(()=>{
    supabase.auth.getUser().then(({data})=>{
      setUser(data.user)
      if(data.user) loadTrips(data.user.id)
    })
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user??null)
      if(session?.user) loadTrips(session.user.id)
      else setTrips([])
    })
    const savedTheme=localStorage.getItem('vonu-theme') as 'dark'|'light'
    if(savedTheme) setTheme(savedTheme)
    return ()=>subscription.unsubscribe()
  },[])

  async function loadTrips(userId:string){
    const {data}=await supabase.from('bookings').select('*').eq('user_id',userId).order('created_at',{ascending:false})
    if(data){
      setTrips(data.map((r:any):Booking=>({
        ferry:{id:0,operator:r.ferry_operator,ship:r.ferry_ship,icon:'🚢',departs:r.ferry_departs,arrives:r.ferry_arrives,duration:'',economy:r.price,cabin:r.price,tag:'',tagColor:'',seatsEconomy:0,seatsCabin:0,daysOfWeek:[]},
        selectedClass:r.selected_class,origin:r.origin,destination:r.destination,date:r.date,
        passengerName:r.passenger_name,passengerId:r.passenger_id,phone:r.phone,ref:r.ref,price:r.price,
        passengers:r.passengers||{adults:1,children:0,infants:0},
        status:r.status||'upcoming',
        departureDateTime:r.departure_datetime||''
      })))
    }
  }

  async function handleConfirmBooking(name:string,id:string,phone:string){
    if(!selectedFerry) return
    const price=calculatePrice(selectedFerry,selectedClass,passengers)
    const ref='VT-'+Math.floor(1000+Math.random()*9000)
    const dateStr=formatDate(selectedDate)
    const departureDateTime=`${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}T${selectedFerry.departs}:00`
    const booking:Booking={
      ferry:selectedFerry,selectedClass,origin,destination,
      date:dateStr,passengerName:name,passengerId:id,phone,ref,price,
      passengers,status:'upcoming',departureDateTime
    }
    setCurrentBooking(booking)
    setTrips(prev=>[booking,...prev])
    setStage('ticket')
    if(user){
      await supabase.from('bookings').insert({
        user_id:user.id,ref,origin,destination,date:dateStr,
        passenger_name:name,passenger_id:id,phone,
        ferry_operator:selectedFerry.operator,ferry_ship:selectedFerry.ship,
        ferry_departs:selectedFerry.departs,ferry_arrives:selectedFerry.arrives,
        selected_class:selectedClass,price,
        passengers,status:'upcoming',departure_datetime:departureDateTime
      })
    }
  }

  function handleSelectFerry(ferry:Ferry,cls:'Economy'|'Cabin'){
    setSelectedFerry(ferry);setSelectedClass(cls);setStage('booking')
  }

  function toggleTheme(){
    const next=theme==='dark'?'light':'dark'
    setTheme(next);localStorage.setItem('vonu-theme',next)
  }

  const upcomingTrips=trips.filter(t=>!t.departureDateTime||new Date(t.departureDateTime)>=new Date())
  const completedTrips=trips.filter(t=>t.departureDateTime&&new Date(t.departureDateTime)<new Date())

  return (
    <div style={{maxWidth:480,margin:'0 auto',minHeight:'100vh',position:'relative',background:theme==='dark'?'#071e30':'#f0f4f8'}}>
      <OfflineBanner theme={theme}/>
      {tab==='search'&&(
        <>
          {stage==='search'&&<SearchScreen origin={origin} setOrigin={setOrigin} destination={destination} setDestination={setDestination} selectedDate={selectedDate} setSelectedDate={setSelectedDate} passengers={passengers} setPassengers={setPassengers} onSearch={()=>setStage('results')} user={user} theme={theme}/>}
          {stage==='results'&&<ResultsScreen origin={origin} destination={destination} selectedDate={selectedDate} passengers={passengers} onSelect={handleSelectFerry} onBack={()=>setStage('search')} theme={theme}/>}
          {stage==='booking'&&selectedFerry&&<BookingScreen ferry={selectedFerry} selectedClass={selectedClass} origin={origin} destination={destination} date={formatDate(selectedDate)} passengers={passengers} onConfirm={handleConfirmBooking} onBack={()=>setStage('results')} theme={theme}/>}
          {stage==='ticket'&&currentBooking&&<TicketScreen booking={currentBooking} onDone={()=>{setStage('search');setTab('trips')}} theme={theme}/>}
        </>
      )}
      {tab==='trips'&&<MyTripsScreen trips={upcomingTrips} user={user} theme={theme}/>}
      {tab==='history'&&<HistoryScreen trips={completedTrips} theme={theme}/>}
      {tab==='settings'&&<SettingsScreen user={user} theme={theme} toggleTheme={toggleTheme} supabase={supabase}/>}
      <BottomNav active={tab} onChange={t=>{setTab(t);setStage('search')}} theme={theme}/>
    </div>
  )
}
