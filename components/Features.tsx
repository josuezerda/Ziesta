"use client";

import { motion } from "framer-motion";
import {
  Brain,
  QrCode,
  MapPin,
  Trophy,
  Store,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Ziesta IA",
    description:
      "Tu asistente inteligente. El comercio pregunta y la IA responde: campañas automáticas, clientes inactivos, pronósticos de venta.",
    accent: "var(--ziesta-500)",
    gradient: "from-purple-500/10 to-violet-500/5",
  },
  {
    icon: QrCode,
    title: "QR & Token Rotativo",
    description:
      "Cada transacción se valida con un token rotativo único. Sin fraudes, sin estafas. Seguridad de nivel bancario para cada canje.",
    accent: "var(--accent-cyan)",
    gradient: "from-emerald-500/10 to-teal-500/5",
  },
  {
    icon: MapPin,
    title: "Geolocalización",
    description:
      "Descubrí promociones y comercios cerca tuyo en tiempo real. Ideal para turistas y locales que quieren aprovechar cada punto.",
    accent: "var(--accent-pink)",
    gradient: "from-pink-500/10 to-rose-500/5",
  },
  {
    icon: Trophy,
    title: "Gamificación & Recompensas",
    description:
      "Convertí la fidelidad en un juego. Niveles (Siestero, Soñador, Leyenda), insignias, desafíos y rankings interactivos. Cuanto más usás Ziesta, más beneficios exclusivos desbloqueás, motivando a tus clientes a volver siempre.",
    accent: "var(--accent-gold)",
    gradient: "from-amber-500/10 to-yellow-500/5",
  },
  {
    icon: Store,
    title: "Red de Comercios",
    description:
      "Miles de comercios adheridos en un solo ecosistema. Los puntos que ganás en un local, los usás en cualquier otro.",
    accent: "var(--ziesta-600)",
    gradient: "from-violet-500/10 to-purple-500/5",
  },
  {
    icon: Smartphone,
    title: "WhatsApp & Omnicanal",
    description:
      "Consultá tu saldo de puntos, realizá canjes, recibí notificaciones y enterate de las mejores promos directamente desde WhatsApp. Tu asistente virtual siempre a mano, complementado por la App Móvil y la plataforma Web.",
    accent: "var(--accent-blue)",
    gradient: "from-blue-500/10 to-cyan-500/5",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export default function Features() {
  return (
    <section id="features" className="relative py-28 bg-white">
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
            ¿Por qué Ziesta?
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Todo lo que necesitás en{" "}
            <span className="text-gradient">un solo ecosistema</span>
          </h2>
          <p className="text-lg text-[var(--neutral-500)] max-w-3xl mx-auto leading-relaxed">
            <strong>Ziesta</strong> es el ecosistema de fidelización inspirado en la tranquilidad y el disfrute. 
            Conectamos a comercios y clientes a través de un sistema de puntos unificado, seguro y fácil de usar. 
            No es solo una app de puntos; es la infraestructura inteligente que impulsa el comercio local 
            premiando tu preferencia de todos los días.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="glass-card p-8 group relative overflow-hidden"
            >
              {/* Gradient bg on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{
                    background: `${feature.accent}15`,
                    color: feature.accent,
                  }}
                >
                  <feature.icon size={28} strokeWidth={1.8} />
                </div>

                {/* Title */}
                <h3
                  className="text-xl font-bold mb-3 text-[var(--neutral-900)]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {feature.title}
                </h3>

                {/* Desc */}
                <p className="text-[var(--neutral-500)] leading-relaxed text-[15px]">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
