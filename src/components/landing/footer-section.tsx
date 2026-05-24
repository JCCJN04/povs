"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Producto: [
    { name: "Características", href: "#caracteristicas" },
    { name: "Cómo funciona",   href: "#como-funciona"  },
    { name: "Usos",            href: "#usos"            },
  ],
  Cuenta: [
    { name: "Iniciar sesión",  href: "/auth"            },
    { name: "Crear cuenta",    href: "/auth"            },
    { name: "Mi dashboard",    href: "/dashboard"       },
  ],
  Legal: [
    { name: "Privacidad", href: "#" },
    { name: "Términos",   href: "#" },
  ],
};

export function FooterSection() {
  return (
    <footer className="relative bg-black">
      {/* Banner image */}
      <div className="relative w-full h-[200px] sm:h-[280px] md:h-[360px] overflow-hidden">
        <img
          src="/images/shield.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        {/* Gold glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px]"
          style={{ background: 'radial-gradient(ellipse, rgba(201,169,110,0.06), transparent 70%)' }} />
      </div>

      {/* Footer content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-8">
            {/* Brand */}
            <div className="col-span-2">
              <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <span className="text-2xl font-display text-white">Once</span>
                <span className="text-xs text-white/40 font-mono">™</span>
              </Link>
              <p className="text-white/50 leading-relaxed mb-8 max-w-xs text-sm">
                Álbum privado de fotos para eventos. Los invitados se unen con QR. El álbum se revela al terminar.
              </p>
              <div className="flex gap-6">
                {[].map((link: { name: string; href: string }) => (
                  <a key={link.name} href={link.href}
                    className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1 group">
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-medium text-white mb-6">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href}
                        className="text-sm text-white/40 hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} Once. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 text-sm text-white/30">
            <span className="w-2 h-2 rounded-full" style={{ background: '#c9a96e' }} />
            Todos los sistemas operativos
          </div>
        </div>
      </div>
    </footer>
  );
}
