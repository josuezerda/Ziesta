"use client";

import { motion } from "framer-motion";
import { Clock, Zap, ArrowRight } from "lucide-react";

export default function Programas() {
  return (
    <section id="programas" className="py-24 relative overflow-hidden">
      {/* BG decoration */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 80%, rgba(139,70,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6,214,160,0.06) 0%, transparent 50%)",
        }}
      />

      <div className="max-w-4xl mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: "rgba(139,70,255,0.06)",
              border: "1px solid rgba(139,70,255,0.12)",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Clock size={14} style={{ color: "var(--ziesta-500)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--ziesta-600)" }}
            >
              Próximamente
            </span>
          </motion.div>

          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: "var(--font-outfit)",
              color: "var(--neutral-900)",
            }}
          >
            Programas y{" "}
            <span className="text-gradient">Actividades</span>
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto mb-12"
            style={{ color: "var(--neutral-500)" }}
          >
            Estamos trabajando en nuevas integraciones y programas que llevarán
            la experiencia Ziesta a otro nivel.
          </p>
        </motion.div>

        {/* En Desarrollo Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative"
        >
          <div
            className="glass-card p-10 md:p-14 text-center relative overflow-hidden"
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
              <motion.div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 50% 50%, var(--ziesta-500) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
                animate={{
                  backgroundPosition: ["0px 0px", "32px 32px"],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>

            {/* Pulsing icon */}
            <motion.div
              className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-8 relative"
              style={{
                background: "rgba(139,70,255,0.08)",
                border: "1px solid rgba(139,70,255,0.15)",
              }}
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(139,70,255,0.0)",
                  "0 0 0 20px rgba(139,70,255,0.0)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Zap size={36} style={{ color: "var(--ziesta-500)" }} />
              </motion.div>

              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{ border: "2px solid rgba(139,70,255,0.2)" }}
                animate={{
                  scale: [1, 1.4],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            </motion.div>

            <h3
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{
                fontFamily: "var(--font-outfit)",
                color: "var(--neutral-800)",
              }}
            >
              En Desarrollo
            </h3>

            <p
              className="text-base md:text-lg mb-6 max-w-md mx-auto leading-relaxed"
              style={{ color: "var(--neutral-500)" }}
            >
              Estamos creando programas innovadores que van a transformar la
              forma en que interactúan los comercios, municipios y la comunidad.
            </p>

            {/* Animated dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: "var(--ziesta-400)" }}
                  animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            <a
              href="#cta"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:gap-3"
              style={{
                background: "rgba(139,70,255,0.08)",
                color: "var(--ziesta-600)",
                border: "1px solid rgba(139,70,255,0.15)",
              }}
            >
              Quiero ser parte cuando se lance
              <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
