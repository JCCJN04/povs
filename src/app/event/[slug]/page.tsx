import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import JoinEventForm from '@/components/JoinEventForm'
import AlbumView from '@/components/AlbumView'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users } from 'lucide-react'

export default async function EventPage({ params, searchParams }: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { slug } = await params
  const { token } = await searchParams

  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  // Auto-reveal if ended
  if (event.status === 'active' && new Date(event.ends_at) < new Date()) {
    await supabase.from('events').update({ status: 'revealed' }).eq('id', event.id)
    event.status = 'revealed'
  }

  const isActive = event.status === 'active' && new Date(event.ends_at) > new Date()
  const isRevealed = event.status === 'revealed'

  // Guest lookup by token
  let guest = null
  if (token) {
    const { data } = await supabase
      .from('guests')
      .select('*')
      .eq('token', token)
      .eq('event_id', event.id)
      .single()
    guest = data
  }

  // Guest count
  const { count: guestCount } = await supabase
    .from('guests')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)

  const timeLeft = isActive
    ? formatDistanceToNow(new Date(event.ends_at), { locale: es })
    : null

  const coverUrl = event.cover_image
    ? (event.cover_image.startsWith('http')
        ? event.cover_image
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-covers/${event.cover_image}`)
    : null

  // ── Revealed album ──────────────────────────────────────────────────────────
  if (isRevealed) {
    return (
      <main className="min-h-[100svh] bg-background text-foreground">
        <div className="max-w-xl mx-auto px-4 pt-12 pb-20">
          {/* Brand */}
          <Link href="/" className="block mb-10 text-center">
            <span className="font-display text-lg tracking-tight text-foreground/50">Povs</span>
          </Link>

          <h1 className="font-display text-3xl font-light text-center mb-2">{event.name}</h1>
          <p className="text-xs font-mono text-center text-muted-foreground mb-10 uppercase tracking-widest">
            Album revelado
          </p>

          <AlbumView eventId={event.id} guestToken={token} />
        </div>
      </main>
    )
  }

  // ── Pending reveal (ended, not yet revealed) ────────────────────────────────
  if (!isActive && !isRevealed) {
    return (
      <main className="min-h-[100svh] bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
        <Link href="/" className="absolute top-6 left-6">
          <span className="font-display text-base text-foreground/30">Povs</span>
        </Link>
        <p className="text-4xl mb-5">🎞️</p>
        <h1 className="font-display text-2xl font-light mb-2 text-center">{event.name}</h1>
        <p className="text-sm font-sans text-muted-foreground text-center max-w-xs">
          El álbum se está revelando. Vuelve pronto para ver todos los momentos.
        </p>
      </main>
    )
  }

  // ── Active: full-screen invite / welcome back ───────────────────────────────
  return (
    <main className="relative min-h-[100svh] bg-[#0a0a0a] overflow-hidden">
      {/* Background cover photo */}
      {coverUrl ? (
        <div className="absolute inset-0">
          <Image
            src={coverUrl}
            alt={event.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/90" />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #1a1500 0%, #0a0a0a 70%)',
          }}
        />
      )}

      {/* Brand mark */}
      <div className="relative z-10 flex justify-center pt-12">
        <Link href="/">
          <span className="font-display text-base text-white/40 hover:text-white/70 transition-colors">
            Povs
          </span>
        </Link>
      </div>

      {/* Invited badge */}
      <div className="relative z-10 flex justify-center mt-6">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-sans"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <Users size={12} />
          Te han invitado
        </div>
      </div>

      {/* Event info */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 mt-8">
        <h1
          className="font-display font-light text-white leading-tight mb-4"
          style={{ fontSize: 'clamp(2rem, 8vw, 3rem)' }}
        >
          {event.name}
        </h1>

        <div className="flex items-center gap-4 text-sm font-sans" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {timeLeft && (
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {timeLeft} restante
            </span>
          )}
          {guestCount !== null && guestCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Users size={13} />
              {guestCount} {guestCount === 1 ? 'persona' : 'personas'}
            </span>
          )}
        </div>
      </div>

      {/* Bottom panel */}
      <div
        className="relative z-10 absolute bottom-0 left-0 right-0 px-6 pb-10 pt-8"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 60%, transparent)' }}
      >
        {guest ? (
          // Welcome back
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <div
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 text-sm font-sans font-semibold"
              style={{ background: 'rgba(22,58,22,0.9)', border: '1px solid #2d6e2d', color: '#4ade80' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7.5" stroke="#4ade80" />
                <path d="M4.5 8L6.8 10.5L11.5 5.5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Bienvenido de vuelta, {guest.name}
            </div>
            <Link
              href={`/event/${slug}/upload?token=${token}`}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 text-sm font-sans font-semibold transition-all active:scale-[0.98]"
              style={{ background: '#fff', color: '#0a0a0a' }}
            >
              Tomar fotos
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        ) : (
          // Join form
          <div className="max-w-sm mx-auto">
            <p className="text-xs font-sans text-center mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Ingresa tu nombre para unirte
            </p>
            <JoinEventForm eventId={event.id} slug={slug} />
          </div>
        )}
      </div>
    </main>
  )
}
