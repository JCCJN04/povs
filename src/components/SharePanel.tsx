'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'
import { Copy, Check } from 'lucide-react'

export default function SharePanel({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center">
      {/* QR */}
      <div className="p-5 rounded-sm mb-6" style={{ background: '#fff' }}>
        <QRCode value={url} size={200} />
      </div>

      {/* URL + copy */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <div
          className="flex-1 px-3 py-2 rounded-sm text-xs font-mono text-muted-foreground truncate"
          style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}
        >
          {url.replace(/^https?:\/\//, '')}
        </div>
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-sans font-semibold rounded-sm transition-all hover:opacity-90 flex-shrink-0"
          style={{ background: copied ? '#0a1a0a' : '#1a1a1a', color: copied ? '#86efac' : '#c9a96e', border: `1px solid ${copied ? '#1a3a1a' : 'rgba(201,169,110,0.2)'}` }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
