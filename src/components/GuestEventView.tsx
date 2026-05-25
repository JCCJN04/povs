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

import imageCompression from 'browser-image-compression'

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

    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'))
    const toUpload = fileArray.slice(0, shotsLimit - uploadCount)

    if (toUpload.length === 0) {
      setError('Has alcanzado el límite de fotos.')
      setUploading(false)
      return
    }

    const uploadPromises = toUpload.map(async (file) => {
      // 1. Compress image to max 1MB / 1920px
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true }
      let compressedFile = file
      try {
        compressedFile = await imageCompression(file, options)
      } catch (e) {
        console.warn('Compression failed, using original', e)
      }

      // 2. Upload to storage
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${eventId}/${guestId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, compressedFile, { cacheControl: '3600', upsert: false })

      if (uploadError) throw new Error(uploadError.message)

      // 3. Insert into DB
      const { error: insertError } = await supabase
        .from('photos')
        .insert({ event_id: eventId, guest_id: guestId, storage_path: path })

      if (insertError) throw new Error(insertError.message)

      return path
    })

    const results = await Promise.allSettled(uploadPromises)
    const successPaths = results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
      .map(r => r.value)
    
    const fails = results.filter(r => r.status === 'rejected')

    if (fails.length > 0) {
      setError(`No se pudieron subir ${fails.length} foto(s).`)
    }

    if (successPaths.length > 0) {
      const newPhotos = successPaths.map(path => ({
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        storage_path: path,
        uploaded_at: new Date().toISOString(),
      }))
      setPhotos(prev => [...newPhotos, ...prev])
      setUploadCount(c => c + newPhotos.length)
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

  async function handleShareDirect() {
    const url = `${window.location.origin}/event/${slug}`
    if (navigator.share) {
      await navigator.share({
        title: `Únete al evento: ${slug}`,
        text: '¡Toma fotos en el evento! Únete aquí 👇',
        url,
      }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(url).catch(() => {})
      // show brief copied feedback via error state reuse
      setError('¡Enlace copiado al portapapeles!')
      setTimeout(() => setError(''), 2500)
    }
  }

  return (
    <>
      {/* Action bar */}
      <div className="flex items-center gap-2 px-4 mb-4 flex-wrap">
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
          QR
        </button>

        {/* Gallery button */}
        <button
          onClick={() => galleryRef.current?.click()}
          disabled={uploading || shotsLeft === 0}
          className="flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-full text-xs font-sans font-medium transition-all active:scale-95 disabled:opacity-50"
          style={{ background: '#1a1a1a', color: '#a0a0a0', border: '1px solid #2a2a2a' }}
        >
          <Images size={14} />
          Galería
        </button>

        <button
          onClick={() => cameraRef.current?.click()}
          disabled={uploading || shotsLeft === 0}
          className="flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-full text-sm font-sans font-semibold transition-all active:scale-95 disabled:opacity-50 ml-auto hover:opacity-90"
          style={{ background: '#c9a96e', color: '#0a0a0a' }}
        >
          <Camera size={15} />
          {uploading ? 'Subiendo...' : `Cámara${shotsLeft < shotsLimit ? ` · ${shotsLeft}` : ''}`}
        </button>

        {/* Camera input — forces camera, no multiple (iOS Safari fix) */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
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

      {/* ── Invite friends card ── */}
      <div
        className="mx-4 mb-4 rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(201,169,110,0.2)', background: 'linear-gradient(135deg, #161610 0%, #1a1500 100%)' }}
      >
        <div className="px-4 py-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-sans font-semibold" style={{ color: '#c9a96e' }}>
              Invita a tus amigos
            </p>
            <p className="text-xs font-sans mt-0.5" style={{ color: '#6a5a30' }}>
              Que ellos también capturen el momento
            </p>
          </div>
          {/* Share button — primary action, Web Share API */}
          <button
            onClick={handleShareDirect}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full text-sm font-sans font-semibold transition-all active:scale-95 hover:opacity-90 flex-shrink-0"
            style={{ background: '#c9a96e', color: '#0a0a0a' }}
          >
            <Share2 size={15} />
            Compartir
          </button>
        </div>

        {/* URL chip — tap to copy */}
        <button
          onClick={handleShareDirect}
          className="w-full px-4 py-2.5 flex items-center gap-2 transition-all active:opacity-70"
          style={{ borderTop: '1px solid rgba(201,169,110,0.1)' }}
        >
          <span
            className="flex-1 text-left text-[11px] font-mono truncate"
            style={{ color: '#4a3e20' }}
          >
            {typeof window !== 'undefined' ? window.location.origin : ''}/event/{slug}
          </span>
          <span className="text-[10px] font-sans flex-shrink-0" style={{ color: 'rgba(201,169,110,0.4)' }}>
            Copiar ↗
          </span>
        </button>
      </div>

      {error && (
        <p
          className="mx-4 mb-3 text-xs font-sans px-4 py-2 rounded-xl"
          style={{
            background: error.includes('copiado') ? '#0a1a0a' : '#1a0808',
            color: error.includes('copiado') ? '#86efac' : '#f87171',
            border: `1px solid ${error.includes('copiado') ? '#1a3a1a' : '#3a1010'}`,
          }}
        >
          {error}
        </p>
      )}

      {/* Keep memories upsell */}
      <div
        className="mx-4 mb-5 px-4 py-4 rounded-2xl flex items-center justify-between"
        style={{ background: '#0f0f0f', border: '1px solid #1f1f1f' }}
      >
        <div>
          <p className="text-sm font-sans font-semibold text-foreground">
            Guarda tus recuerdos
          </p>
          <p className="text-xs font-sans mt-0.5 text-muted-foreground">
            Crea una cuenta para volver a ver tus fotos.
          </p>
        </div>
        <a
          href="/auth"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all active:scale-95 hover:opacity-90"
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
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={() => setShowQR(false)}
        >
          <div
            className="w-full max-w-sm mx-4 mb-6 rounded-3xl p-6 pb-8"
            style={{ background: '#111', border: '1px solid #222' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center mb-5">
              <div className="w-8 h-1 rounded-full" style={{ background: '#333' }} />
            </div>
            <div className="flex items-center justify-between mb-6">
              <p className="font-sans font-semibold text-sm">Invitar al evento</p>
              <button onClick={() => setShowQR(false)} className="text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X size={18} />
              </button>
            </div>
            <div className="flex justify-center mb-6">
              <QRCodeDisplay url={typeof window !== 'undefined' ? `${window.location.origin}/event/${slug}` : `/event/${slug}`} />
            </div>
            {/* Two action buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleShareDirect}
                className="w-full py-3.5 rounded-2xl text-sm font-sans font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:opacity-90"
                style={{ background: '#c9a96e', color: '#0a0a0a' }}
              >
                <Share2 size={15} />
                Compartir enlace
              </button>
              <button
                onClick={async () => {
                  const url = `${window.location.origin}/event/${slug}`
                  await navigator.clipboard.writeText(url).catch(() => {})
                  setShowQR(false)
                  setError('¡Enlace copiado!')
                  setTimeout(() => setError(''), 2500)
                }}
                className="w-full py-3 rounded-2xl text-sm font-sans font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ background: '#1a1a1a', color: '#a0a0a0', border: '1px solid #2a2a2a' }}
              >
                Copiar enlace
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
