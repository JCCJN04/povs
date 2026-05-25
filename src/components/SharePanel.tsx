'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'
import { Copy, Check, Download } from 'lucide-react'

export default function SharePanel({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const short = url.replace(/^https?:\/\//, '')

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadQR() {
    const svg = document.getElementById('share-qr-svg')
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = 'povs-qr.svg'
    a.click()
    URL.revokeObjectURL(blobUrl)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* QR Card */}
      <div
        className="relative flex flex-col items-center p-7 rounded-3xl"
        style={{
          background: 'linear-gradient(145deg, #161610 0%, #1f1a10 100%)',
          border: '1px solid rgba(201,169,110,0.3)',
          boxShadow: '0 0 60px rgba(201,169,110,0.08), 0 16px 48px rgba(0,0,0,0.5)',
        }}
      >
        {/* Corner accents */}
        <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 rounded-tl" style={{ borderColor: 'rgba(201,169,110,0.6)' }} />
        <span className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 rounded-tr" style={{ borderColor: 'rgba(201,169,110,0.6)' }} />
        <span className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 rounded-bl" style={{ borderColor: 'rgba(201,169,110,0.6)' }} />
        <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 rounded-br" style={{ borderColor: 'rgba(201,169,110,0.6)' }} />

        {/* Label */}
        <p className="text-[9px] font-mono uppercase tracking-[0.25em] mb-6" style={{ color: 'rgba(201,169,110,0.5)' }}>
          Escanea para unirte
        </p>

        {/* QR */}
        <div className="p-4 rounded-2xl" style={{ background: '#fff' }}>
          <QRCode id="share-qr-svg" value={url} size={200} level="M" />
        </div>

        {/* Brand */}
        <div className="mt-5 flex items-center gap-2">
          <span className="font-display text-base tracking-tight" style={{ color: 'rgba(201,169,110,0.8)' }}>
            Povs
          </span>
          <span className="font-mono text-[9px]" style={{ color: 'rgba(201,169,110,0.3)' }}>™</span>
        </div>
      </div>

      {/* URL row */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <div
          className="flex-1 px-3 py-2 rounded-full text-[11px] font-mono text-muted-foreground truncate"
          style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}
        >
          {short}
        </div>
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-sans font-semibold rounded-full transition-all hover:opacity-90 flex-shrink-0"
          style={{
            background: copied ? '#0a1a0a' : '#1a1a1a',
            color: copied ? '#86efac' : '#c9a96e',
            border: `1px solid ${copied ? '#1a3a1a' : 'rgba(201,169,110,0.2)'}`,
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
        <button
          onClick={downloadQR}
          title="Descargar QR"
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:opacity-90 flex-shrink-0"
          style={{ background: '#1a1a1a', color: '#555', border: '1px solid #2a2a2a' }}
        >
          <Download size={12} />
        </button>
      </div>
    </div>
  )
}
