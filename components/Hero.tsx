"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import Image from "next/image";
import { ArrowRight, QrCode, Zap } from "lucide-react";

/* ───── Floating particles ───── */
function Particles() {
  const [particles, setParticles] = useState<
    { id: number; size: number; x: number; y: number; delay: number; duration: number; opacity: number }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        size: Math.random() * 6 + 3,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 6 + 8,
        opacity: 0.08 + Math.random() * 0.12,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `rgba(139, 70, 255, ${p.opacity})`,
          }}
          animate={{
            y: [0, -40, -20, -50, 0],
            x: [0, 15, -10, 20, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
            opacity: [0.3, 0.7, 0.4, 0.6, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ───── Interactive 3D Coin ───── */
function InteractiveCoin() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className="relative w-full aspect-square max-w-[500px] mx-auto hidden lg:flex items-center justify-center"
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 flex items-center justify-center w-full h-full"
      >
        {/* Glow behind the logo */}
        <div className="absolute inset-10 rounded-full bg-[var(--ziesta-500)]/40 blur-3xl" style={{ transform: "translateZ(-50px)" }} />
        
        {/* The actual Logo */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transform: "translateZ(50px)" }}
        >
          <Image
            src="/ziesta-logo.png"
            alt="Ziesta Logo"
            width={380}
            height={380}
            className="drop-shadow-[0_20px_50px_rgba(139,70,255,0.4)]"
            priority
          />
        </motion.div>
      </motion.div>

      {/* Interactive Blockchain Nodes floating around the logo */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[
          { top: "10%", left: "20%", delay: 0 },
          { top: "80%", left: "15%", delay: 1 },
          { top: "20%", left: "80%", delay: 2 },
          { top: "75%", left: "85%", delay: 1.5 },
        ].map((node, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_15px_var(--accent-cyan)]"
            style={{ top: node.top, left: node.left }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: node.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ───── Hero Section ───── */
export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.8], [0, 100]);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="hero-bg relative min-h-screen flex items-center overflow-hidden pt-20"
    >
      <Particles />

      <motion.div
        style={{ opacity, y }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-6 items-center">
          {/* ── Left: Text ── */}
          <div className="max-w-xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(139,70,255,0.08)] border border-[rgba(139,70,255,0.12)] mb-8"
            >
              <Zap size={14} className="text-[var(--ziesta-500)]" />
              <span className="text-sm font-medium text-[var(--ziesta-700)]">
                Impulsado por Inteligencia Artificial y Web3
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Tus compras
              <br />
              <span className="text-gradient">generan</span>
              <br />
              <span className="text-gradient">recompensas.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg sm:text-xl text-[var(--neutral-500)] leading-relaxed mb-10 max-w-md"
            >
              El primer sistema de fidelización en <strong className="text-[var(--ziesta-600)]">cadena de blockchain</strong>. 
              Acumulá Puntos Ziesta inmutables en miles de comercios y canjealos donde más te guste.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="btn-primary text-lg py-4 px-8"
              >
                <QrCode size={20} />
                Unirme Ahora
                <ArrowRight size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="btn-secondary text-lg py-4 px-8"
              >
                Soy Comercio
              </motion.button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-12 flex items-center gap-6"
            >
              {/* Avatar stack */}
              <div className="flex -space-x-3">
                {[
                  "bg-[var(--ziesta-300)]",
                  "bg-[var(--accent-cyan)]",
                  "bg-[var(--accent-gold)]",
                  "bg-[var(--accent-pink)]",
                ].map((bg, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full ${bg} border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                  >
                    {["JS", "MA", "LP", "CR"][i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--neutral-800)]">
                  +2.500 usuarios activos
                </p>
                <p className="text-xs text-[var(--neutral-400)]">
                  en Santiago del Estero
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Right: 3D Coin ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px]">
              <InteractiveCoin />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
    </section>
  );
}
