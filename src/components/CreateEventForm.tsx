'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/lib/utils'
import { EventType } from '@/lib/types'
import { Heart, Cake, Compass, Confetti, Camera } from '@phosphor-icons/react'
import DateTimePicker from '@/components/DateTimePicker'

const EVENT_TYPES: { value: EventType; label: string; icon: React.ReactNode }[] = [
  { value: 'wedding',  label: 'Boda',       icon: <Heart     size={22} weight="thin" /> },
  { value: 'birthday', label: 'Cumpleaños', icon: <Cake      size={22} weight="thin" /> },
  { value: 'trip',     label: 'Viaje',      icon: <Compass   size={22} weight="thin" /> },
  { value: 'party',    label: 'Fiesta',     icon: <Confetti  size={22} weight="thin" /> },
  { value: 'other',    label: 'Otro',       icon: <Camera    size={22} weight="thin" /> },
]

const DURATION_PRESETS = [
  { value: '2h',     label: '2 horas',   ms: 2 * 60 * 60 * 1000 },
  { value: '6h',     label: '6 horas',   ms: 6 * 60 * 60 * 1000 },
  { value: '24h',    label: '1 día',     ms: 24 * 60 * 60 * 1000 },
  { value: '3d',     label: '3 días',    ms: 3 * 24 * 60 * 60 * 1000 },
  { value: '7d',     label: '1 semana',  ms: 7 * 24 * 60 * 60 * 1000 },
  { value: 'custom', label: 'Otra…',     ms: 0 },
]

export default function CreateEventForm({ userId }: { userId: string }) {
  const [name, setName] = useState('')
  const [eventType, setEventType] = useState<EventType>('party')
  const [description, setDescription] = useState('')
  const [durationPreset, setDurationPreset] = useState('24h')
  const [customEndsAt, setCustomEndsAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function getEndsAt(): string {
    if (durationPreset === 'custom') {
      return customEndsAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
    const preset = DURATION_PRESETS.find(p => p.value === durationPreset)!
    return new Date(Date.now() + preset.ms).toISOString()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const slug = generateSlug(name)

    const { data, error: err } = await supabase
      .from('events')
      .insert({
        host_id: userId,
        name,
        event_type: eventType,
        slug,
        description: description || null,
        ends_at: getEndsAt(),
        status: 'active',
      })
      .select()
      .single()

    if (err) {
      setError('Error al crear el evento. Inténtalo de nuevo.')
      setLoading(false)
      return
    }

    router.push(`/dashboard/event/${data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">

      {/* Nombre */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-3">
          Nombre del evento
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-transparent border-0 border-b px-0 py-2.5 text-sm font-sans text-foreground outline-none transition-colors duration-300 placeholder:text-foreground/20"
          style={{ borderColor: 'rgba(245,240,232,0.12)' }}
          onFocus={e => e.target.style.borderColor = '#c9a96e'}
          onBlur={e => e.target.style.borderColor = 'rgba(245,240,232,0.12)'}
          placeholder="Boda de Sofía y Marco"
        />
      </div>

      {/* Tipo */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-3">
          Tipo de evento
        </label>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setEventType(value)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-sans transition-all"
              style={{
                background: eventType === value ? '#1f1a10' : 'transparent',
                border: `1px solid ${eventType === value ? '#c9a96e' : 'rgba(245,240,232,0.1)'}`,
                color: eventType === value ? '#c9a96e' : '#555',
              }}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-3">
          Descripción <span className="normal-case tracking-normal">(opcional)</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          className="w-full bg-transparent border-0 border-b px-0 py-2.5 text-sm font-sans text-foreground outline-none resize-none transition-colors duration-300 placeholder:text-foreground/20"
          style={{ borderColor: 'rgba(245,240,232,0.12)' }}
          onFocus={e => e.target.style.borderColor = '#c9a96e'}
          onBlur={e => e.target.style.borderColor = 'rgba(245,240,232,0.12)'}
          placeholder="Unas palabras sobre el evento..."
        />
      </div>

      {/* Duración */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-3">
          El álbum cierra en
        </label>

        <div className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setDurationPreset(value)}
              className="px-4 py-2 rounded-full text-sm font-sans transition-all"
              style={{
                background: durationPreset === value ? '#1f1a10' : 'transparent',
                border: `1px solid ${durationPreset === value ? '#c9a96e' : 'rgba(245,240,232,0.1)'}`,
                color: durationPreset === value ? '#c9a96e' : '#555',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Custom date picker — solo aparece si eligió "Otra…" */}
        {durationPreset === 'custom' && (
          <div className="mt-5">
            <DateTimePicker
              value={customEndsAt}
              onChange={setCustomEndsAt}
              minDate={new Date()}
            />
          </div>
        )}

        {/* Preview de cuándo cierra */}
        {durationPreset !== 'custom' && (
          <p className="text-xs font-sans text-muted-foreground mt-3">
            Cierra el{' '}
            <span className="text-foreground">
              {new Date(Date.now() + (DURATION_PRESETS.find(p => p.value === durationPreset)?.ms ?? 0))
                .toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </span>
          </p>
        )}
      </div>

      {error && (
        <p className="text-xs font-sans py-3 px-4 rounded-sm"
          style={{ background: '#1a0808', color: '#f87171', border: '1px solid #3a1010' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !name || (durationPreset === 'custom' && !customEndsAt)}
        className="w-full py-4 text-sm font-sans font-semibold rounded-full transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
        style={{ background: '#c9a96e', color: '#0a0a0a' }}
      >
        {loading ? 'Creando...' : 'Crear evento'}
      </button>

    </form>
  )
}
