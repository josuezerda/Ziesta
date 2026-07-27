"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Coins,
  Trophy,
  QrCode,
  Clock,
  TrendingUp,
  Star,
  Gift,
  MapPin,
  LogOut,
  User,
  ChevronRight,
  Zap,
  Shield,
  Link2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Level names
const LEVELS = ["", "Siestero 🌙", "Soñador ☀️", "Leyenda 🌟"];
const LEVEL_COLORS = [
  "",
  "var(--neutral-500)",
  "var(--accent-gold)",
  "var(--accent-cyan)",
];
const LEVEL_NEXT = [0, 100, 1000, 999999];

interface Profile {
  id: string;
  full_name: string;
  points_balance: number;
  level: number;
  total_points_earned: number;
  total_points_spent: number;
  role: string;
}

interface Transaction {
  id: string;
  type: string;
  points: number;
  description: string;
  created_at: string;
  merchant_id: string;
  merchants?: { name: string };
  tx_hash?: string;
}

export default function ClientDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenCode, setTokenCode] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number>(60);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  // Rotatory QR countdown timer
  useEffect(() => {
    if (!profile) return;
    
    // Set initial token
    setTokenCode(`ZST-${profile.id}-${Math.floor(Date.now() / 60000)}`);
    setTokenExpiry(60 - (new Date().getSeconds()));

    const timer = setInterval(() => {
      setTokenExpiry((prev) => {
        if (prev <= 1) {
          // Generate new token every 60 seconds
          setTokenCode(`ZST-${profile.id}-${Math.floor(Date.now() / 60000)}`);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [profile]);

  async function loadData() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Load profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    } else {
      // Profile may not exist yet if trigger hasn't fired
      setProfile({
        id: user.id,
        full_name: user.user_metadata?.full_name || "Usuario",
        points_balance: 0,
        level: 1,
        total_points_earned: 0,
        total_points_spent: 0,
        role: "client",
      });
    }

    // Load recent transactions
    const { data: txData } = await supabase
      .from("transactions")
      .select("*, merchants(name)")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (txData) setTransactions(txData);
    setLoading(false);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="w-10 h-10 border-3 border-[var(--ziesta-300)] border-t-[var(--ziesta-600)] rounded-full animate-spin" />
      </div>
    );
  }

  const level = profile?.level || 1;
  const levelName = LEVELS[level] || "Bronce";
  const levelColor = LEVEL_COLORS[level] || "var(--neutral-400)";
  const nextLevel = LEVEL_NEXT[level] || 1000;
  const prevLevel = level > 1 ? LEVEL_NEXT[level - 1] : 0;
  const progress =
    ((profile?.total_points_earned || 0) - prevLevel) /
    (nextLevel - prevLevel);

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-[rgba(139,70,255,0.08)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/ziesta-logo.png"
              alt="Ziesta"
              width={32}
              height={32}
            />
            <span
              className="text-lg font-bold text-gradient"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Ziesta
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[var(--neutral-800)]">
                {profile?.full_name}
              </p>
              <p className="text-xs text-[var(--neutral-500)]">
                Nivel {levelName}
              </p>
            </div>
            <Link
              href="/dashboard/profile"
              className="p-2 rounded-xl hover:bg-[rgba(139,70,255,0.06)] text-[var(--neutral-500)] hover:text-[var(--ziesta-600)] transition-all"
              title="Mi Perfil"
            >
              <User size={20} />
            </Link>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl hover:bg-[rgba(139,70,255,0.06)] text-[var(--neutral-500)] hover:text-[var(--ziesta-600)] transition-all"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome & Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1
            className="text-2xl sm:text-3xl font-bold text-[var(--neutral-900)] mb-2"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            ¡Hola, {profile?.full_name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-[var(--neutral-500)]">
            Aquí está el resumen de tu cuenta
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Main Membership Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 relative rounded-3xl overflow-hidden p-8 text-white shadow-2xl"
          >
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--neutral-900)] to-[var(--neutral-800)] z-0" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--ziesta-500)]/40 via-transparent to-transparent z-0 blur-xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[var(--accent-cyan)]/30 via-transparent to-transparent z-0 blur-xl" />
            
            {/* Card Content */}
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-1">Membresía Digital</p>
                  <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>{profile?.full_name}</h2>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                  <Star size={16} style={{ color: levelColor }} />
                  <span className="font-bold text-sm tracking-wide" style={{ color: levelColor }}>{levelName}</span>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-white/60 text-sm mb-1">Saldo Disponible</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black tracking-tight" style={{ fontFamily: "var(--font-outfit)" }}>
                    {profile?.points_balance?.toLocaleString("es-AR") || "0"}
                  </span>
                  <span className="text-xl text-[var(--accent-cyan)] font-bold mb-1">pts</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className="text-white/70">Progreso al nivel {LEVELS[Math.min(level + 1, 5)]}</span>
                  <span className="text-white">{profile?.total_points_earned || 0} / {nextLevel}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress * 100, 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--ziesta-400)] shadow-[0_0_10px_var(--accent-cyan)]"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Column */}
          <div className="flex flex-col gap-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 flex-1 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-xl bg-[rgba(139,70,255,0.1)] flex items-center justify-center mb-3 text-[var(--ziesta-500)]"><TrendingUp size={20} /></div>
              <p className="text-xs text-[var(--neutral-400)] font-medium">Total Acumulado Histórico</p>
              <p className="text-2xl font-bold mt-1 text-[var(--neutral-900)]">{profile?.total_points_earned?.toLocaleString("es-AR") || "0"} pts</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 flex-1 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-xl bg-[rgba(255,107,158,0.1)] flex items-center justify-center mb-3 text-[var(--accent-pink)]"><Gift size={20} /></div>
              <p className="text-xs text-[var(--neutral-400)] font-medium">Puntos Canjeados Histórico</p>
              <p className="text-2xl font-bold mt-1 text-[var(--neutral-900)]">{profile?.total_points_spent?.toLocaleString("es-AR") || "0"} pts</p>
            </motion.div>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Rotating QR Token */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 flex flex-col items-center justify-center text-center"
          >
            <div className="flex items-center gap-3 mb-6 w-full justify-start">
              <div className="w-10 h-10 rounded-xl bg-[rgba(6,214,160,0.1)] flex items-center justify-center">
                <QrCode size={20} className="text-[var(--accent-cyan)]" />
              </div>
              <div className="text-left">
                <h3
                  className="font-bold text-[var(--neutral-800)]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  Tu Código Identificador
                </h3>
                <p className="text-xs text-[var(--neutral-400)]">
                  Mostrá este QR al comercio para canjear
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[rgba(139,70,255,0.1)] text-[var(--ziesta-600)] text-xs font-semibold mb-6">
              <Clock size={14} className={tokenExpiry <= 10 ? "animate-pulse text-red-500" : ""} />
              Actualizando en {tokenExpiry}s
            </div>
            
            <div className="bg-white p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.05)] mb-6">
              {tokenCode ? (
                <QRCodeSVG
                  value={tokenCode}
                  size={180}
                  level="H"
                  includeMargin={false}
                  fgColor="#0a0a0a"
                  bgColor="#ffffff"
                  imageSettings={{
                    src: "/ziesta-logo.png",
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              ) : (
                <div className="w-[180px] h-[180px] bg-[var(--neutral-100)] animate-pulse rounded-xl" />
              )}
            </div>
            
            <p className="text-sm text-[var(--neutral-500)] max-w-sm mx-auto">
              Este código es único y seguro. El comercio lo escaneará para asignarte o debitarte puntos de forma automática.
            </p>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(139,70,255,0.1)] flex items-center justify-center">
                  <Clock size={20} className="text-[var(--ziesta-500)]" />
                </div>
                <h3
                  className="font-bold text-[var(--neutral-800)]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  Movimientos
                </h3>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(139,70,255,0.05)] flex items-center justify-center mb-4">
                  <Coins size={28} className="text-[var(--neutral-300)]" />
                </div>
                <p className="text-[var(--neutral-400)] text-sm">
                  Aún no tenés movimientos.
                  <br />
                  ¡Hacé tu primera compra!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-[rgba(139,70,255,0.03)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                          tx.type === "earn" || tx.type === "bonus"
                            ? "bg-[var(--accent-cyan)]"
                            : "bg-[var(--accent-pink)]"
                        }`}
                      >
                        {tx.type === "earn" || tx.type === "bonus" ? "+" : "-"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--neutral-800)]">
                          {tx.description || tx.type}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-[var(--neutral-400)]">
                            {new Date(tx.created_at).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })}
                          </p>
                          {/* Blockchain Hash Indicator */}
                          <div className="flex items-center gap-1 text-[10px] text-[var(--neutral-500)] bg-[var(--neutral-100)] px-1.5 py-0.5 rounded-full" title="Transacción respaldada en Blockchain">
                            <Link2 size={10} />
                            <span className="font-mono">{tx.tx_hash?.substring(0, 8) || "0x..."}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        tx.type === "earn" || tx.type === "bonus"
                          ? "text-[var(--accent-cyan)]"
                          : "text-[var(--accent-pink)]"
                      }`}
                    >
                      {tx.type === "earn" || tx.type === "bonus" ? "+" : "-"}
                      {tx.points.toLocaleString("es-AR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Access Auditing */}
        <div className="mt-12 text-center pb-8">
          <Link href="/#ziestascan" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--neutral-900)] text-white font-medium hover:scale-105 transition-transform shadow-lg group">
             <Shield size={18} className="text-[var(--accent-cyan)] group-hover:rotate-12 transition-transform" />
             Auditar Transacción (ZiestaScan)
          </Link>
        </div>
      </main>
    </div>
  );
}
