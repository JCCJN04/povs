'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Photo, Guest } from '@/lib/types'
import Image from 'next/image'
import { getPhotoUrl } from '@/lib/utils'
import { Download, X, ChevronLeft, ChevronRight } from 'lucide-react'

type PhotoWithGuest = Photo & { guest: Guest | null }

async function downloadPhoto(url: string, filename: string) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    a.click()
    URL.revokeObjectURL(blobUrl)
  } catch {
    window.open(url, '_blank')
  }
}

export default function AlbumView({ eventId, guestToken }: { eventId: string; guestToken?: string }) {
  const [photos, setPhotos] = useState<PhotoWithGuest[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const supabase = createClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('photos')
        .select('*, guest:guests(name)')
        .eq('event_id', eventId)
        .order('uploaded_at', { ascending: false })
      setPhotos((data || []) as PhotoWithGuest[])
      setLoading(false)
    }
    load()
  }, [eventId, supabase])

  const lightbox = lightboxIndex !== null ? photos[lightboxIndex] : null

  const prev = useCallback(() => {
    setLightboxIndex(i => (i !== null ? (i - 1 + photos.length) % photos.length : null))
  }, [photos.length])

  const next = useCallback(() => {
    setLightboxIndex(i => (i !== null ? (i + 1) % photos.length : null))
  }, [photos.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setLightboxIndex(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, prev, next])

  async function handleDownloadOne() {
    if (!lightbox) return
    setDownloading(true)
    const url = getPhotoUrl(supabaseUrl, lightbox.storage_path)
    const filename = `foto-${lightbox.guest?.name ?? 'povs'}-${lightbox.id.slice(0, 6)}.jpg`
    await downloadPhoto(url, filename)
    setDownloading(false)
  }

  async function handleDownloadAll() {
    setDownloadingAll(true)
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      const url = getPhotoUrl(supabaseUrl, photo.storage_path)
      const filename = `foto-${(i + 1).toString().padStart(2, '0')}-${photo.guest?.name ?? 'povs'}.jpg`
      await downloadPhoto(url, filename)
      await new Promise(r => setTimeout(r, 300))
    }
    setDownloadingAll(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 mt-8">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-sm shimmer" />
        ))}
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="py-16 mt-8 rounded-sm text-center border border-border">
        <p className="text-4xl mb-3">🎞️</p>
        <p className="font-sans text-muted-foreground">Nadie subió fotos en este evento.</p>
      </div>
    )
  }

  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4 mt-8">
        <p className="text-sm font-sans text-muted-foreground">
          {photos.length} foto{photos.length > 1 ? 's' : ''}
        </p>
        <button
          onClick={handleDownloadAll}
          disabled={downloadingAll}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-sans rounded-full transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: '#161610', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.2)' }}
        >
          <Download size={12} />
          {downloadingAll ? 'Descargando...' : 'Descargar todas'}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-square rounded-sm overflow-hidden group"
            style={{ background: '#1a1a1a' }}
          >
            <Image
              src={getPhotoUrl(supabaseUrl, photo.storage_path)}
              alt={photo.caption || 'Foto'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Guest name — always visible at bottom */}
            {photo.guest?.name && (
              <div
                className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }}
              >
                <span className="text-[10px] font-sans text-white/90 truncate block leading-tight">
                  {photo.guest.name}
                </span>
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
              <Download size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.97)' }}
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <X size={18} />
          </button>

          {/* Counter */}
          <span className="absolute top-5 left-1/2 -translate-x-1/2 text-xs font-mono text-muted-foreground">
            {lightboxIndex + 1} / {photos.length}
          </span>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-4 p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-3xl w-full max-h-[80vh] mx-16"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
              <Image
                src={getPhotoUrl(supabaseUrl, lightbox.storage_path)}
                alt={lightbox.caption || 'Foto'}
                fill
                className="object-contain rounded-sm"
              />
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-sm font-sans text-muted-foreground">
                {lightbox.guest ? <>por <span className="text-foreground">{lightbox.guest.name}</span></> : ''}
              </p>
              <button
                onClick={handleDownloadOne}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-sans font-semibold rounded-full transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: '#c9a96e', color: '#0a0a0a' }}
              >
                <Download size={13} />
                {downloading ? 'Descargando...' : 'Descargar'}
              </button>
            </div>
          </div>

          {/* Next */}
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-4 p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>
      )}
    </>
  )
}
