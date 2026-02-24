'use client'
import { useState } from 'react'
import { Ferry, Booking } from '@/lib/routes'
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

  function handleSelectFerry(ferry:Ferry,cls:'Economy'|'Cabin'){
    setSelectedFerry(ferry);setSelectedClass(cls);setStage('booking')
  }
  function handleConfirmBooking(name:string,id:string,phone:string){
    if(!selectedFerry)return
    const price=selectedClass==='Economy'?selectedFerry.economy:selectedFerry.cabin
    const booking:Booking={ferry:selectedFerry,selectedClass,origin,destination,date,passengerName:name,passengerId:id,phone,ref:'VT-'+Math.floor(1000+Math.random()*9000),price}
    setCurrentBooking(booking);setTrips(prev=>[booking,...prev]);setStage('ticket')
  }

  return (
    <div style={{maxWidth:480,margin:'0 auto',minHeight:'100vh',position:'relative'}}>
      {tab==='search'&&(
        <>
          {stage==='search'&&<SearchScreen origin={origin} setOrigin={setOrigin} destination={destination} setDestination={setDestination} date={date} onSearch={()=>setStage('results')}/>}
          {stage==='results'&&<ResultsScreen origin={origin} destination={destination} date={date} onSelect={handleSelectFerry} onBack={()=>setStage('search')}/>}
          {stage==='booking'&&selectedFerry&&<BookingScreen ferry={selectedFerry} selectedClass={selectedClass} origin={origin} destination={destination} date={date} onConfirm={handleConfirmBooking} onBack={()=>setStage('results')}/>}
          {stage==='ticket'&&currentBooking&&<TicketScreen booking={currentBooking} onDone={()=>{setStage('search');setTab('trips')}}/>}
        </>
      )}
      {tab==='trips'&&<MyTripsScreen trips={trips}/>}
      {tab==='history'&&<div style={{padding:'80px 24px',color:'#7eabc5',textAlign:'center',fontFamily:'DM Sans,sans-serif',marginTop:80}}>No history yet.</div>}
      {tab==='settings'&&<div style={{padding:'80px 24px',color:'#7eabc5',textAlign:'center',fontFamily:'DM Sans,sans-serif',marginTop:80}}>Settings coming soon.</div>}
      <BottomNav active={tab} onChange={t=>{setTab(t);setStage('search')}}/>
    </div>
  )
}
