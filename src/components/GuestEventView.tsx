'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPhotoUrl } from '@/lib/utils'
import Image from 'next/image'
import { Camera, Download, Share2, QrCode, X, Images } from 'lucide-react'
import QRCodeDisplay from '@/components/QRCodeDisplay'

interface Photo {
  id: string
  storage_path: string
  uploaded_at: string
}

interface Props {
  eventId: string
  guestId: string
  guestName: string
  slug: string
  token: string
  initialPhotos: Photo[]
  guestPhotoCount: number
  shotsLimit: number
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function GuestEventView({
  eventId, guestId, guestName, slug, token,
  initialPhotos, guestPhotoCount, shotsLimit,
}: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [uploadCount, setUploadCount] = useState(guestPhotoCount)
  const [error, setError] = useState('')
  const [showQR, setShowQR] = useState(false)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const shotsLeft = Math.max(0, shotsLimit - uploadCount)
  const initials = getInitials(guestName)

  // Persist token so returning visitors don't have to re-enter name
  useEffect(() => {
    try {
      localStorage.setItem(`povs-guest-${slug}`, JSON.stringify({ token, name: guestName }))
    } catch { /* storage unavailable */ }
  }, [slug, token, guestName])

  const uploadFiles = useCallback(async (files: FileList) => {
    if (uploading) return
    setUploading(true)
    setError('')

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      if (uploadCount >= shotsLimit) {
        setError('Has alcanzado el límite de fotos.')
        break
      }

      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${eventId}/${guestId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setError('No se pudo subir la foto.')
        continue
      }

      const { data: photo } = await supabase
        .from('photos')
        .insert({ event_id: eventId, guest_id: guestId, storage_path: path })
        .select()
        .single()

      if (photo) {
        setPhotos(prev => [photo as Photo, ...prev])
        setUploadCount(c => c + 1)
      }
    }

    setUploading(false)
  }, [uploading, uploadCount, shotsLimit, eventId, guestId, supabase])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      uploadFiles(e.target.files)
      e.target.value = ''
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/event/${slug}`
    if (navigator.share) {
      await navigator.share({ title: 'Únete al evento', url }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(url).catch(() => {})
    }
  }

  async function handleExport() {
    for (const photo of photos) {
      const url = getPhotoUrl(SUPABASE_URL, photo.storage_path)
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `povs-${photo.id.slice(0, 6)}.jpg`
      a.click()
      URL.revokeObjectURL(blobUrl)
      await new Promise(r => setTimeout(r, 200))
    }
  }

  return (
    <>
      {/* Action bar */}
      <div className="flex items-center gap-2 px-4 mb-5 flex-wrap">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-sans font-medium transition-all active:scale-95"
          style={{ background: '#1a1a1a', color: '#a0a0a0', border: '1px solid #2a2a2a' }}
        >
          <Download size={14} />
          Exportar
        </button>
        <button
          onClick={() => setShowQR(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-sans font-medium transition-all active:scale-95"
          style={{ background: '#1a1a1a', color: '#a0a0a0', border: '1px solid #2a2a2a' }}
        >
          <QrCode size={14} />
          Invitar
        </button>

        {/* Gallery button */}
        <button
          onClick={() => galleryRef.current?.click()}
          disabled={uploading || shotsLeft === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-sans font-medium transition-all active:scale-95 disabled:opacity-50"
          style={{ background: '#1a1a1a', color: '#a0a0a0', border: '1px solid #2a2a2a' }}
        >
          <Images size={14} />
          Galería
        </button>

        {/* Camera button */}
        <button
          onClick={() => cameraRef.current?.click()}
          disabled={uploading || shotsLeft === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-sans font-semibold transition-all active:scale-95 disabled:opacity-50 ml-auto"
          style={{ background: '#fff', color: '#0a0a0a' }}
        >
          <Camera size={15} />
          {uploading ? 'Subiendo...' : `Cámara${shotsLeft < shotsLimit ? ` · ${shotsLeft}` : ''}`}
        </button>

        {/* Camera input — forces camera */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {/* Gallery input — no capture, opens photo picker */}
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <p className="mx-4 mb-3 text-xs font-sans px-4 py-2 rounded-xl" style={{ background: '#1a0808', color: '#f87171' }}>
          {error}
        </p>
      )}

      {/* Keep memories upsell */}
      <div
        className="mx-4 mb-5 px-4 py-4 rounded-2xl flex items-center justify-between"
        style={{ background: '#111600', border: '1px solid #2a2800' }}
      >
        <div>
          <p className="text-sm font-sans font-semibold" style={{ color: '#c9a96e' }}>
            Guarda tus recuerdos
          </p>
          <p className="text-xs font-sans mt-0.5" style={{ color: '#6a5a30' }}>
            Crea una cuenta para volver a ver tus fotos.
          </p>
        </div>
        <a
          href="/auth"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all active:scale-95"
          style={{ background: '#c9a96e', color: '#0a0a0a' }}
        >
          <Download size={16} />
        </a>
      </div>

      {/* Photo grid — only this guest's photos */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <Camera size={40} className="mb-4" style={{ color: '#333' }} />
          <p className="text-sm font-sans text-muted-foreground">
            Toma tu primera foto o sube desde tu galería
          </p>
        </div>
      ) : (
        <>
          <p className="px-4 mb-3 text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Tus fotos · {photos.length}
          </p>
          <div className="grid grid-cols-2 gap-0.5">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square overflow-hidden"
                style={{ background: '#111' }}
              >
                <Image
                  src={getPhotoUrl(SUPABASE_URL, photo.storage_path)}
                  alt="Foto del evento"
                  fill
                  className="object-cover"
                />
                {/* Initials badge */}
                <div
                  className="absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-sans font-bold"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(4px)' }}
                >
                  {initials}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* QR Modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowQR(false)}
        >
          <div
            className="w-full max-w-sm mx-4 mb-6 rounded-3xl p-6 pb-8"
            style={{ background: '#111', border: '1px solid #222' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="font-sans font-semibold text-sm">Invitar al evento</p>
              <button onClick={() => setShowQR(false)} className="text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="flex justify-center mb-5">
              <QRCodeDisplay url={typeof window !== 'undefined' ? `${window.location.origin}/event/${slug}` : `/event/${slug}`} />
            </div>
            <button
              onClick={handleShare}
              className="w-full py-3.5 rounded-2xl text-sm font-sans font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: '#c9a96e', color: '#0a0a0a' }}
            >
              <Share2 size={15} />
              Compartir enlace
            </button>
          </div>
        </div>
      )}
    </>
  )
}
