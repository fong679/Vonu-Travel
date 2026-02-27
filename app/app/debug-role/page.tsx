'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function DebugRole() {
  const [info, setInfo] = useState<any>({loading: true})
  const supabase = createClient()

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setInfo({ error: 'Not logged in' }); return }
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setInfo({ userId: user.id, email: user.email, profile, profileError: error?.message })
    }
    check()
  }, [])

  return (
    <div style={{ padding: 40, background: '#071e30', minHeight: '100vh', color: 'white', fontFamily: 'monospace' }}>
      <h2 style={{ color: '#ff5c3a', marginBottom: 20 }}>Role Debug</h2>
      <pre style={{ background: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 12, fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(info, null, 2)}
      </pre>
      <a href="/" style={{ color: '#ff5c3a', marginTop: 20, display: 'block' }}>← Back</a>
    </div>
  )
}
