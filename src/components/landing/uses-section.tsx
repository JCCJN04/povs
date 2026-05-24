"use client";

import { useEffect, useRef, useState } from "react";

const uses = [
  { emoji: "💍", label: "Bodas",       desc: "El álbum de boda visto desde los ojos de todos tus invitados." },
  { emoji: "🎂", label: "Cumpleaños",  desc: "Momentos únicos capturados por quienes te conocen mejor." },
  { emoji: "✈️", label: "Viajes",      desc: "Cada integrante del grupo captura lo que más le importa." },
  { emoji: "🎉", label: "Fiestas",     desc: "Revive la noche completa desde múltiples perspectivas." },
  { emoji: "📷", label: "Cotidiano",   desc: "Cualquier momento que merezca ser recordado junto a otros." },
];

export function UsesSection() {
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
    <section id="usos" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-16 lg:mb-20">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-12 h-px bg-foreground/30" />
              Ocasiones
            </span>
            <h2
              className={`text-3xl sm:text-5xl md:text-6xl lg:text-[80px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              La vida sucede
              <br />
              <span className="text-muted-foreground">una sola vez.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p
              className={`text-lg text-muted-foreground leading-relaxed transition-all duration-1000 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Povs funciona para cualquier evento donde quieras que todos compartan sus perspectivas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {uses.map((use, idx) => (
            <div
              key={use.label}
              className={`group relative border border-foreground/10 p-6 lg:p-8 transition-all duration-700 hover:border-foreground/30 cursor-default ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <div className="text-3xl mb-4">{use.emoji}</div>
              <h3 className="font-display text-xl mb-3 group-hover:translate-x-1 transition-transform duration-300">{use.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{use.desc}</p>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-foreground/0 group-hover:bg-[#c9a96e]/30 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
