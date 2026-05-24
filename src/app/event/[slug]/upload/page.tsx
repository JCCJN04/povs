import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Clock, Users } from 'lucide-react'
import GuestEventView from '@/components/GuestEventView'

const SHOTS_LIMIT = 24

export default async function UploadPage({ params, searchParams }: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { slug } = await params
  const { token } = await searchParams

  if (!token) redirect(`/event/${slug}`)

  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  const isActive = event.status === 'active' && new Date(event.ends_at) > new Date()
  if (!isActive) redirect(`/event/${slug}`)

  const { data: guest } = await supabase
    .from('guests')
    .select('*')
    .eq('token', token)
    .eq('event_id', event.id)
    .single()

  if (!guest) redirect(`/event/${slug}`)

  // Counts
  const { count: guestCount } = await supabase
    .from('guests')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)

  const { count: guestPhotoCount } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)
    .eq('guest_id', guest.id)

  // Only this guest's photos (album is unrevealed — other guests' photos stay hidden)
  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', event.id)
    .eq('guest_id', guest.id)
    .order('uploaded_at', { ascending: false })
    .limit(100)

  const timeLeft = formatDistanceToNow(new Date(event.ends_at), { locale: es })

  const coverUrl = event.cover_image
    ? (event.cover_image.startsWith('http')
        ? event.cover_image
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-covers/${event.cover_image}`)
    : null

  return (
    <main className="min-h-[100svh] bg-[#0a0a0a] text-white">
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4"
        style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center h-14">
          <Link
            href={`/event/${slug}?token=${token}`}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 text-center mx-4">
            <p className="font-display text-base font-light leading-tight truncate">{event.name}</p>
            <p className="text-[11px] font-sans flex items-center justify-center gap-1 mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <Clock size={10} />
              {timeLeft} restante
            </p>
          </div>
          {/* Cover thumbnail */}
          <div
            className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
            style={{ background: '#1a1a1a' }}
          >
            {coverUrl && (
              <Image src={coverUrl} alt={event.name} width={36} height={36} className="w-full h-full object-cover" />
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-1.5 text-xs font-sans" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <Clock size={12} />
          {timeLeft}
        </div>
        {guestCount !== null && (
          <div className="flex items-center gap-1.5 text-xs font-sans" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Users size={12} />
            {guestCount} {guestCount === 1 ? 'persona' : 'personas'}
          </div>
        )}
      </div>

      {/* Interactive section: actions + photo feed */}
      <div className="pt-4 pb-20">
        <GuestEventView
          eventId={event.id}
          guestId={guest.id}
          guestName={guest.name}
          slug={slug}
          token={token}
          initialPhotos={photos ?? []}
          guestPhotoCount={guestPhotoCount ?? 0}
          shotsLimit={SHOTS_LIMIT}
        />
      </div>
    </main>
  )
}
