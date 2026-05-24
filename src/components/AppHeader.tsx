import Link from 'next/link'
import { ReactNode } from 'react'

export default function AppHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-foreground/10">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1">
          <span className="font-display text-xl tracking-tight text-foreground">Povs</span>
          <span className="font-mono text-[10px] mt-0.5 text-muted-foreground">™</span>
        </Link>
        {right && (
          <div className="flex items-center gap-4">
            {right}
          </div>
        )}
      </div>
    </header>
  )
}
