'use client'
import { useState } from 'react'
import { Ferry, getRoutes } from '@/lib/routes'
interface Props {origin:string;destination:string;date:string;onSelect:(f:Ferry,c:'Economy'|'Cabin')=>void;onBack:()=>void}
export default function ResultsScreen({origin,destination,date,onSelect,onBack}:Props) {
  const ferries=getRoutes(origin,destination)
  const [cls,setCls]=useState<Record<number,'Economy'|'Cabin'>>({})
  const getC=(id:number)=>cls[id]||'Economy'
  return (
    <div style={{minHeight:'100vh',background:'#071e30',fontFamily:'DM Sans,sans-serif',paddingBottom:100}}>
      <div style={{padding:'20px 24px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <button onClick={onBack} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'50%',width:36,height:36,color:'white',fontSize:'1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.1rem',color:'white'}}>{origin} → {destination}</div>
          <div style={{fontSize:'0.78rem',color:'#7eabc5'}}>{date} · 1 Adult</div>
        </div>
      </div>
      <div style={{padding:'20px 24px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:16}}>
          <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.05rem',color:'white'}}>Available Ferries</span>
          <span style={{fontSize:'0.78rem',color:'#7eabc5'}}>{ferries.length} route{ferries.length!==1?'s':''} found</span>
        </div>
        {ferries.length===0&&<div style={{textAlign:'center',padding:'60px 0',color:'#7eabc5'}}><div style={{fontSize:'2rem',marginBottom:12}}>🚢</div><p>No ferries found for this route.</p></div>}
        {ferries.map(ferry=>{
          const c=getC(ferry.id);const price=c==='Economy'?ferry.economy:ferry.cabin
          return (
            <div key={ferry.id} onClick={()=>onSelect(ferry,c)} style={{background:'rgba(14,61,92,0.4)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:18,padding:20,marginBottom:12,cursor:'pointer'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:42,height:42,borderRadius:12,background:'rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem'}}>{ferry.icon}</div>
                  <div>
                    <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.95rem',color:'white'}}>{ferry.operator}</div>
                    <div style={{fontSize:'0.78rem',color:'#7eabc5',marginTop:2}}>{ferry.ship}</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'0.68rem',color:'#7eabc5',textTransform:'uppercase',letterSpacing:'0.08em'}}>From</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.4rem',color:'#f5c842',lineHeight:1}}>${price} <span style={{fontSize:'0.75rem',color:'#7eabc5',fontWeight:400}}>FJD</span></div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',marginBottom:14}}>
                <div><div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.2rem',color:'white'}}>{ferry.departs}</div><div style={{fontSize:'0.72rem',color:'#7eabc5'}}>{origin}</div></div>
                <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'0 12px',gap:4}}>
                  <div style={{fontSize:'0.68rem',color:'#7eabc5'}}>{ferry.duration}</div>
                  <div style={{width:'100%',height:2,background:'rgba(255,255,255,0.1)',borderRadius:2,position:'relative'}}>
                    <div style={{position:'absolute',top:'50%',left:0,transform:'translateY(-50%)',width:6,height:6,borderRadius:'50%',background:'#ff5c3a'}}/>
                    <div style={{position:'absolute',top:'50%',right:0,transform:'translateY(-50%)',width:6,height:6,borderRadius:'50%',background:'#ff5c3a'}}/>
                  </div>
                </div>
                <div style={{textAlign:'right'}}><div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.2rem',color:'white'}}>{ferry.arrives}</div><div style={{fontSize:'0.72rem',color:'#7eabc5'}}>{destination}</div></div>
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {(['Economy','Cabin'] as const).map(cl=>ferry[cl.toLowerCase() as 'economy'|'cabin']>0&&(
                  <button key={cl} onClick={e=>{e.stopPropagation();setCls(p=>({...p,[ferry.id]:cl}))}} style={{padding:'5px 12px',borderRadius:20,fontSize:'0.75rem',fontWeight:500,border:`1px solid ${c===cl?'#ff5c3a':'rgba(255,255,255,0.12)'}`,color:c===cl?'#ff5c3a':'#7eabc5',background:c===cl?'rgba(255,92,58,0.08)':'rgba(255,255,255,0.04)',cursor:'pointer'}}>
                    {cl} <strong style={{color:c===cl?'#ff5c3a':'white'}}>${ferry[cl.toLowerCase() as 'economy'|'cabin']}</strong>
                  </button>
                ))}
                <span style={{padding:'5px 12px',borderRadius:20,fontSize:'0.7rem',fontWeight:600,border:`1px solid ${ferry.tagColor==='green'?'rgba(0,165,80,0.3)':ferry.tagColor==='blue'?'rgba(0,120,255,0.3)':'rgba(245,200,66,0.3)'}`,color:ferry.tagColor==='green'?'#4dd882':ferry.tagColor==='blue'?'#60a5fa':'#f5c842',background:'transparent'}}>{ferry.tag}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
