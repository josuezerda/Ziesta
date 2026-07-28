"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Zap, Clock, Gift } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";

interface TotemMedia {
  id: string;
  media_type: "video" | "image";
  media_url: string;
  duration_seconds: number;
  display_order: number;
}

interface Surprise {
  id: string;
  prize_type: string;
  prize_value: number;
  prize_description: string;
  frequency_per_day: number;
}

export default function TotemViewer() {
  const params = useParams();
  const totemId = params.id as string;
  const supabase = createClient();
  
  const [mediaList, setMediaList] = useState<TotemMedia[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isSurpriseActive, setIsSurpriseActive] = useState(false);
  const [activeSurprise, setActiveSurprise] = useState<Surprise | null>(null);
  const [surpriseCode, setSurpriseCode] = useState<string>("");
  const [surpriseTimer, setSurpriseTimer] = useState(60);
  const [loading, setLoading] = useState(true);

  // Carga inicial
  useEffect(() => {
    if (!totemId) return;
    loadTotemData();

    // Setup Ping interval (cada 5 minutos reporta estar online)
    const pingInterval = setInterval(registerPing, 5 * 60 * 1000);
    return () => clearInterval(pingInterval);
  }, [totemId]);

  async function registerPing() {
    // Si tuvieras una función RPC: await supabase.rpc('register_totem_ping', { p_totem_id: totemId });
    // Por ahora lo simulamos con un update simple (requeriría bypassear RLS o usar anon_key si está permitido)
    await supabase.from("totems").update({ last_ping: new Date().toISOString(), status: 'online' }).eq("id", totemId);
  }

  async function loadTotemData() {
    const { data: media } = await supabase
      .from("totem_media")
      .select("*")
      .eq("totem_id", totemId)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (media && media.length > 0) {
      setMediaList(media);
    } else {
      // Default media if empty
      setMediaList([
        {
          id: "default-1",
          media_type: "image",
          media_url: "/blockchain-phone.jpg",
          duration_seconds: 15,
          display_order: 0,
        }
      ]);
    }
    
    // Simulación de carga
    setTimeout(() => setLoading(false), 1000);
    registerPing();
  }

  // Reproductor de Medios
  useEffect(() => {
    if (loading || mediaList.length === 0 || isSurpriseActive) return;

    const currentMedia = mediaList[currentMediaIndex];
    const duration = currentMedia.duration_seconds * 1000;

    const timer = setTimeout(() => {
      // Avanzar al siguiente o reiniciar
      setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length);
      
      // Lógica de Dropeo Aleatorio (10% de chance entre cada media, solo si no hay uno activo)
      if (Math.random() < 0.1) {
        triggerSurprise();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [currentMediaIndex, mediaList, loading, isSurpriseActive]);

  async function triggerSurprise() {
    // Buscar una sorpresa configurada para este tótem
    const { data: surprises } = await supabase
      .from("totem_surprises")
      .select("*")
      .eq("totem_id", totemId)
      .eq("is_active", true);

    if (surprises && surprises.length > 0) {
      // Elegir una al azar
      const surprise = surprises[Math.floor(Math.random() * surprises.length)];
      setActiveSurprise(surprise);
      // Generar código único para este drop
      setSurpriseCode(`DROP-${totemId}-${Date.now().toString().slice(-6)}`);
      setIsSurpriseActive(true);
      setSurpriseTimer(60);
    }
  }

  // Contador de la sorpresa
  useEffect(() => {
    if (!isSurpriseActive) return;

    const timer = setInterval(() => {
      setSurpriseTimer((prev) => {
        if (prev <= 1) {
          setIsSurpriseActive(false);
          setActiveSurprise(null);
          // Al terminar la sorpresa, pasamos al siguiente media
          setCurrentMediaIndex((current) => (current + 1) % mediaList.length);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSurpriseActive, mediaList.length]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center flex-col gap-6">
        <div className="w-16 h-16 border-4 border-[var(--ziesta-300)] border-t-[var(--ziesta-600)] rounded-full animate-spin" />
        <h2 className="text-white text-2xl font-bold font-mono tracking-widest animate-pulse">
          INICIANDO TÓTEM...
        </h2>
      </div>
    );
  }

  const currentMedia = mediaList[currentMediaIndex];

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative cursor-none select-none">
      
      {/* Reproductor Principal */}
      <AnimatePresence mode="wait">
        {!isSurpriseActive ? (
          <motion.div
            key={currentMedia.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="w-full h-full absolute inset-0 flex items-center justify-center bg-black"
          >
            {currentMedia.media_type === "image" ? (
              <img 
                src={currentMedia.media_url} 
                alt="Totem Ad" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <video 
                src={currentMedia.media_url} 
                autoPlay 
                muted 
                loop 
                className="w-full h-full object-cover" 
              />
            )}
            
            {/* Logo de Agua de Ziesta */}
            <div className="absolute bottom-8 right-8 flex items-center gap-3 bg-black/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
              <Image src="/ziesta-logo.png" alt="Ziesta" width={30} height={30} />
              <span className="text-white font-bold text-xl tracking-widest" style={{ fontFamily: "var(--font-outfit)" }}>
                ZIESTA
              </span>
            </div>
          </motion.div>
        ) : (
          /* Sorpresa Aleatoria / Golden Drop */
          <motion.div
            key="surprise"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-full h-full absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--ziesta-800)] via-[var(--neutral-900)] to-black flex flex-col items-center justify-center text-center p-12"
          >
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-[800px] h-[800px] bg-[conic-gradient(from_0deg,transparent_0_340deg,var(--ziesta-500)_360deg)] opacity-30 rounded-full blur-3xl"
            />
            
            <div className="relative z-10 max-w-4xl w-full glass-card p-16 rounded-[3rem] shadow-[0_0_100px_rgba(139,70,255,0.4)] border-2 border-[var(--ziesta-500)] flex flex-col lg:flex-row items-center gap-16">
              
              <div className="flex-1 text-left">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[rgba(255,209,102,0.15)] text-[var(--accent-gold)] font-bold text-xl mb-8 border border-[var(--accent-gold)] animate-pulse">
                  <Gift size={24} />
                  ¡SORPRESA ZIESTA!
                </div>
                
                <h1 className="text-6xl font-black text-white mb-6 leading-tight" style={{ fontFamily: "var(--font-outfit)" }}>
                  ¡Ganaste <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--ziesta-400)] to-[var(--accent-cyan)]">{activeSurprise?.prize_description}</span>!
                </h1>
                
                <p className="text-2xl text-[var(--neutral-300)] mb-12 leading-relaxed">
                  El primero en escanear este código se lleva el premio al instante a su cuenta. ¡Apurate!
                </p>
                
                <div className="flex items-center gap-4 text-[var(--accent-pink)] text-4xl font-bold font-mono bg-black/40 px-8 py-6 rounded-2xl border border-[var(--accent-pink)] w-max">
                  <Clock size={40} />
                  00:{surpriseTimer.toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-[2rem] shadow-2xl">
                <QRCodeSVG
                  value={surpriseCode}
                  size={360}
                  level="H"
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#ffffff"
                  imageSettings={{
                    src: "/ziesta-logo.png",
                    x: undefined,
                    y: undefined,
                    height: 80,
                    width: 80,
                    excavate: true,
                  }}
                />
              </div>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
