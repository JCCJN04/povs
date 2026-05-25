import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center bg-background">
      <h2 className="mb-2 text-6xl font-display text-foreground">404</h2>
      <h3 className="mb-4 text-xl font-sans font-medium text-foreground">Página no encontrada</h3>
      <p className="mb-8 text-sm font-sans text-muted-foreground max-w-md">
        Lo sentimos, no pudimos encontrar la página que buscas.
      </p>
      <Link
        href="/"
        className="rounded-full px-6 py-2.5 text-sm font-sans font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: '#c9a96e', color: '#0a0a0a' }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
