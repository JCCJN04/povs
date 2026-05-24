'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Revisa tu correo para confirmar tu cuenta.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Correo o contraseña incorrectos.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 bg-background text-foreground overflow-hidden">
      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
        {[...Array(8)].map((_, i) => (
          <div key={`h-${i}`} className="absolute h-px bg-foreground"
            style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }} />
        ))}
        {[...Array(12)].map((_, i) => (
          <div key={`v-${i}`} className="absolute w-px bg-foreground"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }} />
        ))}
      </div>

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(201,169,110,0.04) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-1 mb-14">
          <span className="font-display text-3xl tracking-tight text-foreground">Povs</span>
          <span className="font-mono text-xs mt-1.5 text-muted-foreground">™</span>
        </Link>

        {/* Heading — changes with mode */}
        <div className="mb-10">
          <h1 className="font-display text-2xl text-foreground">
            {mode === 'login' ? 'Bienvenido de nuevo.' : 'Crea tu cuenta.'}
          </h1>
          <p className="text-sm font-sans text-muted-foreground mt-2">
            {mode === 'login'
              ? 'Accede a tus eventos y álbumes.'
              : 'Empieza a crear álbumes privados gratis.'}
          </p>
        </div>

        {/* Form — no card, editorial feel */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-3">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border-0 border-b px-0 py-2.5 text-sm font-sans text-foreground outline-none transition-colors duration-300 placeholder:text-foreground/20"
              style={{ borderColor: 'rgba(245,240,232,0.12)' }}
              onFocus={e => e.target.style.borderColor = '#c9a96e'}
              onBlur={e => e.target.style.borderColor = 'rgba(245,240,232,0.12)'}
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-3">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border-0 border-b px-0 py-2.5 text-sm font-sans text-foreground outline-none transition-colors duration-300 placeholder:text-foreground/20"
              style={{ borderColor: 'rgba(245,240,232,0.12)' }}
              onFocus={e => e.target.style.borderColor = '#c9a96e'}
              onBlur={e => e.target.style.borderColor = 'rgba(245,240,232,0.12)'}
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-xs font-sans py-3 px-4 rounded-sm"
              style={{ background: '#1a0808', color: '#f87171', border: '1px solid #3a1010' }}>
              {error}
            </p>
          )}
          {message && (
            <p className="text-xs font-sans py-3 px-4 rounded-sm"
              style={{ background: '#081a0a', color: '#86efac', border: '1px solid #103a14' }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-1 text-sm font-sans font-semibold rounded-full transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
            style={{ background: '#c9a96e', color: '#0a0a0a' }}
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        {/* Mode toggle */}
        <p className="text-center text-xs font-sans text-muted-foreground mt-10">
          {mode === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => { setMode('signup'); setError(''); setMessage('') }}
                className="text-foreground underline underline-offset-4 hover:text-[#c9a96e] transition-colors"
              >
                Regístrate gratis
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); setMessage('') }}
                className="text-foreground underline underline-offset-4 hover:text-[#c9a96e] transition-colors"
              >
                Inicia sesión
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  )
}
