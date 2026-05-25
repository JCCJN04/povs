export default function Loading() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9a96e]/20 border-t-[#c9a96e]"></div>
        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Cargando...</p>
      </div>
    </div>
  );
}
