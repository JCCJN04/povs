'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center bg-background">
      <h2 className="mb-4 text-2xl font-display text-foreground">¡Ups! Algo salió mal.</h2>
      <p className="mb-6 text-sm font-sans text-muted-foreground max-w-md">
        Ha ocurrido un error inesperado. Estamos trabajando para solucionarlo.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-full px-6 py-2.5 text-sm font-sans font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: '#c9a96e', color: '#0a0a0a' }}
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
