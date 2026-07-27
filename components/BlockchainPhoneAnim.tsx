"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Shield, Zap, ChevronRight, CheckCircle2 } from "lucide-react";

export default function BlockchainPhoneAnim() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });

  // Phone animations
  const phoneY = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const phoneRotateX = useTransform(scrollYProgress, [0, 1], [25, 0]);
  const phoneScale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

  return (
    <section ref={containerRef} className="py-24 relative overflow-hidden bg-[var(--neutral-950)]" id="phone-anim">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--ziesta-500)] to-transparent opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[rgba(139,70,255,0.08)] via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(6,214,160,0.1)] text-[var(--accent-cyan)] text-sm font-semibold mb-6 border border-[rgba(6,214,160,0.2)]">
                <Shield size={16} />
                Respaldado en Blockchain
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
                Transacciones Inmutables a Velocidad Luz.
              </h2>
              <p className="text-lg text-[var(--neutral-400)] mb-8 leading-relaxed">
                Cada vez que escaneás un código o generás un canje, la red valida instantáneamente tus puntos, asegurando total transparencia. El token es 100% tuyo y auditable por cualquier comercio de la red.
              </p>
              
              <ul className="space-y-4 text-left max-w-md mx-auto lg:mx-0">
                {[
                  "Generación de código QR dinámico e irrastreable.",
                  "Hashes criptográficos inmutables en tiempo real.",
                  "Liquidación de puntos multi-comercio sin demoras."
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="text-[var(--accent-cyan)] shrink-0 mt-0.5" size={20} />
                    <span className="text-[var(--neutral-300)]">{item}</span>
                  </motion.li>
                ))}
              </ul>

              {/* App Store Buttons */}
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <button className="flex items-center gap-3 bg-gradient-to-br from-[var(--ziesta-600)] to-[var(--ziesta-800)] hover:from-[var(--ziesta-500)] hover:to-[var(--ziesta-700)] border border-[rgba(139,70,255,0.4)] shadow-[0_0_20px_rgba(139,70,255,0.2)] hover:shadow-[0_0_25px_rgba(139,70,255,0.4)] transition-all px-6 py-3 rounded-2xl">
                  <svg viewBox="0 0 384 512" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                  <div className="text-left">
                    <p className="text-[10px] text-white/70 leading-none mb-1">Próximamente en</p>
                    <p className="text-sm font-semibold text-white leading-none">App Store</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 bg-gradient-to-br from-[var(--ziesta-600)] to-[var(--ziesta-800)] hover:from-[var(--ziesta-500)] hover:to-[var(--ziesta-700)] border border-[rgba(139,70,255,0.4)] shadow-[0_0_20px_rgba(139,70,255,0.2)] hover:shadow-[0_0_25px_rgba(139,70,255,0.4)] transition-all px-6 py-3 rounded-2xl">
                  <svg viewBox="0 0 512 512" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                  <div className="text-left">
                    <p className="text-[10px] text-white/70 leading-none mb-1">Próximamente en</p>
                    <p className="text-sm font-semibold text-white leading-none">Google Play</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Phone Animation Container */}
          <div className="order-1 lg:order-2 relative h-[600px] flex items-center justify-center perspective-[1200px]">
            {/* 3D Realistic Phone Mockup */}
            <motion.div 
              style={{
                y: phoneY,
                rotateX: phoneRotateX,
                scale: phoneScale,
                transformStyle: "preserve-3d",
              }}
              className="relative z-20 w-[300px] h-[620px] rounded-[3.5rem] p-3 bg-gradient-to-tr from-[#1a1a1a] via-[#555] to-[#1a1a1a] shadow-[0_30px_60px_rgba(139,70,255,0.4),inset_0_0_10px_rgba(255,255,255,0.3)] ring-1 ring-white/20"
            >
              {/* Inner screen border (black bezel) */}
              <div className="w-full h-full rounded-[3rem] bg-black p-1.5 relative shadow-inner">
                {/* Screen content */}
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative bg-[#09090b] flex flex-col font-sans">
                  
                  {/* Dynamic Island */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-50 flex items-center justify-between px-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--ziesta-500)]/30 border border-white/10 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_5px_var(--accent-cyan)]" /></div>
                  </div>

                  {/* Status Bar */}
                  <div className="w-full h-12 flex justify-between items-center px-6 pt-2 text-[11px] text-white font-medium z-40">
                    <span className="ml-2 mt-1 font-semibold">9:41</span>
                    <div className="flex gap-1.5 items-center mt-1">
                      <Zap size={10} className="fill-white" />
                      <div className="w-5 h-2.5 border border-white/50 rounded-sm p-[1px] relative"><div className="w-full h-full bg-white rounded-sm" /><div className="absolute -right-0.5 top-1 w-[1px] h-1 bg-white/50" /></div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="flex-1 px-5 pt-2 pb-6 flex flex-col gap-5">
                    {/* Header */}
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                        <Image src="/ziesta-logo.png" alt="ZST" width={28} height={28} className="drop-shadow-lg" />
                        <span className="text-white font-bold text-lg tracking-wider" style={{ fontFamily: "var(--font-outfit)" }}>ZIESTA</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5">
                        <span className="text-xs font-bold text-white">JZ</span>
                      </div>
                    </div>

                    {/* Premium Glass Card */}
                    <div className="relative w-full h-44 rounded-[1.5rem] p-5 overflow-hidden shadow-[0_10px_30px_rgba(139,70,255,0.3)] border border-white/20 group">
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--ziesta-600)] via-[var(--ziesta-400)] to-[var(--accent-cyan)] opacity-90" />
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                      
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white/80 text-[10px] uppercase font-bold tracking-widest mb-1">Membresía</p>
                            <p className="text-white font-bold text-xl" style={{ fontFamily: "var(--font-outfit)" }}>Nivel Siestero</p>
                          </div>
                          <Zap size={20} className="text-white/80" />
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-white/80 text-[10px] mb-1">Saldo Disponible</p>
                            <p className="text-white font-black text-3xl font-mono tracking-tight shadow-sm">4.500 <span className="text-sm font-bold text-[var(--accent-cyan)]">ZST</span></p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Modern Area */}
                    <div className="flex-1 bg-white/5 rounded-[1.5rem] border border-white/10 flex flex-col items-center justify-center p-5 relative overflow-hidden backdrop-blur-sm">
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--ziesta-400)] to-transparent opacity-50" />
                      
                      <div className="w-32 h-32 bg-white rounded-2xl p-2.5 mb-4 shadow-[0_0_30px_rgba(6,214,160,0.2)] relative">
                        {/* High-tech looking QR placeholder */}
                        <div className="w-full h-full bg-black rounded-xl overflow-hidden relative">
                          <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-1 p-1">
                             {[...Array(25)].map((_, i) => (
                               <div key={i} className={`rounded-sm ${[1,0,1,1,0, 0,1,0,1,1, 1,1,0,0,1, 1,0,1,0,1, 0,1,1,1,0][i] ? 'bg-white' : 'bg-transparent'}`} />
                             ))}
                          </div>
                          {/* Inner center logo for QR */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-lg border-2 border-white flex items-center justify-center">
                            <Zap size={14} className="text-white" />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--ziesta-300)] uppercase tracking-widest text-center">
                        Escanear para Canjear
                      </p>
                    </div>
                  </div>

                  {/* Modern Bottom Navigation */}
                  <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center items-end pb-4 z-20">
                     <div className="w-1/3 h-1 bg-white/30 rounded-full" />
                  </div>
                </div>
              </div>
              
              {/* Fake phone screen glare */}
              <div className="absolute inset-0 rounded-[3.5rem] bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
              
              {/* Fake physical buttons */}
              <div className="absolute left-[-4px] top-32 w-1 h-8 bg-gradient-to-b from-[#666] to-[#333] rounded-l-md" />
              <div className="absolute left-[-4px] top-48 w-1 h-12 bg-gradient-to-b from-[#666] to-[#333] rounded-l-md" />
              <div className="absolute left-[-4px] top-64 w-1 h-12 bg-gradient-to-b from-[#666] to-[#333] rounded-l-md" />
              <div className="absolute right-[-4px] top-48 w-1 h-16 bg-gradient-to-b from-[#666] to-[#333] rounded-r-md" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
