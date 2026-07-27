'use client';

import { motion } from 'framer-motion';
import { Rocket, Target, MapPin, Zap, Star, Shield, Coins, Gift, ChevronRight, Check } from 'lucide-react';
import React from 'react';

const roadmapData = [
  {
    id: 1,
    phase: 'Fase 1',
    date: 'Q1 2026',
    title: 'Lanzamiento',
    status: 'active',
    icon: Rocket,
    color: 'var(--accent-cyan)',
    items: [
      'Red Ziesta activa con primeros 100 comercios',
      'Sistema de puntos con precisión decimal ($1.000 = 1 punto)',
      'Carnet Digital con QR rotativo',
      'Bot de WhatsApp integrado',
    ],
  },
  {
    id: 2,
    phase: 'Fase 2',
    date: 'Q2-Q3 2026',
    title: 'Crecimiento',
    status: 'upcoming',
    icon: Target,
    color: 'var(--ziesta-500)',
    items: [
      'Ziesta IA — Asistente inteligente para comercios',
      'Tarjetas de sellos digitales',
      'Sistema de gamificación e insignias',
      'Campañas masivas de marketing',
    ],
  },
  {
    id: 3,
    phase: 'Fase 3',
    date: 'Q4 2026',
    title: 'Expansión',
    status: 'upcoming',
    icon: MapPin,
    color: 'var(--accent-pink)',
    items: [
      'Integración turística provincial',
      'Alianzas corporativas',
      'Geolocalización de comercios',
      'App móvil nativa',
    ],
  },
  {
    id: 4,
    phase: 'Fase 4',
    date: '2028',
    title: 'Blockchain & Web3',
    status: 'upcoming',
    icon: Shield,
    color: 'var(--accent-gold)',
    items: [
      'Lanzamiento de la blockchain propia de Ziesta',
      'Exportación de puntos a redes públicas (Polygon)',
      'Token Ziesta descentralizado e inmutable',
      'Smart contracts para transacciones públicas',
    ],
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[var(--ziesta-500)]/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[var(--accent-cyan)]/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--ziesta-500)]/10 text-[var(--ziesta-500)] border border-[var(--ziesta-500)]/20 mb-6 font-medium text-sm"
          >
            <Zap className="w-4 h-4" />
            <span>Nuestra Visión</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            El Futuro de <span className="text-gradient">Ziesta</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[var(--neutral-500)] max-w-2xl mx-auto text-lg"
          >
            Nuestro plan de acción para revolucionar el comercio local y la fidelización de clientes.
          </motion.p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Center Timeline Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--ziesta-500)]/30 to-transparent -translate-x-1/2 z-0" />

          <div className="space-y-16 md:space-y-24">
            {roadmapData.map((item, index) => {
              const isEven = index % 2 === 0;
              const Icon = item.icon;
              const isActive = item.status === 'active';

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`relative flex flex-col md:flex-row items-center ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Dot (Desktop) */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-black bg-[var(--neutral-900)] items-center justify-center z-20">
                    <div 
                      className={`w-4 h-4 rounded-full ${isActive ? 'animate-pulse' : ''}`}
                      style={{ backgroundColor: item.color, boxShadow: isActive ? `0 0 20px ${item.color}` : 'none' }}
                    />
                  </div>

                  {/* Empty space for alignment */}
                  <div className="hidden md:block w-1/2" />

                  {/* Card Content */}
                  <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-16 lg:pr-24' : 'md:pl-16 lg:pl-24'}`}>
                    <div 
                      className={`glass-card rounded-3xl p-8 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                        isActive ? 'ring-1 ring-[var(--ziesta-500)]/20' : 'border border-[var(--neutral-800)]/5 hover:border-[var(--neutral-800)]/10'
                      }`}
                      style={{
                        boxShadow: isActive ? `0 0 40px -10px ${item.color}40` : 'none',
                      }}
                    >
                      {/* Subtle gradient border effect */}
                      <div 
                        className="absolute top-0 left-0 w-full h-1"
                        style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }}
                      />

                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-3 rounded-xl bg-white/5"
                            style={{ color: item.color }}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-[var(--neutral-500)]">{item.phase}</span>
                            <h3 className="text-2xl font-bold text-[var(--neutral-900)]">{item.title}</h3>
                          </div>
                        </div>
                        <div 
                          className="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap"
                          style={{ 
                            backgroundColor: `${item.color}15`,
                            color: item.color,
                            border: `1px solid ${item.color}30`
                          }}
                        >
                          {item.date}
                        </div>
                      </div>

                      <ul className="space-y-4">
                        {item.items.map((bullet, idx) => (
                          <motion.li 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + (idx * 0.1) }}
                            className="flex items-start gap-3"
                          >
                            <Check 
                              className="w-5 h-5 shrink-0 mt-0.5" 
                              style={{ color: item.color }}
                            />
                            <span className="text-[var(--neutral-400)] leading-relaxed">{bullet}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Special Phase 5 Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-2xl mx-auto mt-24 z-10"
            >
               <div className="hidden md:flex absolute left-1/2 -top-12 -translate-x-1/2 w-8 h-8 rounded-full items-center justify-center z-20">
                    <div className="w-2 h-2 rounded-full bg-[var(--neutral-500)] animate-pulse" />
                </div>
              <div className="glass-card rounded-3xl p-10 text-center relative overflow-hidden group">
                {/* Mystical background effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent blur-xl" />

                <div className="relative z-10 flex flex-col items-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="mb-6 relative"
                  >
                    <div className="absolute inset-0 bg-[var(--ziesta-500)]/20 blur-xl rounded-full" />
                    <Star className="w-12 h-12 text-[var(--ziesta-500)] relative z-10" />
                  </motion.div>

                  <h3 
                    className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-400"
                    style={{ fontFamily: 'var(--font-outfit)' }}
                  >
                    Fase 5: El Futuro (2029-2030)
                  </h3>
                  
                  <p className="text-lg text-[var(--neutral-400)] max-w-md mx-auto leading-relaxed mb-8">
                    Próximamente se anunciará el roadmap de esta etapa. Estamos construyendo algo grande...
                  </p>

                  <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--ziesta-500)]/5 hover:bg-[var(--ziesta-500)]/10 border border-[var(--ziesta-500)]/20 transition-colors text-[var(--ziesta-600)] hover:text-[var(--ziesta-700)] font-medium group">
                    <span>Mantente atento</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
