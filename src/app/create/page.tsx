import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateEventForm from '@/components/CreateEventForm'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export default async function CreatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  return (
    <main className="min-h-screen bg-background text-foreground">
      <AppHeader right={
        <Link href="/dashboard" className="text-xs font-sans text-muted-foreground hover:text-foreground transition-colors">
          ← Mis eventos
        </Link>
      } />

      <div className="max-w-xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl font-light mb-2">Crear un evento</h1>
        <p className="text-sm font-sans text-muted-foreground mb-10">Configura tu álbum privado en segundos.</p>
        <CreateEventForm userId={user.id} />
      </div>
    </main>
  )
}
