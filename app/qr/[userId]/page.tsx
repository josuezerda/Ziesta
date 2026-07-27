"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Coins,
  Star,
  Shield,
  Clock,
  Copy,
  Check,
  Zap,
  Award,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const LEVELS = ["", "Siestero 🌙", "Soñador ☀️", "Leyenda 🌟"];
const LEVEL_COLORS = [
  "",
  "#9ca3af",
  "#ffd166",
  "#06d6a0",
];

interface Profile {
  id: string;
  full_name: string;
  points_balance: number;
  level: number;
  total_points_earned: number;
  total_points_spent: number;
  created_at: string;
}

interface StampProgress {
  id: string;
  current_stamps: number;
  completed_count: number;
  stamp_cards: {
    name: string;
    stamps_required: number;
    reward_description: string;
    merchants: { name: string };
  };
}

export default function CarnetDigital({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const [userId, setUserId] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stamps, setStamps] = useState<StampProgress[]>([]);
  const [tokenCode, setTokenCode] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState(0);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Resolve params
  useEffect(() => {
    params.then((p) => setUserId(p.userId));
  }, [params]);

  useEffect(() => {
    if (!userId) return;
    loadProfile();
  }, [userId]);

  // Token countdown
  useEffect(() => {
    if (tokenExpiry <= 0) return;
    const timer = setInterval(() => {
      setTokenExpiry((prev) => {
        if (prev <= 1) {
          setTokenCode(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [tokenExpiry]);

  async function loadProfile() {
    const supabase = createClient();

    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !profileData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfile(profileData);

    // Load stamp progress
    const { data: stampData } = await supabase
      .from("stamp_progress")
      .select("*, stamp_cards(name, stamps_required, reward_description, merchants(name))")
      .eq("client_id", userId);

    if (stampData) setStamps(stampData);
    setLoading(false);
  }

  async function generateToken() {
    if (!redeemAmount || parseInt(redeemAmount) <= 0 || !profile) return;
    setGenerating(true);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("generate_redemption_token", {
      p_client_id: profile.id,
      p_points: parseInt(redeemAmount),
    });

    if (error) {
      alert(error.message);
      setGenerating(false);
      return;
    }

    if (data && data.length > 0) {
      setTokenCode(data[0].code);
      setTokenExpiry(60);
    }
    setGenerating(false);
  }

  function copyToken() {
    if (tokenCode) {
      navigator.clipboard.writeText(tokenCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="w-10 h-10 border-3 border-[var(--ziesta-300)] border-t-[var(--ziesta-600)] rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="glass-card p-10 text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(239,71,111,0.1)] flex items-center justify-center mb-4">
            <Shield size={32} className="text-[var(--accent-pink)]" />
          </div>
          <h1
            className="text-xl font-bold text-[var(--neutral-900)] mb-2"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Carnet no encontrado
          </h1>
          <p className="text-[var(--neutral-500)] text-sm">
            Este enlace no corresponde a ningún usuario de Ziesta.
          </p>
          <Link href="/" className="btn-primary mt-6 inline-flex">
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  const level = profile?.level || 1;
  const levelName = LEVELS[level];
  const levelColor = LEVEL_COLORS[level];
  const qrData = encodeURIComponent(
    `https://ziesta.com.ar/validar?uid=${profile?.id}&t=${Date.now()}`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}&color=8B46FF&bgcolor=FFFFFF`;

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Image
              src="/ziesta-logo.png"
              alt="Ziesta"
              width={28}
              height={28}
            />
            <span
              className="text-base font-bold text-gradient"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Ziesta
            </span>
          </Link>
        </motion.div>

        {/* Digital Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl shadow-xl"
          style={{
            background: "linear-gradient(135deg, #1a1033 0%, #2d1b69 50%, #1a1033 100%)",
          }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, rgba(139,70,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6,214,160,0.2) 0%, transparent 50%)",
              }}
            />
          </div>

          <div className="relative p-6 pb-8">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Image
                  src="/ziesta-logo.png"
                  alt="Ziesta"
                  width={24}
                  height={24}
                />
                <span
                  className="text-white/80 text-sm font-semibold"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  CARNET DIGITAL
                </span>
              </div>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-bold"
                style={{
                  background: `${levelColor}25`,
                  color: levelColor,
                  border: `1px solid ${levelColor}40`,
                }}
              >
                {levelName}
              </span>
            </div>

            {/* Name & Points */}
            <div className="text-center mb-6">
              <h1
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {profile?.full_name}
              </h1>
              <div className="flex items-center justify-center gap-2 mt-3">
                <Coins size={18} className="text-[#ffd166]" />
                <span
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {Number(profile?.points_balance || 0).toFixed(4)}
                </span>
                <span className="text-white/50 text-sm">puntos</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-2xl p-3 shadow-lg">
                <img
                  src={qrUrl}
                  alt="QR Code"
                  width={160}
                  height={160}
                  className="rounded-xl"
                />
              </div>
            </div>

            <p className="text-center text-white/40 text-xs">
              Mostrá este QR al comercio para acreditar puntos
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="text-center">
                <p className="text-white/40 text-xs">Ganados</p>
                <p className="text-white font-bold text-sm">
                  {Number(profile?.total_points_earned || 0).toFixed(4)}
                </p>
              </div>
              <div className="text-center border-x border-white/10">
                <p className="text-white/40 text-xs">Canjeados</p>
                <p className="text-white font-bold text-sm">
                  {Number(profile?.total_points_spent || 0).toFixed(4)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-white/40 text-xs">Miembro desde</p>
                <p className="text-white font-bold text-sm">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("es-AR", {
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Token Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[rgba(139,70,255,0.1)] flex items-center justify-center">
              <Zap size={20} className="text-[var(--ziesta-500)]" />
            </div>
            <div>
              <h3
                className="font-bold text-[var(--neutral-800)]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Canjear Puntos
              </h3>
              <p className="text-xs text-[var(--neutral-400)]">
                Token rotativo de 60 segundos
              </p>
            </div>
          </div>

          {tokenCode ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(6,214,160,0.1)] text-[var(--accent-cyan)] text-xs font-semibold mb-3">
                <Clock size={12} />
                Expira en {tokenExpiry}s
              </div>
              <div className="bg-[var(--neutral-900)] rounded-2xl p-5 mb-3 relative">
                <p
                  className="text-4xl font-bold text-white tracking-[0.3em] font-mono"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {tokenCode}
                </p>
                <button
                  onClick={copyToken}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 transition-all"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-sm text-[var(--neutral-500)]">
                Mostrá o dictá este código al comercio
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="number"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                placeholder="¿Cuántos puntos canjear?"
                min={1}
                max={profile?.points_balance || 0}
                className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 text-[var(--neutral-800)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateToken}
                disabled={
                  generating ||
                  !redeemAmount ||
                  parseInt(redeemAmount) <= 0 ||
                  parseInt(redeemAmount) > (profile?.points_balance || 0)
                }
                className="btn-primary w-full justify-center disabled:opacity-50"
              >
                {generating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap size={16} />
                    Generar Token
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Stamp Cards Progress */}
        {stamps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[rgba(255,209,102,0.1)] flex items-center justify-center">
                <Award size={20} className="text-[var(--accent-gold)]" />
              </div>
              <h3
                className="font-bold text-[var(--neutral-800)]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Mis Tarjetas de Sellos
              </h3>
            </div>
            <div className="space-y-4">
              {stamps.map((s) => {
                const pct =
                  (s.current_stamps / s.stamp_cards.stamps_required) * 100;
                return (
                  <div key={s.id} className="p-4 rounded-xl bg-white border border-[rgba(139,70,255,0.06)]">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm text-[var(--neutral-800)]">
                          {s.stamp_cards.name}
                        </p>
                        <p className="text-xs text-[var(--neutral-400)]">
                          {s.stamp_cards.merchants.name}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[var(--ziesta-500)]">
                        {s.current_stamps}/{s.stamp_cards.stamps_required}
                      </span>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: s.stamp_cards.stamps_required }).map(
                        (_, i) => (
                          <div
                            key={i}
                            className={`h-2 flex-1 rounded-full ${
                              i < s.current_stamps
                                ? "bg-[var(--ziesta-500)]"
                                : "bg-[var(--neutral-100)]"
                            }`}
                          />
                        )
                      )}
                    </div>
                    <p className="text-xs text-[var(--neutral-500)]">
                      🎁 {s.stamp_cards.reward_description}
                    </p>
                    {s.completed_count > 0 && (
                      <p className="text-xs text-[var(--accent-cyan)] font-semibold mt-1">
                        ✅ Completada {s.completed_count} vez{s.completed_count > 1 ? "es" : ""}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center pt-2 pb-8">
          <p className="text-xs text-[var(--neutral-400)]">
            Powered by{" "}
            <Link href="/" className="font-semibold text-[var(--ziesta-500)]">
              Ziesta
            </Link>{" "}
            — Red de Fidelización Inteligente
          </p>
        </div>
      </div>
    </div>
  );
}
