'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit() {
    setLoading(true)
    setMessage('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#071e30',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{background:'rgba(14,61,92,0.5)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:18,padding:'32px 28px',width:'100%',maxWidth:400}}>
        <h1 style={{color:'white',fontWeight:800,fontSize:'1.5rem',marginBottom:4}}>Vonu-Travel</h1>
        <p style={{color:'#7eabc5',marginBottom:24,fontSize:'0.9rem'}}>{isSignUp ? 'Create your account' : 'Sign in to your account'}</p>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email"
          style={{width:'100%',padding:'12px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'white',marginBottom:10,fontSize:'0.9rem',boxSizing:'border-box'}} />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password"
          style={{width:'100%',padding:'12px 14px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'white',marginBottom:16,fontSize:'0.9rem',boxSizing:'border-box'}} />
        <button onClick={handleSubmit} disabled={loading}
          style={{width:'100%',padding:'13px',background:'#ff5c3a',border:'none',borderRadius:12,color:'white',fontWeight:700,fontSize:'1rem',cursor:'pointer',marginBottom:12}}>
          {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>
        {message && <p style={{color:'#4dd882',fontSize:'0.85rem',textAlign:'center',marginBottom:10}}>{message}</p>}
        <p style={{color:'#7eabc5',fontSize:'0.85rem',textAlign:'center',cursor:'pointer'}} onClick={()=>setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </p>
      </div>
    </div>
  )
}