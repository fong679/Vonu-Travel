'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import OperatorDashboard from '@/components/operator/OperatorDashboard'

export default function OperatorPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single()
      if (!profile || profile.role !== 'operator') { window.location.href = '/'; return }
      setUser(user)
      setProfile(profile)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#071e30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white', fontFamily: 'Syne,sans-serif', fontSize: '1rem' }}>Loading operator panel...</div>
    </div>
  )

  return <OperatorDashboard user={user} profile={profile} supabase={supabase}/>
}
