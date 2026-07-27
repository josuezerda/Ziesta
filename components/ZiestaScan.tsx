'use client';

import { motion } from 'framer-motion';
import { Search, Shield, Activity, Link2, Hexagon } from 'lucide-react';
import React, { useState } from 'react';

export default function ZiestaScan() {
  const [hash, setHash] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash) return;
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      alert('🔍 ZiestaScan Público: Esta función permitirá auditar cualquier transacción (emisión o canje) usando su Hash Criptográfico, garantizando que los Puntos Ziesta sean inmutables y 100% transparentes.');
    }, 800);
  };

  return (
    <section id="ziestascan" className="py-24 relative overflow-hidden bg-[var(--neutral-900)] text-white">
      {/* Mystical Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--ziesta-900)] to-black z-0" />
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--ziesta-500)]/20 via-transparent to-transparent z-0" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 font-medium text-sm text-[var(--accent-cyan)]"
          >
            <Shield className="w-4 h-4" />
            <span>ZiestaScan: Transparencia Total</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            Auditoría en <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--ziesta-400)]">Tiempo Real</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg md:text-xl"
          >
            Toda la red de Ziesta está asegurada mediante Hashes Criptográficos. Ingresá el ID o Hash de tu transacción para verificar su inmutabilidad en el registro público.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/5 border border-white/10 rounded-3xl p-2 backdrop-blur-md shadow-2xl">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Hexagon className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type="text"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  placeholder="Ingresá un TxHash (Ej: 0x7f2c... o 550e8400...)"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-transparent rounded-2xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-[var(--accent-cyan)] transition-all font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-8 py-4 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--ziesta-500)] hover:from-[var(--accent-cyan)] hover:to-[var(--ziesta-400)] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {searching ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Auditar</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-medium text-white/40">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent-cyan)]" />
              Red Segura
            </div>
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[var(--ziesta-400)]" />
              Hash Inmutable
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--accent-gold)]" />
              100% Auditable
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
