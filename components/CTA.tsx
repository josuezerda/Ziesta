"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Store } from "lucide-react";
import Image from "next/image";

export default function CTA() {
  return (
    <section id="cta" className="relative py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[32px] overflow-hidden"
          style={{ background: "var(--gradient-cta)" }}
        >
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

            {/* Floating coins */}
            <motion.div
              className="absolute top-10 right-20 opacity-20"
              animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/ziesta-logo.png"
                alt=""
                width={80}
                height={80}
                className="select-none"
                draggable={false}
              />
            </motion.div>
            <motion.div
              className="absolute bottom-16 left-16 opacity-15"
              animate={{ y: [0, -20, 0], rotate: [0, -10, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <Image
                src="/ziesta-logo.png"
                alt=""
                width={60}
                height={60}
                className="select-none"
                draggable={false}
              />
            </motion.div>
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 py-16 sm:px-16 sm:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2
                className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                ¿Listo para transformar
                <br />
                <span className="text-white/80">tu negocio?</span>
              </h2>
              <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                Unite a la red de fidelización más inteligente de Santiago del
                Estero. Empezá a retener clientes, aumentar ventas y crecer con
                IA.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[var(--ziesta-700)] font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                >
                  <Sparkles size={20} />
                  Soy Cliente
                  <ArrowRight size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white font-bold text-lg rounded-full border-2 border-white/30 hover:border-white/60 transition-colors cursor-pointer"
                >
                  <Store size={20} />
                  Soy Comercio
                </motion.button>
              </div>

              {/* Trust badges */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/50 text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-cyan)]" />
                  Sin costo de activación
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-gold)]" />
                  Setup en 24 horas
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-pink)]" />
                  Soporte dedicado
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
