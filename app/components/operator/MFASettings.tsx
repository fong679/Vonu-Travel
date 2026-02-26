'use client'
import { useState, useEffect } from 'react'

export default function MFASettings({supabase}:{supabase:any}) {
  const [factors,setFactors]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [unenrolling,setUnenrolling]=useState(false)
  const [msg,setMsg]=useState('')

  useEffect(()=>{loadFactors()},[])

  async function loadFactors(){
    setLoading(true)
    const {data}=await supabase.auth.mfa.listFactors()
    setFactors(data?.totp||[])
    setLoading(false)
  }

  async function unenroll(id:string){
    if(!confirm('Remove this authenticator? You will need to re-enroll on next login.')) return
    setUnenrolling(true)
    const {error}=await supabase.auth.mfa.unenroll({factorId:id})
    if(error) setMsg(error.message)
    else { setMsg('Authenticator removed successfully.'); await loadFactors() }
    setUnenrolling(false)
  }

  const verified=factors.filter(f=>f.status==='verified')
  const border='rgba(255,255,255,0.08)'
  const card='rgba(14,61,92,0.4)'
  const text='white'
  const sub='#7eabc5'

  return (
    <div style={{marginTop:20}}>
      <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.9rem',color:text,marginBottom:12}}>🔐 Two-Factor Authentication</div>

      {loading?(
        <div style={{padding:'20px',textAlign:'center',color:sub}}>Loading MFA status...</div>
      ):(
        <>
          {/* Status card */}
          <div style={{background:card,border:`1px solid ${verified.length>0?'rgba(0,165,80,0.3)':'rgba(245,200,66,0.3)'}`,borderRadius:14,padding:16,marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:verified.length>0?14:0}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:verified.length>0?'rgba(0,165,80,0.15)':'rgba(245,200,66,0.1)',border:`2px solid ${verified.length>0?'#00a550':'#f5c842'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',flexShrink:0}}>
                {verified.length>0?'✓':'⚠️'}
              </div>
              <div>
                <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.9rem',color:verified.length>0?'#4dd882':'#f5c842'}}>
                  {verified.length>0?'MFA is Active':'MFA Not Configured'}
                </div>
                <div style={{fontSize:'0.75rem',color:sub,marginTop:2}}>
                  {verified.length>0?`${verified.length} authenticator app${verified.length>1?'s':''} enrolled`:'Your account is less secure without MFA'}
                </div>
              </div>
            </div>

            {/* Enrolled factors */}
            {verified.map(f=>(
              <div key={f.id} style={{borderTop:`1px solid ${border}`,paddingTop:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:'1.2rem'}}>📱</span>
                  <div>
                    <div style={{fontSize:'0.85rem',color:text,fontWeight:500}}>{f.friendly_name||'Authenticator App'}</div>
                    <div style={{fontSize:'0.72rem',color:sub}}>Enrolled {new Date(f.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <button onClick={()=>unenroll(f.id)} disabled={unenrolling}
                  style={{padding:'6px 12px',borderRadius:8,border:'1px solid rgba(255,92,58,0.3)',background:'rgba(255,92,58,0.08)',color:'#ff5c3a',fontSize:'0.75rem',cursor:'pointer',fontFamily:'Syne,sans-serif',fontWeight:600}}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          {msg&&(
            <div style={{padding:'10px 14px',borderRadius:10,background:msg.includes('success')?'rgba(0,165,80,0.1)':'rgba(255,92,58,0.1)',border:`1px solid ${msg.includes('success')?'rgba(0,165,80,0.3)':'rgba(255,92,58,0.3)'}`,color:msg.includes('success')?'#4dd882':'#ff7a5c',fontSize:'0.82rem',marginBottom:12,textAlign:'center'}}>
              {msg}
            </div>
          )}

          {/* Enroll new */}
          <a href="/mfa?mode=enroll"
            style={{display:'block',padding:'12px',borderRadius:12,border:'1px solid rgba(255,92,58,0.3)',background:'rgba(255,92,58,0.08)',color:'#ff5c3a',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.85rem',textAlign:'center',textDecoration:'none'}}>
            {verified.length>0?'+ Add Another Authenticator':'🔐 Set Up MFA Now'}
          </a>

          <div style={{marginTop:12,padding:'10px 14px',borderRadius:10,background:'rgba(255,255,255,0.03)',border:`1px solid ${border}`,fontSize:'0.75rem',color:sub,lineHeight:1.6}}>
            💡 Use <strong style={{color:text}}>Google Authenticator</strong>, <strong style={{color:text}}>Authy</strong>, or any TOTP app. If you lose access to your authenticator, contact your admin to reset MFA.
          </div>
        </>
      )}
    </div>
  )
}
