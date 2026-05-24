'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RevealButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function reveal() {
    setLoading(true)
    await supabase.from('events').update({ status: 'revealed' }).eq('id', eventId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={reveal}
      disabled={loading}
      className="px-5 py-2 text-xs font-sans font-semibold rounded-full transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
      style={{ background: '#c9a96e', color: '#0a0a0a' }}
    >
      {loading ? 'Revelando...' : 'Revelar álbum'}
    </button>
  )
}
