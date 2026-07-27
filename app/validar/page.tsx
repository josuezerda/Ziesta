"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  X,
  Coins,
  Zap,
  User,
  Shield,
  QrCode,
  Star,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";

const LEVELS = ["", "Siestero 🌙", "Soñador ☀️", "Leyenda 🌟"];

interface ClientInfo {
  id: string;
  full_name: string;
  points_balance: number;
  level: number;
  total_points_earned: number;
}

function ValidarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams.get("uid");

  const [merchant, setMerchant] = useState<{ id: string; name: string } | null>(null);
  const [pesosPerPoint, setPesosPerPoint] = useState(1000);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [validating, setValidating] = useState(false);
  const [emitting, setEmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [emitResult, setEmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Check if this user is a merchant
    const { data: merchantData } = await supabase
      .from("merchants")
      .select("id, name")
      .eq("owner_id", user.id)
      .single();

    if (merchantData) {
      setMerchant(merchantData);
      setIsLoggedIn(true);
    }

    // Get global rate
    const { data: rateData } = await supabase
      .from("system_config")
      .select("value")
      .eq("key", "pesos_per_point")
      .single();
    if (rateData) setPesosPerPoint(parseInt(rateData.value) || 1000);

    // If we have a uid from QR scan, load client info
    if (uid) {
      const { data: clientData } = await supabase
        .from("profiles")
        .select("id, full_name, points_balance, level, total_points_earned")
        .eq("id", uid)
        .single();

      if (clientData) setClientInfo(clientData);
    }

    setLoading(false);
  }

  async function validateToken() {
    if (!tokenInput || tokenInput.length !== 6 || !merchant) return;
    setValidating(true);
    setResult(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("validate_redemption_token", {
      p_token_code: tokenInput,
      p_merchant_id: merchant.id,
    });

    if (error) {
      setResult({ success: false, message: error.message });
    } else if (data && data.length > 0) {
      setResult({ success: data[0].success, message: data[0].message });
      if (data[0].success) {
        // Refresh client info
        if (data[0].client_id) {
          const { data: refreshed } = await supabase
            .from("profiles")
            .select("id, full_name, points_balance, level, total_points_earned")
            .eq("id", data[0].client_id)
            .single();
          if (refreshed) setClientInfo(refreshed);
        }
      }
    }

    setValidating(false);
    setTokenInput("");
  }

  async function emitPoints() {
    if (!purchaseAmount || !merchant || !clientInfo) return;
    setEmitting(true);
    setEmitResult(null);

    const amount = parseFloat(purchaseAmount);
    const points = amount / pesosPerPoint;

    if (points <= 0) {
      setEmitResult({ success: false, message: "El monto no genera puntos suficientes" });
      setEmitting(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.rpc("process_transaction", {
      p_client_id: clientInfo.id,
      p_merchant_id: merchant.id,
      p_type: "earn",
      p_points: points,
      p_description: `Compra en ${merchant.name} por $${amount.toLocaleString("es-AR")}`,
      p_purchase_amount: amount,
    });

    if (error) {
      setEmitResult({ success: false, message: error.message });
    } else {
      setEmitResult({
        success: true,
        message: `✅ Se acreditaron ${points.toFixed(4)} puntos a ${clientInfo.full_name}`,
      });

      // Refresh client info
      const { data: refreshed } = await supabase
        .from("profiles")
        .select("id, full_name, points_balance, level, total_points_earned")
        .eq("id", clientInfo.id)
        .single();
      if (refreshed) setClientInfo(refreshed);
    }

    setPurchaseAmount("");
    setEmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="w-10 h-10 border-3 border-[var(--ziesta-300)] border-t-[var(--ziesta-600)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--gradient-hero)" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(139,70,255,0.1)] flex items-center justify-center mb-4">
            <Shield size={32} className="text-[var(--ziesta-500)]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--neutral-900)] mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
            Portal de Validación
          </h1>
          <p className="text-[var(--neutral-500)] text-sm mb-6">
            Solo comercios adheridos pueden validar canjes y acreditar puntos.
          </p>
          <Link href="/auth/login" className="btn-primary inline-flex">
            Iniciar Sesión <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "var(--gradient-hero)" }}>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <Image src="/ziesta-logo.png" alt="Ziesta" width={28} height={28} />
            <span className="text-base font-bold text-gradient" style={{ fontFamily: "var(--font-outfit)" }}>Ziesta</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(6,214,160,0.08)] text-[var(--accent-cyan)] font-semibold border border-[rgba(6,214,160,0.15)]">
              🏪 {merchant?.name}
            </span>
          </div>
        </motion.div>

        {/* Client card (if scanned from QR) */}
        {clientInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[rgba(139,70,255,0.1)] flex items-center justify-center">
                <User size={24} className="text-[var(--ziesta-500)]" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-[var(--neutral-800)]" style={{ fontFamily: "var(--font-outfit)" }}>
                  {clientInfo.full_name}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--neutral-400)]">
                    Nivel {LEVELS[clientInfo.level || 1]}
                  </span>
                  <span className="text-xs text-[var(--ziesta-500)] font-semibold">
                    {Number(clientInfo.points_balance).toFixed(4)} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Emit points */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[var(--neutral-600)]">
                Monto de la compra ($)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder="Ej: 5000"
                  min={1}
                  className="flex-1 px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 text-[var(--neutral-800)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={emitPoints}
                  disabled={emitting || !purchaseAmount}
                  className="btn-primary px-5 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, var(--accent-cyan), #0ba380)" }}
                >
                  {emitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Coins size={18} />
                  )}
                </motion.button>
              </div>
              {purchaseAmount && parseInt(purchaseAmount) > 0 && (
                <p className="text-xs text-[var(--accent-cyan)]">
                  Se acreditarán{" "}
                  <strong>
                    {(parseInt(purchaseAmount) / pesosPerPoint).toFixed(4)}
                  </strong>{" "}
                  puntos
                </p>
              )}
              {emitResult && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                    emitResult.success
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                      : "bg-red-50 border border-red-200 text-red-600"
                  }`}
                >
                  {emitResult.success ? <Check size={16} /> : <X size={16} />}
                  {emitResult.message}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Token validator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[rgba(139,70,255,0.1)] flex items-center justify-center">
              <QrCode size={20} className="text-[var(--ziesta-500)]" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--neutral-800)]" style={{ fontFamily: "var(--font-outfit)" }}>
                Validar Canje
              </h3>
              <p className="text-xs text-[var(--neutral-400)]">
                Ingresá el código de 6 dígitos del cliente
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-4 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 text-center text-3xl font-bold tracking-[0.4em] text-[var(--neutral-800)] placeholder:text-[var(--neutral-300)] focus:outline-none focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] transition-all"
              style={{ fontFamily: "var(--font-outfit)" }}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={validateToken}
              disabled={validating || tokenInput.length !== 6}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              {validating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={18} />
                  Validar Token
                </>
              )}
            </motion.button>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-3 ${
                  result.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                {result.success ? <Check size={18} /> : <X size={18} />}
                {result.message}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center pt-2 pb-8">
          <Link
            href="/dashboard/merchant"
            className="text-xs text-[var(--ziesta-500)] font-semibold hover:underline"
          >
            ← Volver a mi Panel
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ValidarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="w-10 h-10 border-3 border-[var(--ziesta-300)] border-t-[var(--ziesta-600)] rounded-full animate-spin" />
      </div>
    }>
      <ValidarContent />
    </Suspense>
  );
}
