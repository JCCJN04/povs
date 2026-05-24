'use client'

import QRCode from 'react-qr-code'

export default function QRCodeDisplay({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-3 rounded-sm" style={{ background: '#fff' }}>
        <QRCode value={url} size={120} />
      </div>
      <p className="text-xs text-center break-all" style={{ color: '#444', fontFamily: 'sans-serif' }}>{url}</p>
    </div>
  )
}
