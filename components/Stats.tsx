"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface CounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2,
}: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString("es-AR")}
      {suffix}
    </span>
  );
}

const stats = [
  {
    value: 2500,
    prefix: "+",
    suffix: "",
    label: "Usuarios activos",
    description: "y creciendo cada día",
  },
  {
    value: 180,
    prefix: "+",
    suffix: "",
    label: "Comercios adheridos",
    description: "en Santiago del Estero",
  },
  {
    value: 1200000,
    prefix: "",
    suffix: "",
    label: "Puntos emitidos",
    description: "en circulación",
  },
  {
    value: 95,
    prefix: "",
    suffix: "%",
    label: "Satisfacción",
    description: "de nuestros comercios",
  },
];

export default function Stats() {
  return (
    <section
      className="relative py-24"
      style={{ background: "var(--surface-2)" }}
    >
      <div className="section-divider absolute top-0" style={{ left: "10%", right: "10%" }} />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="stat-card"
            >
              <p
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-2"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                <AnimatedCounter
                  target={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </p>
              <p className="text-base font-semibold text-[var(--neutral-800)] mb-1">
                {stat.label}
              </p>
              <p className="text-sm text-[var(--neutral-400)]">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
