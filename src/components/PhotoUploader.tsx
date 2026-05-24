'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, CheckCircle } from 'lucide-react'
import Image from 'next/image'

interface UploadedPhoto {
  id: string
  url: string
  name: string
}

export default function PhotoUploader({ eventId, guestId, slug, token }: {
  eventId: string
  guestId: string
  slug: string
  token: string
}) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState<UploadedPhoto[]>([])
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const supabase = createClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  const uploadFiles = useCallback(async (files: FileList) => {
    setUploading(true)
    setError('')

    const newUploaded: UploadedPhoto[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue

      const ext = file.name.split('.').pop()
      const path = `${eventId}/${guestId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setError(`No se pudo subir ${file.name}. Inténtalo de nuevo.`)
        continue
      }

      const { data: photo } = await supabase
        .from('photos')
        .insert({ event_id: eventId, guest_id: guestId, storage_path: path })
        .select()
        .single()

      if (photo) {
        newUploaded.push({
          id: photo.id,
          url: `${supabaseUrl}/storage/v1/object/public/photos/${path}`,
          name: file.name,
        })
      }
    }

    setUploaded(prev => [...prev, ...newUploaded])
    setUploading(false)
  }, [eventId, guestId, supabase, supabaseUrl])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) uploadFiles(e.target.files)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
  }

  return (
    <div>
      {/* Drop zone */}
      <label
        className="block w-full cursor-pointer rounded-sm transition-all"
        style={{
          border: `2px dashed ${dragOver ? '#c9a96e' : '#2a2a2a'}`,
          background: dragOver ? '#1a1500' : '#111',
          padding: '3rem 2rem',
          textAlign: 'center',
        }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <Upload size={32} className="mx-auto mb-4" style={{ color: dragOver ? '#c9a96e' : '#333' }} />
        <p className="text-sm font-sans text-muted-foreground mb-1">
          {uploading ? 'Subiendo...' : 'Toca para seleccionar fotos'}
        </p>
        <p className="text-xs font-sans" style={{ color: '#444' }}>o arrastra y suelta · JPG, PNG, HEIC</p>
      </label>

      {error && <p className="text-sm font-sans mt-3" style={{ color: '#e88' }}>{error}</p>}

      {/* Preview de fotos subidas */}
      {uploaded.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={16} style={{ color: '#4ade80' }} />
            <p className="text-sm font-sans" style={{ color: '#4ade80' }}>
              {uploaded.length} foto{uploaded.length > 1 ? 's' : ''} subida{uploaded.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {uploaded.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-sm overflow-hidden" style={{ background: '#1a1a1a' }}>
                <Image src={photo.url} alt={photo.name} fill className="object-cover" />
              </div>
            ))}
          </div>
          <p className="text-xs font-sans mt-4 text-center text-muted-foreground">
            Tus fotos están guardadas. Se revelarán cuando termine el evento.
          </p>
        </div>
      )}
    </div>
  )
}
