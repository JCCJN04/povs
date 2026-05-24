import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Event } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Camera, Users } from 'lucide-react'
import SignOutButton from '@/components/SignOutButton'
import AppHeader from '@/components/AppHeader'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  await supabase
    .from('events')
    .update({ status: 'revealed' })
    .eq('host_id', user.id)
    .eq('status', 'active')
    .lt('ends_at', new Date().toISOString())

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })

  const eventsWithCounts = await Promise.all(
    (events || []).map(async (event: Event) => {
      const [{ count: photoCount }, { count: guestCount }] = await Promise.all([
        supabase.from('photos').select('*', { count: 'exact', head: true }).eq('event_id', event.id),
        supabase.from('guests').select('*', { count: 'exact', head: true }).eq('event_id', event.id),
      ])
      return { ...event, photoCount: photoCount || 0, guestCount: guestCount || 0 }
    })
  )

  const statusColor: Record<string, string> = {
    active: '#4ade80',
    ended: '#555',
    revealed: '#c9a96e',
  }

  const statusLabel: Record<string, string> = {
    active: 'activo',
    ended: 'terminado',
    revealed: 'revelado',
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <AppHeader right={
        <>
          <span className="text-xs font-sans hidden sm:block text-muted-foreground">{user.email}</span>
          <SignOutButton />
        </>
      } />

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Page header */}
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Tus eventos
            </p>
            <h1 className="font-display text-4xl text-foreground">
              {eventsWithCounts.length === 0
                ? 'Sin eventos aún.'
                : `${eventsWithCounts.length} álbum${eventsWithCounts.length > 1 ? 'es' : ''}.`}
            </h1>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-sans font-semibold rounded-full transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#c9a96e', color: '#0a0a0a' }}
          >
            <Plus size={14} /> Nuevo evento
          </Link>
        </div>

        {eventsWithCounts.length === 0 ? (
          <div className="py-24 text-center border-t border-foreground/5">
            <p className="font-display text-xl text-muted-foreground mb-2">Nada aquí todavía.</p>
            <p className="text-sm font-sans text-muted-foreground/60 mb-8">
              Crea tu primer álbum y compártelo con un QR.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-sans font-semibold rounded-full transition-all hover:opacity-90"
              style={{ background: '#c9a96e', color: '#0a0a0a' }}
            >
              <Plus size={14} /> Crear evento
            </Link>
          </div>
        ) : (
          <div className="border-t border-foreground/5">
            {eventsWithCounts.map((event) => (
              <div
                key={event.id}
                className="group flex items-center justify-between gap-6 py-5 border-b border-foreground/5 transition-all hover:border-foreground/10"
              >
                {/* Left: status dot + name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: statusColor[event.status] }}
                    />
                    <h2 className="font-display text-lg truncate">{event.name}</h2>
                    <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">
                      {statusLabel[event.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground pl-[18px]">
                    <span className="flex items-center gap-1"><Camera size={10} /> {event.photoCount}</span>
                    <span className="text-foreground/20">·</span>
                    <span className="flex items-center gap-1"><Users size={10} /> {event.guestCount}</span>
                    <span className="text-foreground/20">·</span>
                    <span>
                      {event.status === 'active'
                        ? `cierra ${formatDistanceToNow(new Date(event.ends_at), { addSuffix: true, locale: es })}`
                        : `cerró ${formatDistanceToNow(new Date(event.ends_at), { addSuffix: true, locale: es })}`}
                    </span>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-4 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/event/${event.slug}`}
                    className="text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Ver ↗
                  </Link>
                  <Link
                    href={`/dashboard/event/${event.id}`}
                    className="px-4 py-1.5 text-xs font-sans rounded-full transition-all hover:opacity-90"
                    style={{ background: '#161610', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.2)' }}
                  >
                    Gestionar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
