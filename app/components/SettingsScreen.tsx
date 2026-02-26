'use client'
import { useState } from 'react'
export default function SettingsScreen({user,theme,toggleTheme,supabase}:{user:any;theme:'dark'|'light';toggleTheme:()=>void;supabase:any}) {
  const dark=theme==='dark'
  const bg=dark?'#071e30':'#f0f4f8'
  const card=dark?'rgba(14,61,92,0.4)':'rgba(255,255,255,0.9)'
  const border=dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'
  const text=dark?'white':'#1a2e3b'
  const sub=dark?'#7eabc5':'#5a7a8a'
  const [resetEmail,setResetEmail]=useState('')
  const [resetMsg,setResetMsg]=useState('')
  const [showReset,setShowReset]=useState(false)
  const [name,setName]=useState(user?.user_metadata?.full_name||'')
  const [savedName,setSavedName]=useState(false)
  async function handleSignOut(){await supabase.auth.signOut();window.location.href='/'}
  async function handlePasswordReset(){
    if(!resetEmail)return
    const {error}=await supabase.auth.resetPasswordForEmail(resetEmail,{redirectTo:`${window.location.origin}/login`})
    setResetMsg(error?error.message:'Password reset email sent! Check your inbox.')
  }
  async function handleSaveName(){
    await supabase.auth.updateUser({data:{full_name:name}})
    setSavedName(true);setTimeout(()=>setSavedName(false),2000)
  }
  const inpStyle={flex:1,padding:'10px 12px',background:dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',border:`1px solid ${border}`,borderRadius:8,color:text,fontSize:'0.9rem',outline:'none',fontFamily:'DM Sans,sans-serif'}
  const Row=({icon,label,right,onClick,danger}:{icon:string;label:string;right?:any;onClick?:()=>void;danger?:boolean})=>(
    <div onClick={onClick} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderBottom:`1px solid ${border}`,cursor:onClick?'pointer':'default'}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <span style={{fontSize:'1.1rem'}}>{icon}</span>
        <span style={{fontSize:'0.9rem',color:danger?'#ff5c3a':text}}>{label}</span>
      </div>
      {right&&<div style={{color:sub,fontSize:'0.85rem'}}>{right}</div>}
    </div>
  )
  return (
    <div style={{minHeight:'100vh',background:bg,fontFamily:'DM Sans,sans-serif',paddingBottom:100}}>
      <div style={{padding:'20px 24px',borderBottom:`1px solid ${border}`}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.3rem',color:text}}>Settings</div>
      </div>
      <div style={{padding:'20px 24px'}}>
        {user&&(
          <div style={{marginBottom:20}}>
            <div style={{fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.12em',color:sub,marginBottom:10,paddingLeft:4}}>Profile</div>
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,overflow:'hidden'}}>
              <div style={{padding:'14px 16px',borderBottom:`1px solid ${border}`}}>
                <div style={{fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.1em',color:sub,marginBottom:6}}>Display Name</div>
                <div style={{display:'flex',gap:8}}>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={inpStyle}/>
                  <button onClick={handleSaveName} style={{padding:'10px 16px',background:savedName?'#00a550':'#ff5c3a',border:'none',borderRadius:8,color:'white',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.8rem',cursor:'pointer'}}>{savedName?'Saved!':'Save'}</button>
                </div>
              </div>
              <Row icon="✉️" label={user.email} right=""/>
              <Row icon="🔑" label="Change Password" right="→" onClick={()=>setShowReset(!showReset)}/>
              {showReset&&(
                <div style={{padding:'14px 16px',borderBottom:`1px solid ${border}`}}>
                  <div style={{fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.1em',color:sub,marginBottom:6}}>Send reset link to email</div>
                  <div style={{display:'flex',gap:8}}>
                    <input value={resetEmail} onChange={e=>setResetEmail(e.target.value)} placeholder={user.email} type="email" style={inpStyle}/>
                    <button onClick={handlePasswordReset} style={{padding:'10px 16px',background:'#ff5c3a',border:'none',borderRadius:8,color:'white',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.8rem',cursor:'pointer'}}>Send</button>
                  </div>
                  {resetMsg&&<div style={{marginTop:8,fontSize:'0.8rem',color:resetMsg.includes('sent')?'#4dd882':'#ff7a5c'}}>{resetMsg}</div>}
                </div>
              )}
            </div>
          </div>
        )}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.12em',color:sub,marginBottom:10,paddingLeft:4}}>Appearance</div>
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,overflow:'hidden'}}>
            <div onClick={toggleTheme} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:'1.1rem'}}>{dark?'🌙':'☀️'}</span>
                <span style={{fontSize:'0.9rem',color:text}}>Theme</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:'0.85rem',color:sub}}>{dark?'Dark':'Light'}</span>
                <div style={{width:44,height:24,borderRadius:12,background:dark?'#ff5c3a':'rgba(0,0,0,0.15)',position:'relative',transition:'background 0.3s'}}>
                  <div style={{position:'absolute',top:2,left:dark?22:2,width:20,height:20,borderRadius:'50%',background:'white',transition:'left 0.3s',boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.12em',color:sub,marginBottom:10,paddingLeft:4}}>About</div>
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,overflow:'hidden'}}>
            <Row icon="🚢" label="Vonu-Travel" right="v1.0.0"/>
            <Row icon="🇫🇯" label="Ferry routes across Fiji" right=""/>
            <Row icon="📱" label="Installed as PWA" right="✓"/>
          </div>
        </div>
        {user?(
          <div style={{marginBottom:20}}>
            <div style={{fontSize:'0.68rem',textTransform:'uppercase',letterSpacing:'0.12em',color:sub,marginBottom:10,paddingLeft:4}}>Account</div>
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,overflow:'hidden'}}>
              <Row icon="🚪" label="Sign Out" danger onClick={handleSignOut}/>
            </div>
          </div>
        ):(
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <a href="/login" style={{display:'inline-block',padding:'13px 32px',background:'#ff5c3a',borderRadius:14,color:'white',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.95rem',textDecoration:'none'}}>Sign In</a>
          </div>
        )}
      </div>
    </div>
  )
}
