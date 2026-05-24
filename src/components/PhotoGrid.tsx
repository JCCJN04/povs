'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Download } from 'lucide-react'
import { Photo, Guest } from '@/lib/types'
import { getPhotoUrl } from '@/lib/utils'

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

export default function PhotoGrid({ photos, supabaseUrl }: {
  photos: PhotoWithGuest[]
  supabaseUrl: string
}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadingAll, setDownloadingAll] = useState(false)

  async function handleDownloadAll() {
    setDownloadingAll(true)
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      const url = getPhotoUrl(supabaseUrl, photo.storage_path)
      const filename = `foto-${(i + 1).toString().padStart(2, '0')}-${photo.guest?.name ?? 'once'}.jpg`
      await downloadPhoto(url, filename)
      await new Promise(r => setTimeout(r, 300))
    }
    setDownloadingAll(false)
  }

  async function handleDownload(photo: PhotoWithGuest) {
    setDownloadingId(photo.id)
    const url = getPhotoUrl(supabaseUrl, photo.storage_path)
    const filename = `foto-${photo.guest?.name ?? 'once'}-${photo.id.slice(0, 6)}.jpg`
    await downloadPhoto(url, filename)
    setDownloadingId(null)
  }

  return (
    <>
    <div className="flex justify-end mb-3">
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
    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative aspect-square rounded-sm overflow-hidden group"
          style={{ background: '#1a1a1a' }}
        >
          <Image
            src={getPhotoUrl(supabaseUrl, photo.storage_path)}
            alt={photo.caption || 'Foto del evento'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />

          {/* Guest name + download */}
          <div className="absolute bottom-0 left-0 right-0 p-2 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {photo.guest && (
              <span className="text-[10px] font-sans text-white/70 truncate pr-1">{photo.guest.name}</span>
            )}
            <button
              onClick={() => handleDownload(photo)}
              disabled={downloadingId === photo.id}
              className="flex-shrink-0 p-1.5 rounded-full transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: '#c9a96e' }}
              title="Descargar foto"
            >
              <Download size={11} color="#0a0a0a" />
            </button>
          </div>
        </div>
      ))}
    </div>
    </>
  )
}
