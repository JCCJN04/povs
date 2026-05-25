'use client'

import QRCode from 'react-qr-code'

export default function QRCodeDisplay({ url }: { url: string }) {
  const short = url.replace(/^https?:\/\//, '')

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* QR Card */}
      <div
        className="relative flex flex-col items-center p-5 rounded-2xl w-full max-w-[240px]"
        style={{
          background: 'linear-gradient(145deg, #161610 0%, #1f1a10 100%)',
          border: '1px solid rgba(201,169,110,0.25)',
          boxShadow: '0 0 40px rgba(201,169,110,0.06), 0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Corner accents */}
        <span className="absolute top-3 left-3 w-3 h-3 border-t border-l rounded-tl-sm" style={{ borderColor: 'rgba(201,169,110,0.5)' }} />
        <span className="absolute top-3 right-3 w-3 h-3 border-t border-r rounded-tr-sm" style={{ borderColor: 'rgba(201,169,110,0.5)' }} />
        <span className="absolute bottom-3 left-3 w-3 h-3 border-b border-l rounded-bl-sm" style={{ borderColor: 'rgba(201,169,110,0.5)' }} />
        <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r rounded-br-sm" style={{ borderColor: 'rgba(201,169,110,0.5)' }} />

        {/* Label */}
        <p className="text-[9px] font-mono uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(201,169,110,0.6)' }}>
          Escanea para unirte
        </p>

        {/* QR on white background */}
        <div className="p-3 rounded-xl" style={{ background: '#fff' }}>
          <QRCode value={url} size={160} level="M" />
        </div>

        {/* Povs brand */}
        <p className="mt-4 font-display text-sm tracking-tight" style={{ color: 'rgba(201,169,110,0.7)' }}>
          Povs
        </p>
      </div>

      {/* URL chip */}
      <div
        className="px-3 py-1.5 rounded-full text-[10px] font-mono truncate max-w-[240px] w-full text-center"
        style={{ background: '#111', color: '#555', border: '1px solid #222' }}
      >
        {short}
      </div>
    </div>
  )
}
