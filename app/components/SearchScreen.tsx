'use client'
import { PORTS } from '@/lib/routes'
interface Props {origin:string;setOrigin:(v:string)=>void;destination:string;setDestination:(v:string)=>void;date:string;onSearch:()=>void}
export default function SearchScreen({origin,setOrigin,destination,setDestination,date,onSearch}:Props) {
  function swap(){const t=origin;setOrigin(destination);setDestination(t)}
  const sel={flex:1,padding:'12px 14px',background:'transparent',border:'none',outline:'none',color:'white',fontFamily:'Syne,sans-serif',fontWeight:600,fontSize:'1rem',cursor:'pointer',appearance:'none' as const}
  return (
    <div style={{minHeight:'100vh',background:'#071e30',fontFamily:'DM Sans,sans-serif',paddingBottom:100}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px 16px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.3rem',color:'white'}}>Vonu<span style={{color:'#ff5c3a'}}>-</span>Travel</div>
        <div style={{display:'flex',gap:10}}>
          {['🔔'].map((icon,i)=><div key={i} style={{width:36,height:36,borderRadius:'50%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',cursor:'pointer'}}>{icon}</div>)}
<a href="/login" style={{width:36,height:36,borderRadius:'50%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',cursor:'pointer',textDecoration:'none'}}>👤</a>
        </div>
      </nav>
      <div style={{padding:'28px 24px 20px'}}>
        <p style={{fontSize:'0.7rem',fontWeight:500,letterSpacing:'0.12em',textTransform:'uppercase',color:'#ff5c3a',marginBottom:6}}>Plan your journey</p>
        <h1 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.7rem',lineHeight:1.15,color:'white',marginBottom:24}}>Where are you<br/>headed?</h1>
        <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:18,padding:6,marginBottom:12}}>
          <select value={origin} onChange={e=>setOrigin(e.target.value)} style={sel}>{PORTS.map(p=><option key={p} value={p} style={{background:'#0b2e4a'}}>{p}</option>)}</select>
          <div style={{height:1,background:'rgba(255,255,255,0.07)',margin:'4px 14px'}}/>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <select value={destination} onChange={e=>setDestination(e.target.value)} style={sel}>{PORTS.map(p=><option key={p} value={p} style={{background:'#0b2e4a'}}>{p}</option>)}</select>
            <button onClick={swap} style={{width:38,height:38,borderRadius:'50%',background:'#ff5c3a',border:'none',color:'white',fontSize:'1rem',cursor:'pointer',marginRight:6,boxShadow:'0 4px 16px rgba(255,92,58,0.4)'}}>⇅</button>
          </div>
        </div>
        <div style={{display:'flex',gap:6,marginBottom:12}}>
          <div style={{flex:1,padding:'12px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12}}>
            <span style={{fontSize:'0.75rem',color:'#7eabc5',display:'block'}}>📅 Departure</span>
            <strong style={{fontSize:'0.95rem',color:'white',display:'block'}}>{date}</strong>
          </div>
          <div style={{padding:'12px 16px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12}}>
            <span style={{fontSize:'0.75rem',color:'#7eabc5',display:'block'}}>Passengers</span>
            <strong style={{fontSize:'0.95rem',color:'white',display:'block'}}>1 Adult</strong>
          </div>
        </div>
        <button onClick={onSearch} style={{width:'100%',padding:15,background:'#ff5c3a',border:'none',borderRadius:14,color:'white',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1rem',cursor:'pointer',boxShadow:'0 6px 24px rgba(255,92,58,0.4)'}}>Search Ferries →</button>
      </div>
      <div style={{padding:'0 24px'}}>
        <p style={{fontSize:'0.7rem',fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:'#7eabc5',marginBottom:12}}>Popular Routes</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
          {[['Suva','Savusavu'],['Suva','Lautoka'],['Suva','Taveuni'],['Suva','Kadavu'],['Lautoka','Yasawa']].map(([o,d])=>(
            <button key={o+d} onClick={()=>{setOrigin(o);setDestination(d)}} style={{padding:'7px 14px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,color:'#b8d4e0',fontSize:'0.8rem',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>{o} → {d}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
