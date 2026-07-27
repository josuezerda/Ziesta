"use client";

import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Globe,
  Star,
  Zap,
  TrendingUp,
  Check,
  Crown,
  Brain,
  Rocket,
  Target,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Benefit {
  text: string;
  icon: LucideIcon;
}

interface Audience {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  color: string;
  accentBg: string;
  benefits: Benefit[];
  highlight: string;
}

const audiences: Audience[] = [
  {
    id: "clients",
    icon: Users,
    title: "Para Clientes",
    subtitle: "Ganás con cada compra",
    color: "var(--ziesta-500)",
    accentBg: "rgba(139, 70, 255, 0.1)",
    benefits: [
      { text: "Cada compra genera puntos", icon: Star },
      { text: "Tus puntos no vencen", icon: Crown },
      { text: "Usálos en toda la red", icon: Globe },
    ],
    highlight: "Sin costo para el cliente",
  },
  {
    id: "merchants",
    icon: Building2,
    title: "Para Comercios",
    subtitle: "Más clientes, menos esfuerzo",
    color: "var(--accent-cyan)",
    accentBg: "rgba(6, 214, 160, 0.1)",
    benefits: [
      { text: "Pagás una suscripción fija mensual", icon: Target },
      { text: "Configurás tus beneficios", icon: Zap },
      { text: "La IA te ayuda a vender más", icon: Brain },
    ],
    highlight: "ROI desde el primer mes",
  },
  {
    id: "city",
    icon: Globe,
    title: "Para la Ciudad",
    subtitle: "Turismo e impulso local",
    color: "var(--accent-gold)",
    accentBg: "rgba(255, 209, 102, 0.12)",
    benefits: [
      { text: "Turistas reciben puntos al llegar", icon: Rocket },
      { text: "Empresas regalan puntos a empleados", icon: TrendingUp },
      { text: "Municipios impulsan el comercio local", icon: Building2 },
    ],
    highlight: "Economía local activada",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export default function Explainer() {
  return (
    <section id="explainer" className="relative py-28 bg-white overflow-hidden">
      {/* Background decorative orbs */}
      <div
        className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "rgba(139, 70, 255, 0.04)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "rgba(6, 214, 160, 0.04)",
          filter: "blur(100px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="inline-block text-sm font-semibold text-[var(--ziesta-500)] uppercase tracking-widest mb-4">
            La Economía Ziesta
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Beneficios para{" "}
            <span className="text-gradient">todos</span>
          </h2>
          <p className="text-lg text-[var(--neutral-500)] leading-relaxed">
            Un ecosistema donde cada participante gana. Clientes, comercios y
            ciudades crecen juntos con Ziesta.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {audiences.map((audience) => (
            <motion.div
              key={audience.id}
              variants={cardVariants}
              className="glass-card p-8 relative overflow-hidden group flex flex-col"
            >
              {/* Background gradient on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at top, ${audience.accentBg}, transparent 70%)`,
                }}
              />

              <div className="relative z-10 flex flex-col flex-1">
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{
                    background: audience.accentBg,
                    color: audience.color,
                  }}
                >
                  <audience.icon size={30} strokeWidth={1.7} />
                </div>

                {/* Title */}
                <h3
                  className="text-2xl font-bold text-[var(--neutral-900)] mb-1"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {audience.title}
                </h3>
                <p className="text-sm text-[var(--neutral-400)] mb-6">
                  {audience.subtitle}
                </p>

                {/* Benefits */}
                <div className="space-y-4 flex-1">
                  {audience.benefits.map((benefit, j) => (
                    <motion.div
                      key={benefit.text}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: j * 0.1 + 0.3 }}
                      className="flex items-start gap-3"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: audience.accentBg,
                          color: audience.color,
                        }}
                      >
                        <benefit.icon size={16} strokeWidth={2} />
                      </div>
                      <span className="text-[15px] font-medium text-[var(--neutral-600)] leading-snug pt-1">
                        {benefit.text}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom highlight tag */}
                <div className="mt-8 pt-6 border-t border-[rgba(139,70,255,0.06)]">
                  <span
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full"
                    style={{
                      background: audience.accentBg,
                      color: audience.color,
                    }}
                  >
                    <Check size={14} strokeWidth={2.5} />
                    {audience.highlight}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom connector text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--surface-2)] border border-[rgba(139,70,255,0.08)]">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-[rgba(139,70,255,0.15)] flex items-center justify-center">
                <Users size={14} className="text-[var(--ziesta-500)]" />
              </div>
              <div className="w-8 h-8 rounded-full bg-[rgba(6,214,160,0.15)] flex items-center justify-center">
                <Building2 size={14} className="text-[var(--accent-cyan)]" />
              </div>
              <div className="w-8 h-8 rounded-full bg-[rgba(255,209,102,0.2)] flex items-center justify-center">
                <Globe size={14} className="text-[var(--accent-gold)]" />
              </div>
            </div>
            <span className="text-sm font-semibold text-[var(--neutral-600)]">
              Un circuito virtuoso que beneficia a todos
            </span>
            <ArrowRight size={16} className="text-[var(--ziesta-400)]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
