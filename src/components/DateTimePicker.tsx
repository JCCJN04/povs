'use client'

import { useEffect, useState } from 'react'
import { CaretDown } from '@phosphor-icons/react'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate()
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

interface Props {
  value: string            // ISO string or ''
  onChange: (iso: string) => void
  minDate?: Date
}

export default function DateTimePicker({ value, onChange, minDate }: Props) {
  const now = minDate ?? new Date()
  const currentYear = now.getFullYear()

  const init = value ? new Date(value) : null

  const [day,    setDay]    = useState(init ? init.getDate()            : now.getDate())
  const [month,  setMonth]  = useState(init ? init.getMonth() + 1       : now.getMonth() + 1)
  const [year,   setYear]   = useState(init ? init.getFullYear()        : currentYear)
  const [hour,   setHour]   = useState(init ? init.getHours()           : 23)
  const [minute, setMinute] = useState(init ? Math.floor(init.getMinutes() / 15) * 15 : 59)

  // Keep day valid when month/year changes
  useEffect(() => {
    const max = daysInMonth(month, year)
    if (day > max) setDay(max)
  }, [month, year, day])

  // Emit ISO on any change
  useEffect(() => {
    const max = daysInMonth(month, year)
    const safeDay = Math.min(day, max)
    const iso = `${year}-${pad(month)}-${pad(safeDay)}T${pad(hour)}:${pad(minute)}:00`
    onChange(iso)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, month, year, hour, minute])

  const maxDay = daysInMonth(month, year)
  const years  = Array.from({ length: 3 }, (_, i) => currentYear + i)
  const hours  = Array.from({ length: 24 }, (_, i) => i)
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 59]

  return (
    <div className="space-y-3">
      {/* Date row */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-2">Fecha</p>
        <div className="grid grid-cols-3 gap-2">
          <Select
            label="Día"
            value={day}
            onChange={v => setDay(Number(v))}
            options={Array.from({ length: maxDay }, (_, i) => ({ value: i + 1, label: String(i + 1) }))}
          />
          <Select
            label="Mes"
            value={month}
            onChange={v => setMonth(Number(v))}
            options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))}
          />
          <Select
            label="Año"
            value={year}
            onChange={v => setYear(Number(v))}
            options={years.map(y => ({ value: y, label: String(y) }))}
          />
        </div>
      </div>

      {/* Time row */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground mb-2">Hora</p>
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Hora"
            value={hour}
            onChange={v => setHour(Number(v))}
            options={hours.map(h => ({ value: h, label: `${pad(h)}h` }))}
          />
          <Select
            label="Minuto"
            value={minute}
            onChange={v => setMinute(Number(v))}
            options={minutes.map(m => ({ value: m, label: pad(m) }))}
          />
        </div>
      </div>
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: number
  onChange: (v: string) => void
  options: { value: number; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none font-sans text-sm text-foreground rounded-sm px-3 py-2.5 pr-8 outline-none transition-colors cursor-pointer"
        style={{
          background: '#0d0d0d',
          border: '1px solid rgba(245,240,232,0.1)',
          colorScheme: 'dark',
        }}
        onFocus={e => (e.target.style.borderColor = '#c9a96e')}
        onBlur={e => (e.target.style.borderColor = 'rgba(245,240,232,0.1)')}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <CaretDown
        size={12}
        weight="bold"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}
