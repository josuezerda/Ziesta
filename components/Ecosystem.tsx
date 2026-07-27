"use client";

import { motion } from "framer-motion";
import {
  Users,
  Store,
  Plane,
  Building2,
  MessageCircle,
  Sparkles,
} from "lucide-react";

const actors = [
  {
    icon: Users,
    label: "Clientes",
    description: "Acumulan puntos, canjean premios, suben de nivel.",
    color: "var(--ziesta-500)",
  },
  {
    icon: Store,
    label: "Comercios",
    description: "Fidelizan, crean campañas, analizan con IA.",
    color: "var(--accent-cyan)",
  },
  {
    icon: Plane,
    label: "Turistas",
    description: "Escanean QR al llegar y acceden a beneficios exclusivos.",
    color: "var(--accent-pink)",
  },
  {
    icon: Building2,
    label: "Empresas",
    description: "Compran puntos como beneficio para sus empleados.",
    color: "var(--accent-gold)",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    description: "Canjes, consultas y acreditaciones por chat.",
    color: "var(--accent-blue)",
  },
  {
    icon: Sparkles,
    label: "IA",
    description: "Cerebro central que optimiza todo el ecosistema.",
    color: "var(--ziesta-700)",
  },
];

export default function Ecosystem() {
  return (
    <section id="ecosystem" className="relative py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="inline-block text-sm font-semibold text-[var(--ziesta-500)] uppercase tracking-widest mb-4">
            Ecosistema completo
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Todos conectados en{" "}
            <span className="text-gradient">una sola red</span>
          </h2>
          <p className="text-lg text-[var(--neutral-500)] leading-relaxed">
            Clientes, comercios, empresas, turistas y municipios. Cada actor
            participa y se beneficia dentro de Ziesta.
          </p>
        </motion.div>

        {/* Ecosystem Visual */}
        <div className="relative">
          {/* Central orbit ring (decorative) */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
            <motion.div
              className="w-full h-full rounded-full border border-dashed border-[rgba(139,70,255,0.12)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Actor Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {actors.map((actor, i) => (
              <motion.div
                key={actor.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="glass-card p-6 sm:p-8 text-center cursor-default"
              >
                {/* Icon */}
                <motion.div
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    background: `${actor.color}12`,
                    color: actor.color,
                  }}
                  whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <actor.icon size={30} strokeWidth={1.6} />
                </motion.div>

                <h3
                  className="text-lg font-bold text-[var(--neutral-900)] mb-2"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {actor.label}
                </h3>
                <p className="text-sm text-[var(--neutral-500)] leading-relaxed">
                  {actor.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
