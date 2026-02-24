'use client'
import { useState } from 'react'
import { Ferry } from '@/lib/routes'
interface Props {ferry:Ferry;selectedClass:'Economy'|'Cabin';origin:string;destination:string;date:string;onConfirm:(n:string,id:string,p:string)=>void;onBack:()=>void}
export default function BookingScreen({ferry,selectedClass,origin,destination,date,onConfirm,onBack}:Props) {
  const [name,setName]=useState('');const [id,setId]=useState('');const [phone,setPhone]=useState('')
  const [showPay,setShowPay]=useState(false);const [pin,setPin]=useState(0)
  const price=selectedClass==='Economy'?ferry.economy:ferry.cabin
  function handlePay(){if(!name||!id||!phone)return alert('Please fill in all fields');setShowPay(true)}
  function handleApprove(){let c=0;const iv=setInterval(()=>{c++;setPin(c);if(c>=4){clearInterval(iv);setTimeout(()=>{setShowPay(false);onConfirm(name,id,phone)},400)}},200)}
  const inp={width:'100%',padding:'12px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'white',fontSize:'0.9rem',outline:'none',boxSizing:'border-box' as const,fontFamily:'DM Sans,sans-serif'}
  return (
    <div style={{minHeight:'100vh',background:'#071e30',fontFamily:'DM Sans,sans-serif',paddingBottom:100}}>
      <div style={{padding:'20px 24px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <button onClick={onBack} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'50%',width:36,height:36,color:'white',fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.1rem',color:'white'}}>Confirm Booking</div>
          <div style={{fontSize:'0.78rem',color:'#7eabc5'}}>{origin} → {destination} · {selectedClass}</div>
        </div>
      </div>
      <div style={{padding:'20px 24px'}}>
        <div style={{background:'rgba(14,61,92,0.4)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:16,marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'white'}}>{ferry.operator}</div>
            <div style={{fontSize:'0.8rem',color:'#7eabc5'}}>{ferry.ship} · {ferry.departs} → {ferry.arrives}</div>
          </div>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.3rem',color:'#f5c842'}}>${price}<span style={{fontSize:'0.7rem',color:'#7eabc5',fontWeight:400}}> FJD</span></div>
        </div>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.95rem',color:'white',marginBottom:16}}>Passenger Details</div>
        {[{label:'Full Name (as on ID)',v:name,s:setName,ph:'Siosaia Tuilagi',t:'text'},{label:'ID / Passport Number',v:id,s:setId,ph:'FJ-123456789',t:'text'},{label:'Mobile Number',v:phone,s:setPhone,ph:'+679 7XX XXXX',t:'tel'}].map(f=>(
          <div key={f.label} style={{marginBottom:12}}>
            <label style={{fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.1em',color:'#7eabc5',display:'block',marginBottom:6}}>{f.label}</label>
            <input value={f.v} onChange={e=>f.s(e.target.value)} placeholder={f.ph} type={f.t} style={inp}/>
          </div>
        ))}
        <button onClick={handlePay} style={{width:'100%',marginTop:8,padding:15,background:'linear-gradient(135deg,#00a550,#00c96a)',border:'none',borderRadius:12,color:'white',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.95rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,boxShadow:'0 6px 20px rgba(0,165,80,0.35)'}}>
          <span style={{background:'white',borderRadius:4,padding:'2px 6px',fontSize:'0.7rem',fontWeight:800,color:'#00a550'}}>M-PAiSA</span>
          Pay & Confirm Booking
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
            <div style={{fontSize:'0.82rem',color:'#7eabc5',marginBottom:14}}>{origin} → {destination} · {selectedClass}<br/>{ferry.ship} · {date}</div>
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
