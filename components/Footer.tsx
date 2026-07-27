"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Globe,
  Share2,
  Mail,
  MapPin,
  Heart,
} from "lucide-react";

const footerLinks = {
  Plataforma: [
    { label: "Cómo funciona", href: "#how-it-works" },
    { label: "Beneficios", href: "#features" },
    { label: "Ecosistema", href: "#ecosystem" },
    { label: "Precios", href: "#" },
  ],
  Comercios: [
    { label: "Panel de control", href: "#" },
    { label: "Campañas con IA", href: "#" },
    { label: "Tarjetas de sellos", href: "#" },
    { label: "Reportes", href: "#" },
  ],
  Legal: [
    { label: "Términos de uso", href: "#" },
    { label: "Privacidad", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

const socials = [
  { icon: Globe, href: "#", label: "Web" },
  { icon: Share2, href: "#", label: "Redes" },
  { icon: Mail, href: "mailto:hola@ziesta.ar", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="relative bg-[var(--neutral-900)] text-white overflow-hidden">
      {/* Top accent line */}
      <div className="h-1 w-full" style={{ background: "var(--gradient-primary)" }} />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-2">
            <motion.a
              href="#hero"
              className="inline-flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.03 }}
            >
              <Image
                src="/ziesta-logo.png"
                alt="Ziesta"
                width={36}
                height={36}
                className="drop-shadow-lg"
              />
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Ziesta
              </span>
            </motion.a>
            <p className="text-[var(--neutral-400)] text-sm leading-relaxed max-w-xs mb-6">
              La red de fidelización inteligente que conecta comercios, clientes
              y ciudades en un único ecosistema de beneficios impulsado por IA.
            </p>
            <div className="flex items-center gap-2 text-[var(--neutral-500)] text-sm">
              <MapPin size={14} />
              <span>Santiago del Estero, Argentina</span>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4
                className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--neutral-400)] hover:text-[var(--ziesta-300)] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--neutral-800)] mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-[var(--neutral-500)] flex items-center justify-center sm:justify-start gap-1.5">
              © {new Date().getFullYear()} Ziesta. Hecho con
              <Heart size={14} className="text-[var(--accent-pink)] fill-current" />
              en Santiago del Estero.
            </p>
            <p className="text-xs text-[var(--neutral-600)]">
              Desarrollado y creado por{" "}
              <a 
                href="https://instagram.com/josuezerda" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--ziesta-400)] hover:text-[var(--ziesta-300)] transition-colors font-medium"
              >
                Josué Zerda
              </a>
            </p>
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            {socials.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-xl bg-[var(--neutral-800)] hover:bg-[var(--ziesta-700)] flex items-center justify-center transition-colors"
                aria-label={social.label}
              >
                <social.icon size={18} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
