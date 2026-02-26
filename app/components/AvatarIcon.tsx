'use client'
import { useState } from 'react'

export default function AvatarIcon({user,theme}:{user:any;theme:'dark'|'light'}) {
  const [showProfile,setShowProfile]=useState(false)
  const dark=theme==='dark'

  function getInitials(){
    if(!user) return '👤'
    const name=user.user_metadata?.full_name||user.email||''
    if(user.user_metadata?.full_name){
      const parts=name.trim().split(' ')
      return parts.length>=2?`${parts[0][0]}${parts[1][0]}`.toUpperCase():parts[0].slice(0,2).toUpperCase()
    }
    return name.split('@')[0].slice(0,2).toUpperCase()
  }

  if(!user) return (
    <a href="/login" style={{width:36,height:36,borderRadius:'50%',background:dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)',border:`1px solid ${dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',cursor:'pointer',textDecoration:'none'}}>👤</a>
  )

  return (
    <div style={{position:'relative'}}>
      <div onClick={()=>setShowProfile(!showProfile)}
        style={{width:36,height:36,borderRadius:'50%',background:'#ff5c3a',border:'2px solid rgba(255,92,58,0.4)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.75rem',color:'white',boxShadow:'0 2px 8px rgba(255,92,58,0.4)'}}>
        {getInitials()}
      </div>
      {showProfile&&(
        <>
          <div onClick={()=>setShowProfile(false)} style={{position:'fixed',inset:0,zIndex:40}}/>
          <div style={{position:'absolute',top:44,right:0,background:dark?'#0e3d5c':'white',border:`1px solid ${dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'}`,borderRadius:14,padding:16,minWidth:220,zIndex:50,boxShadow:'0 8px 32px rgba(0,0,0,0.3)'}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}`}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'#ff5c3a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.9rem',color:'white',flexShrink:0}}>
                {getInitials()}
              </div>
              <div>
                <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.95rem',color:dark?'white':'#1a2e3b'}}>{user.user_metadata?.full_name||user.email.split('@')[0]}</div>
                <div style={{fontSize:'0.75rem',color:dark?'#7eabc5':'#5a7a8a',marginTop:2}}>{user.email}</div>
              </div>
            </div>
            <a href="/login" onClick={()=>setShowProfile(false)} style={{display:'block',fontSize:'0.85rem',color:dark?'#7eabc5':'#5a7a8a',textDecoration:'none',padding:'6px 0'}}>⚙️ Settings</a>
          </div>
        </>
      )}
    </div>
  )
}
