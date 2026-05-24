"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    number: "01",
    title: "Completamente privado",
    description: "Las fotos solo se ven cuando el evento termina y el álbum se revela. Nada es público antes de ese momento.",
    stats: { value: "100%", label: "privado durante el evento" },
  },
  {
    number: "02",
    title: "Sin registro para invitados",
    description: "Tus invitados escanean el QR, escriben su nombre y empiezan a subir fotos al instante. Sin app, sin cuenta.",
    stats: { value: "0", label: "apps para descargar" },
  },
  {
    number: "03",
    title: "Se revela al terminar",
    description: "Cuando el evento acaba, el álbum aparece completo con las fotos de todos. Como revelar un rollo fotográfico.",
    stats: { value: "Auto", label: "revelado automático" },
  },
  {
    number: "04",
    title: "Múltiples perspectivas",
    description: "Cada invitado captura momentos únicos. El álbum final reúne todas las perspectivas en un solo lugar.",
    stats: { value: "∞", label: "puntos de vista" },
  },
];

function ParticleVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    const COUNT = 60;
    const particles = Array.from({ length: COUNT }, (_, i) => {
      const seed = i * 1.618;
      return {
        bx: (seed * 127.1) % 1,
        by: (seed * 311.7) % 1,
        phase: seed * Math.PI * 2,
        speed: 0.4 + (seed % 0.4),
        radius: 1.0 + (seed % 2.0),
      };
    });

    let time = 0;
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p) => {
        const flowX = Math.sin(time * p.speed * 0.4 + p.phase) * 38;
        const flowY = Math.cos(time * p.speed * 0.3 + p.phase * 0.7) * 24;
        const bx = p.bx * w;
        const by = p.by * h;
        const dx = p.bx - mx;
        const dy = p.by - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist * 2.8);
        const x = bx + flowX + influence * Math.cos(time + p.phase) * 36;
        const y = by + flowY + influence * Math.sin(time + p.phase) * 36;
        const pulse = Math.sin(time * p.speed + p.phase) * 0.5 + 0.5;
        const alpha = 0.06 + pulse * 0.14 + influence * 0.25;

        ctx.beginPath();
        ctx.arc(x, y, p.radius + pulse * 0.8, 0, Math.PI * 2);
        // Gold-tinted particles
        ctx.fillStyle = `rgba(201, 169, 110, ${alpha})`;
        ctx.fill();
      });

      time += 0.016;
      frameRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="caracteristicas" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="relative mb-24 lg:mb-32">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
                <span className="w-12 h-px bg-foreground/30" />
                Características
              </span>
              <h2
                className={`text-4xl sm:text-5xl md:text-6xl lg:text-[100px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                Diseñado
                <br />
                <span className="text-muted-foreground">para el momento.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-4">
              <p
                className={`text-base sm:text-xl text-muted-foreground leading-relaxed transition-all duration-1000 delay-200 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                Un álbum colaborativo donde todos contribuyen y nadie ve las fotos hasta que el evento termina. La sorpresa lo hace especial.
              </p>
            </div>
          </div>
        </div>

        {/* Feature cards grid */}
        <div className="grid lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Large feature card */}
          <div
            className={`lg:col-span-12 relative bg-black border border-foreground/10 min-h-[280px] sm:min-h-[400px] overflow-hidden group transition-all duration-700 flex ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="relative flex-1 p-6 sm:p-8 lg:p-12 bg-black">
              <ParticleVisualization />
              <div className="relative z-10">
                <span className="font-mono text-sm text-muted-foreground">{features[0].number}</span>
                <h3 className="text-3xl lg:text-4xl font-display mt-4 mb-6 group-hover:translate-x-2 transition-transform duration-500">
                  {features[0].title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md mb-8">
                  {features[0].description}
                </p>
                <div>
                  <span className="text-5xl lg:text-6xl font-display" style={{ color: '#c9a96e' }}>{features[0].stats.value}</span>
                  <span className="block text-sm text-muted-foreground font-mono mt-2">{features[0].stats.label}</span>
                </div>
              </div>
            </div>

            {/* Right image */}
            <div className="hidden lg:block relative w-[42%] shrink-0 overflow-hidden">
              <img
                src="/images/isolated.jpg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
            </div>
          </div>

          {/* 3 smaller cards */}
          {features.slice(1).map((feature, idx) => (
            <div
              key={feature.number}
              className={`lg:col-span-4 relative bg-black border border-foreground/10 p-6 sm:p-8 lg:p-10 overflow-hidden group transition-all duration-700 hover:border-foreground/30 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${(idx + 1) * 100}ms` }}
            >
              <span className="font-mono text-sm text-muted-foreground">{feature.number}</span>
              <h3 className="text-2xl font-display mt-4 mb-4 group-hover:translate-x-1 transition-transform duration-500">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-8 text-sm">
                {feature.description}
              </p>
              <div>
                <span className="text-4xl font-display" style={{ color: '#c9a96e' }}>{feature.stats.value}</span>
                <span className="block text-xs text-muted-foreground font-mono mt-2">{feature.stats.label}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
