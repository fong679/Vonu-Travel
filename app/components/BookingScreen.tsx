'use client'
import { useState } from 'react'
import { Ferry, Passenger, calculatePrice } from '@/lib/routes'
interface Props {ferry:Ferry;selectedClass:'Economy'|'Cabin';origin:string;destination:string;date:string;passengers:Passenger;onConfirm:(n:string,id:string,p:string)=>void;onBack:()=>void;theme:'dark'|'light'}
export default function BookingScreen({ferry,selectedClass,origin,destination,date,passengers,onConfirm,onBack,theme}:Props) {
  const [name,setName]=useState('');const [id,setId]=useState('');const [phone,setPhone]=useState('')
  const [showPay,setShowPay]=useState(false);const [pin,setPin]=useState(0)
  const dark=theme==='dark'
  const bg=dark?'#071e30':'#f0f4f8'
  const card=dark?'rgba(14,61,92,0.4)':'rgba(255,255,255,0.9)'
  const border=dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'
  const text=dark?'white':'#1a2e3b'
  const sub=dark?'#7eabc5':'#5a7a8a'
  const price=calculatePrice(ferry,selectedClass,passengers)
  const totalPax=passengers.adults+passengers.children+passengers.infants
  function handlePay(){if(!name||!id||!phone)return alert('Please fill in all fields');setShowPay(true)}
  function handleApprove(){let c=0;const iv=setInterval(()=>{c++;setPin(c);if(c>=4){clearInterval(iv);setTimeout(()=>{setShowPay(false);onConfirm(name,id,phone)},400)}},200)}
  const inp={width:'100%',padding:'12px 14px',background:dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',border:`1px solid ${border}`,borderRadius:10,color:text,fontSize:'0.9rem',outline:'none',boxSizing:'border-box' as const,fontFamily:'DM Sans,sans-serif'}
  return (
    <div style={{minHeight:'100vh',background:bg,fontFamily:'DM Sans,sans-serif',paddingBottom:100}}>
      <div style={{padding:'20px 24px',display:'flex',alignItems:'center',gap:12,borderBottom:`1px solid ${border}`}}>
        <button onClick={onBack} style={{background:dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)',border:`1px solid ${border}`,borderRadius:'50%',width:36,height:36,color:text,fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.1rem',color:text}}>Confirm Booking</div>
          <div style={{fontSize:'0.78rem',color:sub}}>{origin} → {destination} · {selectedClass}</div>
        </div>
      </div>
      <div style={{padding:'20px 24px'}}>
        <div style={{background:card,border:`1px solid ${border}`,borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
            <div>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:text}}>{ferry.operator}</div>
              <div style={{fontSize:'0.8rem',color:sub}}>{ferry.ship}</div>
              <div style={{fontSize:'0.8rem',color:sub,marginTop:2}}>{ferry.departs} → {ferry.arrives} · {date}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.3rem',color:'#f5c842'}}>${price}<span style={{fontSize:'0.7rem',color:sub,fontWeight:400}}> FJD</span></div>
              <div style={{fontSize:'0.72rem',color:sub}}>{totalPax} passenger{totalPax>1?'s':''}</div>
            </div>
          </div>
          <div style={{borderTop:`1px solid ${border}`,paddingTop:10,display:'flex',gap:16,flexWrap:'wrap'}}>
            {passengers.adults>0&&<div style={{fontSize:'0.78rem',color:sub}}>👤 {passengers.adults} Adult{passengers.adults>1?'s':''} × ${selectedClass==='Economy'?ferry.economy:ferry.cabin}</div>}
            {passengers.children>0&&<div style={{fontSize:'0.78rem',color:sub}}>👦 {passengers.children} Child{passengers.children>1?'ren':''} × ${Math.round((selectedClass==='Economy'?ferry.economy:ferry.cabin)*0.5)}</div>}
            {passengers.infants>0&&<div style={{fontSize:'0.78rem',color:'#4dd882'}}>👶 {passengers.infants} Infant{passengers.infants>1?'s':''} × FREE</div>}
          </div>
        </div>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.95rem',color:text,marginBottom:16}}>Lead Passenger Details</div>
        {[{label:'Full Name (as on ID)',v:name,s:setName,ph:'Siosaia Tuilagi',t:'text'},{label:'ID / Passport Number',v:id,s:setId,ph:'FJ-123456789',t:'text'},{label:'Mobile Number',v:phone,s:setPhone,ph:'+679 7XX XXXX',t:'tel'}].map(f=>(
          <div key={f.label} style={{marginBottom:12}}>
            <label style={{fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.1em',color:sub,display:'block',marginBottom:6}}>{f.label}</label>
            <input value={f.v} onChange={e=>f.s(e.target.value)} placeholder={f.ph} type={f.t} style={inp}/>
          </div>
        ))}
        <button onClick={handlePay} style={{width:'100%',marginTop:8,padding:15,background:'linear-gradient(135deg,#00a550,#00c96a)',border:'none',borderRadius:12,color:'white',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.95rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,boxShadow:'0 6px 20px rgba(0,165,80,0.35)'}}>
          <span style={{background:'white',borderRadius:4,padding:'2px 6px',fontSize:'0.7rem',fontWeight:800,color:'#00a550'}}>M-PAiSA</span>
          Pay FJD {price} & Confirm
        </button>
      </div>
      {showPay&&(
        <div style={{position:'fixed',inset:0,background:'rgba(7,30,48,0.95)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'20px'}}>
          <div style={{background:'rgba(14,61,92,0.95)',border:'1px solid rgba(0,165,80,0.4)',borderRadius:16,padding:'16px 20px',width:'100%',maxWidth:440}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <div style={{width:40,height:40,borderRadius:10,background:'#00a550',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem'}}>💳</div>
              <div>
                <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.9rem',color:'white'}}>M-PAiSA Payment Request</div>
                <div style={{fontSize:'0.75rem',color:'#7eabc5'}}>Vonu-Travel · Secure Payment</div>
              </div>
            </div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.4rem',color:'white',marginBottom:4}}>FJD {price}.00</div>
            <div style={{fontSize:'0.82rem',color:'#7eabc5',marginBottom:14}}>{origin} → {destination} · {selectedClass}<br/>{ferry.ship} · {date} · {totalPax} passenger{totalPax>1?'s':''}</div>
            <div style={{display:'flex',gap:10,justifyContent:'center',marginBottom:14}}>
              {[1,2,3,4].map(n=><div key={n} style={{width:16,height:16,borderRadius:'50%',background:pin>=n?'#00a550':'transparent',border:`2px solid ${pin>=n?'#00a550':'rgba(255,255,255,0.3)'}`,transition:'all 0.15s'}}/>)}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{setShowPay(false);setPin(0)}} style={{flex:1,padding:12,borderRadius:10,border:'none',background:'rgba(255,255,255,0.08)',color:'#7eabc5',fontFamily:'Syne,sans-serif',fontWeight:700,cursor:'pointer'}}>Decline</button>
              <button onClick={handleApprove} style={{flex:1,padding:12,borderRadius:10,border:'none',background:'#00a550',color:'white',fontFamily:'Syne,sans-serif',fontWeight:700,cursor:'pointer'}}>Enter PIN & Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
