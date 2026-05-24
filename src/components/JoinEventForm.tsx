'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function JoinEventForm({ eventId, slug }: { eventId: string; slug: string }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('guests')
      .insert({ event_id: eventId, name })
      .select()
      .single()

    if (err) {
      setError('No pudimos unirte. Intenta de nuevo.')
      setLoading(false)
      return
    }

    try {
      localStorage.setItem(`povs-guest-${slug}`, JSON.stringify({ token: data.token, name }))
    } catch { /* storage unavailable */ }
    router.push(`/event/${slug}/upload?token=${data.token}`)
  }

  return (
    <form onSubmit={handleJoin} className="flex flex-col gap-3">
      <input
        type="text"
        required
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full px-5 py-4 rounded-2xl text-sm font-sans outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff',
        }}
        placeholder="Tu nombre"
        autoFocus
        onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.4)' }}
        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)' }}
      />

      {error && (
        <p className="text-xs font-sans text-center" style={{ color: '#f87171' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full py-4 rounded-2xl text-sm font-sans font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
        style={{ background: '#fff', color: '#0a0a0a' }}
      >
        {loading ? 'Uniéndose...' : 'Unirse al evento →'}
      </button>
    </form>
  )
}
