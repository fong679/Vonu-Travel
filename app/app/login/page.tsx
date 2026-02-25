'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [isSignUp,setIsSignUp]=useState(false)
  const [message,setMessage]=useState('')
  const [loading,setLoading]=useState(false)
  const router=useRouter()
  const supabase=createClient()

  async function handleSubmit(){
    setLoading(true);setMessage('')
    if(isSignUp){
      const {error}=await supabase.auth.signUp({email,password})
      if(error)setMessage(error.message)
      else setMessage('Check your email to confirm your account!')
    }else{
      const {error}=await supabase.auth.signInWithPassword({email,password})
      if(error)setMessage(error.message)
      else router.push('/')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#071e30',display:'flex',flexDirection:'column',fontFamily:'DM Sans,sans-serif'}}>
      <div style={{padding:'20px 24px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',gap:12}}>
        <a href="/" style={{width:36,height:36,borderRadius:'50%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',cursor:'pointer',textDecoration:'none',color:'white'}}>←</a>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.3rem',color:'white'}}>Vonu<span style={{color:'#ff5c3a'}}>-</span>Travel</div>
      </div>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
        <div style={{width:'100%',maxWidth:400}}>
          <p style={{fontSize:'0.7rem',fontWeight:500,letterSpacing:'0.12em',textTransform:'uppercase',color:'#ff5c3a',marginBottom:6}}>Welcome</p>
          <h1 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.7rem',lineHeight:1.15,color:'white',marginBottom:8}}>{isSignUp?'Create your\naccount':'Sign in to\nyour account'}</h1>
          <p style={{fontSize:'0.85rem',color:'#7eabc5',marginBottom:28}}>Book and manage your Fiji ferry trips</p>

          <div style={{marginBottom:12}}>
            <label style={{fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.1em',color:'#7eabc5',display:'block',marginBottom:6}}>Email Address</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email"
              style={{width:'100%',padding:'13px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,color:'white',fontSize:'0.95rem',outline:'none',boxSizing:'border-box',fontFamily:'DM Sans,sans-serif'}}/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.1em',color:'#7eabc5',display:'block',marginBottom:6}}>Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type="password"
              style={{width:'100%',padding:'13px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,color:'white',fontSize:'0.95rem',outline:'none',boxSizing:'border-box',fontFamily:'DM Sans,sans-serif'}}/>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{width:'100%',padding:15,background:'#ff5c3a',border:'none',borderRadius:14,color:'white',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1rem',cursor:'pointer',boxShadow:'0 6px 24px rgba(255,92,58,0.4)',marginBottom:12,opacity:loading?0.7:1}}>
            {loading?'Please wait...':(isSignUp?'Create Account':'Sign In')}
          </button>

          {message&&(
            <div style={{padding:'10px 14px',borderRadius:10,background:message.includes('Check')?'rgba(0,165,80,0.1)':'rgba(255,92,58,0.1)',border:`1px solid ${message.includes('Check')?'rgba(0,165,80,0.3)':'rgba(255,92,58,0.3)'}`,color:message.includes('Check')?'#4dd882':'#ff7a5c',fontSize:'0.85rem',marginBottom:12,textAlign:'center'}}>
              {message}
            </div>
          )}

          <p style={{color:'#7eabc5',fontSize:'0.85rem',textAlign:'center',cursor:'pointer'}} onClick={()=>{setIsSignUp(!isSignUp);setMessage('')}}>
            {isSignUp?'Already have an account? ':'Don\'t have an account? '}
            <span style={{color:'#ff5c3a',fontWeight:600}}>{isSignUp?'Sign in':'Sign up'}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
