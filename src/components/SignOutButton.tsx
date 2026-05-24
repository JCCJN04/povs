'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={signOut}
      className="text-xs font-sans px-3 py-1.5 rounded-sm transition-all border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
    >
      Cerrar sesión
    </button>
  )
}
