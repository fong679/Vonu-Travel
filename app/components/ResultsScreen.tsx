'use client'
import { useState } from 'react'
import { Ferry, Passenger, getRoutesForDate, calculatePrice } from '@/lib/routes'
interface Props {origin:string;destination:string;selectedDate:Date;passengers:Passenger;onSelect:(f:Ferry,c:'Economy'|'Cabin')=>void;onBack:()=>void;theme:'dark'|'light'}
export default function ResultsScreen({origin,destination,selectedDate,passengers,onSelect,onBack,theme}:Props) {
  const ferries=getRoutesForDate(origin,destination,selectedDate)
  const [cls,setCls]=useState<Record<number,'Economy'|'Cabin'>>({})
  const getC=(id:number)=>cls[id]||'Economy'
  const dark=theme==='dark'
  const bg=dark?'#071e30':'#f0f4f8'
  const card=dark?'rgba(14,61,92,0.4)':'rgba(255,255,255,0.9)'
  const border=dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'
  const text=dark?'white':'#1a2e3b'
  const sub=dark?'#7eabc5':'#5a7a8a'
  const totalPax=passengers.adults+passengers.children+passengers.infants

  return (
    <div style={{minHeight:'100vh',background:bg,fontFamily:'DM Sans,sans-serif',paddingBottom:100}}>
      <div style={{padding:'20px 24px',display:'flex',alignItems:'center',gap:12,borderBottom:`1px solid ${border}`}}>
        <button onClick={onBack} style={{background:dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)',border:`1px solid ${border}`,borderRadius:'50%',width:36,height:36,color:text,fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.1rem',color:text}}>{origin} → {destination}</div>
          <div style={{fontSize:'0.78rem',color:sub}}>{selectedDate.toLocaleDateString('en-FJ',{weekday:'short',day:'numeric',month:'short'})} · {totalPax} passenger{totalPax>1?'s':''}</div>
        </div>
      </div>
      <div style={{padding:'20px 24px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:16}}>
          <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.05rem',color:text}}>Available Ferries</span>
          <span style={{fontSize:'0.78rem',color:sub}}>{ferries.length} found</span>
        </div>
        {ferries.length===0&&(
          <div style={{textAlign:'center',padding:'60px 0',color:sub}}>
            <div style={{fontSize:'2rem',marginBottom:12}}>🚢</div>
            <p style={{fontWeight:600}}>No ferries on this date</p>
            <p style={{fontSize:'0.85rem',marginTop:6}}>Try a different date — dots on the calendar show available days.</p>
          </div>
        )}
        {ferries.map(ferry=>{
          const c=getC(ferry.id)
          const price=calculatePrice(ferry,c,passengers)
          const seatsLeft=c==='Economy'?ferry.seatsEconomy:ferry.seatsCabin
          const seatsColor=seatsLeft<10?'#ff5c3a':seatsLeft<30?'#f5c842':'#4dd882'
          return (
            <div key={ferry.id} onClick={()=>onSelect(ferry,c)} style={{background:card,border:`1px solid ${border}`,borderRadius:18,padding:20,marginBottom:12,cursor:'pointer',boxShadow:dark?'none':'0 2px 12px rgba(0,0,0,0.06)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:42,height:42,borderRadius:12,background:dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem'}}>{ferry.icon}</div>
                  <div>
                    <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.95rem',color:text}}>{ferry.operator}</div>
                    <div style={{fontSize:'0.78rem',color:sub,marginTop:2}}>{ferry.ship}</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'0.68rem',color:sub,textTransform:'uppercase',letterSpacing:'0.08em'}}>Total</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.4rem',color:'#f5c842',lineHeight:1}}>${price} <span style={{fontSize:'0.75rem',color:sub,fontWeight:400}}>FJD</span></div>
                  {totalPax>1&&<div style={{fontSize:'0.7rem',color:sub}}>${c==='Economy'?ferry.economy:ferry.cabin}/person</div>}
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',marginBottom:14}}>
                <div><div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.2rem',color:text}}>{ferry.departs}</div><div style={{fontSize:'0.72rem',color:sub}}>{origin}</div></div>
                <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'0 12px',gap:4}}>
                  <div style={{fontSize:'0.68rem',color:sub}}>{ferry.duration}</div>
                  <div style={{width:'100%',height:2,background:dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)',borderRadius:2,position:'relative'}}>
                    <div style={{position:'absolute',top:'50%',left:0,transform:'translateY(-50%)',width:6,height:6,borderRadius:'50%',background:'#ff5c3a'}}/>
                    <div style={{position:'absolute',top:'50%',right:0,transform:'translateY(-50%)',width:6,height:6,borderRadius:'50%',background:'#ff5c3a'}}/>
                  </div>
                </div>
                <div style={{textAlign:'right'}}><div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.2rem',color:text}}>{ferry.arrives}</div><div style={{fontSize:'0.72rem',color:sub}}>{destination}</div></div>
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                {(['Economy','Cabin'] as const).map(cl=>ferry[cl.toLowerCase() as 'economy'|'cabin']>0&&(
                  <button key={cl} onClick={e=>{e.stopPropagation();setCls(p=>({...p,[ferry.id]:cl}))}} style={{padding:'5px 12px',borderRadius:20,fontSize:'0.75rem',fontWeight:500,border:`1px solid ${c===cl?'#ff5c3a':border}`,color:c===cl?'#ff5c3a':sub,background:c===cl?'rgba(255,92,58,0.08)':dark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)',cursor:'pointer'}}>
                    {cl} <strong style={{color:c===cl?'#ff5c3a':text}}>${ferry[cl.toLowerCase() as 'economy'|'cabin']}</strong>
                  </button>
                ))}
                <span style={{fontSize:'0.72rem',color:seatsColor,marginLeft:'auto'}}>● {seatsLeft} seats left</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
