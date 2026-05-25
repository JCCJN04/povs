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

import imageCompression from 'browser-image-compression'

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
    if (uploading) return
    setUploading(true)
    setError('')

    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'))
    
    if (fileArray.length === 0) {
      setUploading(false)
      return
    }

    const uploadPromises = fileArray.map(async (file) => {
      // 1. Compress image
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
      const { data: photo, error: insertError } = await supabase
        .from('photos')
        .insert({ event_id: eventId, guest_id: guestId, storage_path: path })
        .select()
        .single()

      if (insertError) throw new Error(insertError.message)

      return {
        id: photo.id,
        url: `${supabaseUrl}/storage/v1/object/public/photos/${path}`,
        name: file.name,
      }
    })

    const results = await Promise.allSettled(uploadPromises)
    const newUploaded = results
      .filter((r): r is PromiseFulfilledResult<UploadedPhoto> => r.status === 'fulfilled')
      .map(r => r.value)

    const fails = results.filter(r => r.status === 'rejected')

    if (fails.length > 0) {
      setError(`No se pudieron subir ${fails.length} foto(s).`)
    }

    if (newUploaded.length > 0) {
      setUploaded(prev => [...prev, ...newUploaded])
    }
    
    setUploading(false)
  }, [uploading, eventId, guestId, supabase, supabaseUrl])

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
