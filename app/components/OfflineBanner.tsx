'use client'
import { useState, useEffect } from 'react'
export default function OfflineBanner({theme}:{theme:'dark'|'light'}) {
  const [online,setOnline]=useState(true)
  const [showOnline,setShowOnline]=useState(false)
  useEffect(()=>{
    function handleOnline(){setOnline(true);setShowOnline(true);setTimeout(()=>setShowOnline(false),3000)}
    function handleOffline(){setOnline(false);setShowOnline(false)}
    window.addEventListener('online',handleOnline)
    window.addEventListener('offline',handleOffline)
    setOnline(navigator.onLine)
    return()=>{window.removeEventListener('online',handleOnline);window.removeEventListener('offline',handleOffline)}
  },[])
  if(online&&!showOnline) return null
  return (
    <div style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:480,zIndex:1000,padding:'10px 16px',background:online?'rgba(0,165,80,0.95)':'rgba(220,53,69,0.95)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontSize:'0.85rem',fontFamily:'DM Sans,sans-serif',fontWeight:500,color:'white',boxShadow:'0 2px 12px rgba(0,0,0,0.3)'}}>
      <span>{online?'✅':'📵'}</span>
      <span>{online?'Back online':'Working offline — no internet connection'}</span>
    </div>
  )
}
