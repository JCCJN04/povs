import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import React from 'react'
import { Camera, Users, ExternalLink } from 'lucide-react'
import { Heart, Cake, Compass, Confetti, Camera as PhCamera } from '@phosphor-icons/react/dist/ssr'
import { Photo, Guest } from '@/lib/types'
import RevealButton from '@/components/RevealButton'
import PhotoGrid from '@/components/PhotoGrid'
import SharePanel from '@/components/SharePanel'
import AppHeader from '@/components/AppHeader'

export default async function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('host_id', user.id)
    .single()

  if (!event) notFound()

  const [{ data: photos }, { data: guests }] = await Promise.all([
    supabase.from('photos').select('*, guest:guests(name)').eq('event_id', id).order('uploaded_at', { ascending: false }),
    supabase.from('guests').select('*').eq('event_id', id).order('joined_at', { ascending: false }),
  ])

  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/event/${event.slug}`
  const isActive = event.status === 'active' && new Date(event.ends_at) > new Date()
  const isRevealed = event.status === 'revealed'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

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

  const eventTypeIcon: Record<string, React.ReactNode> = {
    wedding:  <Heart    size={36} weight="thin" />,
    birthday: <Cake     size={36} weight="thin" />,
    trip:     <Compass  size={36} weight="thin" />,
    party:    <Confetti size={36} weight="thin" />,
    other:    <PhCamera size={36} weight="thin" />,
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <AppHeader right={
        <Link href="/dashboard" className="text-xs font-sans text-muted-foreground hover:text-foreground transition-colors">
          ← Mis eventos
        </Link>
      } />

      <div className="max-w-2xl mx-auto px-6 py-14">

        {/* Event identity */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4 text-muted-foreground">
            {eventTypeIcon[event.event_type] || eventTypeIcon.other}
          </div>
          <h1 className="font-display text-4xl mb-3">{event.name}</h1>

          {/* Status + time */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[event.status] }} />
            <span className="text-sm font-sans text-muted-foreground">
              {statusLabel[event.status]}
              {' · '}
              {isActive
                ? `cierra ${formatDistanceToNow(new Date(event.ends_at), { addSuffix: true, locale: es })}`
                : `cerró el ${format(new Date(event.ends_at), "d 'de' MMMM", { locale: es })}`}
            </span>
          </div>

          {/* Stats pills */}
          <div className="flex items-center justify-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
              <Camera size={12} style={{ color: '#c9a96e' }} />
              {photos?.length || 0} fotos
            </span>
            <span className="text-foreground/15">·</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
              <Users size={12} style={{ color: '#c9a96e' }} />
              {guests?.length || 0} invitados
            </span>
            <span className="text-foreground/15">·</span>
            <a
              href={eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-sans transition-colors hover:text-foreground"
              style={{ color: '#c9a96e' }}
            >
              Ver evento <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* ── ACTIVE: QR as hero ── */}
        {isActive && (
          <section className="py-12 border-y border-foreground/5 mb-12">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground text-center mb-10">
              Comparte con tus invitados
            </p>
            <SharePanel url={eventUrl} />
            {event.status !== 'revealed' && (
              <div className="flex justify-center mt-8">
                <RevealButton eventId={event.id} />
              </div>
            )}
          </section>
        )}

        {/* ── ENDED (not revealed): reveal prompt ── */}
        {!isActive && !isRevealed && (
          <section className="py-12 border-y border-foreground/5 mb-12 text-center">
            <p className="text-4xl mb-4">🎞️</p>
            <p className="font-display text-xl mb-2">El álbum espera ser revelado.</p>
            <p className="text-sm font-sans text-muted-foreground mb-8">
              Ya no se aceptan fotos nuevas. Revela el álbum cuando estés listo.
            </p>
            <RevealButton eventId={event.id} />
          </section>
        )}

        {/* ── REVEALED: photos ── */}
        {isRevealed && photos && photos.length > 0 && (
          <section className="mb-12">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Álbum revelado · {photos.length} fotos
            </h2>
            <PhotoGrid photos={photos as (Photo & { guest: Guest | null })[]} supabaseUrl={supabaseUrl} />
          </section>
        )}

        {isRevealed && (!photos || photos.length === 0) && (
          <section className="py-12 border-y border-foreground/5 mb-12 text-center">
            <p className="font-sans text-muted-foreground">Nadie subió fotos en este evento.</p>
          </section>
        )}

        {/* ── Guests ── */}
        {guests && guests.length > 0 && (
          <section>
            <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-5">
              Invitados · {guests.length}
            </h2>
            <div className="border-t border-foreground/5">
              {guests.map((guest: Guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between py-3.5 border-b border-foreground/5"
                >
                  <span className="text-sm">{guest.name}</span>
                  <span className="text-xs font-sans text-muted-foreground">
                    {formatDistanceToNow(new Date(guest.joined_at), { addSuffix: true, locale: es })}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
