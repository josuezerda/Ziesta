"use client";

import { motion } from "framer-motion";
import {
  ShoppingBag,
  Coins,
  Gift,
  ArrowRight,
  Check,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ShoppingBag,
    title: "Comprá como siempre",
    description:
      "Hacé tus compras en cualquier comercio adherido a la red Ziesta. Cada peso que gastás genera Puntos Ziesta automáticamente.",
    color: "var(--ziesta-500)",
    detail: "1 punto cada $1.000",
  },
  {
    number: "02",
    icon: Coins,
    title: "Acumulá puntos",
    description:
      "Tus puntos se suman en tu cuenta personal. Además, completá tarjetas de sellos en tus comercios favoritos para premios directos.",
    color: "var(--accent-cyan)",
    detail: "En toda la red",
  },
  {
    number: "03",
    icon: Gift,
    title: "Canjealos donde quieras",
    description:
      "Usá tus Puntos Ziesta en cualquier comercio de la red: desde un café gratis hasta un descuento en ropa. Vos elegís.",
    color: "var(--accent-gold)",
    detail: "Sin vencimiento",
  },
];

const stampCardBenefits = [
  "Heladería: 10 helados = 1 gratis",
  "Café: 8 cafés = 1 gratis",
  "Barbería: 5 cortes = 1 gratis",
  "Ropa: 3 compras = 20% off",
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-28"
      style={{ background: "var(--surface-2)" }}
    >
      {/* Top divider */}
      <div className="section-divider absolute top-0" style={{ left: "10%", right: "10%" }} />

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
            Así de simple
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            ¿Cómo <span className="text-gradient">funciona</span>?
          </h2>
          <p className="text-lg text-[var(--neutral-500)] leading-relaxed">
            Tres pasos. Sin complicaciones. Empezá a ganar desde tu primera
            compra.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full z-0">
                  <div className="h-px bg-gradient-to-r from-[rgba(139,70,255,0.2)] to-transparent mx-8 mt-0.5" />
                  <ArrowRight
                    size={16}
                    className="absolute -right-4 -top-2 text-[var(--ziesta-300)]"
                  />
                </div>
              )}

              <div className="glass-card p-8 text-center relative z-10">
                {/* Number badge */}
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full text-white text-sm font-bold mb-6"
                  style={{ background: step.color }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: `${step.color}12`,
                    color: step.color,
                  }}
                >
                  <step.icon size={32} strokeWidth={1.6} />
                </div>

                {/* Text */}
                <h3
                  className="text-xl font-bold mb-3 text-[var(--neutral-900)]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {step.title}
                </h3>
                <p className="text-[var(--neutral-500)] leading-relaxed text-[15px] mb-4">
                  {step.description}
                </p>

                {/* Detail tag */}
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    background: `${step.color}12`,
                    color: step.color,
                  }}
                >
                  <Check size={12} />
                  {step.detail}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stamp Card Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto"
        >
          <div className="glass-card p-8 sm:p-10 overflow-hidden relative">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[rgba(139,70,255,0.04)] blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[rgba(139,70,255,0.1)] flex items-center justify-center shrink-0">
                  <Gift
                    size={24}
                    className="text-[var(--ziesta-500)]"
                  />
                </div>
                <div>
                  <h3
                    className="text-2xl font-bold text-[var(--neutral-900)] mb-1"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    Tarjetas de Sellos Virtuales
                  </h3>
                  <p className="text-[var(--neutral-500)]">
                    Cada comercio configura su propia tarjeta. ¡Completala y
                    llevate el premio!
                  </p>
                </div>
              </div>

              {/* Stamp card visual */}
              <div className="grid sm:grid-cols-2 gap-4">
                {stampCardBenefits.map((benefit, i) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl bg-white border border-[rgba(139,70,255,0.06)] hover:border-[rgba(139,70,255,0.15)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--ziesta-500)] flex items-center justify-center shrink-0">
                      <Check size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-[var(--neutral-700)]">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
