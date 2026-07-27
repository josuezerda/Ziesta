"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Check,
  X,
  ArrowLeft,
  Shield,
  Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  level: number;
  points_balance: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Verification
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [pendingChange, setPendingChange] = useState<"email" | "phone" | null>(null);

  // Results
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);
  const [passwordResult, setPasswordResult] = useState<{ success: boolean; message: string } | null>(null);
  const [changeResult, setChangeResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setEmail(user.email || "");
    setNewEmail(user.email || "");

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setNewPhone(data.phone || "");
    }
    setLoading(false);
  }

  async function saveBasicInfo() {
    setSaving(true);
    setSaveResult(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile?.id);

    if (error) {
      setSaveResult({ success: false, message: error.message });
    } else {
      setSaveResult({ success: true, message: "Datos actualizados correctamente" });
    }
    setSaving(false);
    setTimeout(() => setSaveResult(null), 3000);
  }

  async function changePassword() {
    setChangingPassword(true);
    setPasswordResult(null);

    if (newPassword !== confirmPassword) {
      setPasswordResult({ success: false, message: "Las contraseñas no coinciden" });
      setChangingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordResult({ success: false, message: "La contraseña debe tener al menos 6 caracteres" });
      setChangingPassword(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordResult({ success: false, message: error.message });
    } else {
      setPasswordResult({ success: true, message: "Contraseña actualizada correctamente" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setChangingPassword(false);
    setTimeout(() => setPasswordResult(null), 3000);
  }

  async function requestEmailChange() {
    if (!newEmail || newEmail === email) return;
    setVerifyingEmail(true);
    setChangeResult(null);

    const supabase = createClient();

    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to verification_codes
    const { error } = await supabase.from("verification_codes").insert({
      user_id: profile?.id,
      code,
      type: "email_change",
      new_value: newEmail,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min
    });

    if (error) {
      setChangeResult({ success: false, message: error.message });
      setVerifyingEmail(false);
      return;
    }

    // The code would be sent via WhatsApp when integrated
    // For now, we show it in a message
    setChangeResult({
      success: true,
      message: `Código de verificación enviado a tu WhatsApp. (Dev: ${code})`,
    });
    setPendingChange("email");
    setVerifyingEmail(false);
  }

  async function requestPhoneChange() {
    if (!newPhone || newPhone === phone) return;
    setVerifyingPhone(true);
    setChangeResult(null);

    const supabase = createClient();

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const { error } = await supabase.from("verification_codes").insert({
      user_id: profile?.id,
      code,
      type: "phone_change",
      new_value: newPhone,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    if (error) {
      setChangeResult({ success: false, message: error.message });
      setVerifyingPhone(false);
      return;
    }

    // Would be sent via email in production
    setChangeResult({
      success: true,
      message: `Código de verificación enviado a tu email. (Dev: ${code})`,
    });
    setPendingChange("phone");
    setVerifyingPhone(false);
  }

  async function confirmVerification() {
    if (!verifyCode || verifyCode.length !== 6) return;
    setChangeResult(null);

    const supabase = createClient();

    // Find the code
    const { data: codeData, error: findErr } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("user_id", profile?.id)
      .eq("code", verifyCode)
      .eq("type", pendingChange === "email" ? "email_change" : "phone_change")
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (findErr || !codeData) {
      setChangeResult({ success: false, message: "Código inválido o expirado" });
      return;
    }

    // Mark as used
    await supabase
      .from("verification_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", codeData.id);

    if (pendingChange === "email") {
      // Update email in auth
      const { error } = await supabase.auth.updateUser({ email: codeData.new_value });
      if (error) {
        setChangeResult({ success: false, message: error.message });
        return;
      }
      setEmail(codeData.new_value);
      setNewEmail(codeData.new_value);
    } else {
      // Update phone in profile
      const { error } = await supabase
        .from("profiles")
        .update({ phone: codeData.new_value, updated_at: new Date().toISOString() })
        .eq("id", profile?.id);
      if (error) {
        setChangeResult({ success: false, message: error.message });
        return;
      }
      setPhone(codeData.new_value);
      setNewPhone(codeData.new_value);
    }

    setChangeResult({ success: true, message: `${pendingChange === "email" ? "Email" : "Teléfono"} actualizado correctamente` });
    setPendingChange(null);
    setVerifyCode("");
    setTimeout(() => setChangeResult(null), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="w-10 h-10 border-3 border-[var(--ziesta-300)] border-t-[var(--ziesta-600)] rounded-full animate-spin" />
      </div>
    );
  }

  const LEVELS = ["", "Siestero 🌙", "Soñador ☀️", "Leyenda 🌟"];

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "var(--gradient-hero)" }}>
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            href={profile?.role === "admin" ? "/dashboard/admin" : profile?.role === "merchant" ? "/dashboard/merchant" : "/dashboard/client"}
            className="inline-flex items-center gap-2 text-sm text-[var(--neutral-500)] hover:text-[var(--ziesta-600)] transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Volver al Panel
          </Link>
          <h1 className="text-2xl font-bold text-[var(--neutral-900)]" style={{ fontFamily: "var(--font-outfit)" }}>
            Mi Perfil
          </h1>
          <p className="text-[var(--neutral-500)] text-sm">Gestioná tus datos personales</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[rgba(139,70,255,0.06)]">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold ${
              profile?.role === "admin" ? "bg-[var(--accent-pink)]" :
              profile?.role === "merchant" ? "bg-[var(--accent-cyan)]" :
              "bg-[var(--ziesta-500)]"
            }`}>
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--neutral-800)]" style={{ fontFamily: "var(--font-outfit)" }}>
                {fullName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(139,70,255,0.08)] text-[var(--ziesta-600)] font-medium capitalize">
                  {profile?.role === "admin" ? "Super Admin" : profile?.role === "merchant" ? "Comercio" : "Cliente"}
                </span>
                <span className="text-xs text-[var(--neutral-400)]">
                  Nivel {LEVELS[profile?.level || 1]}
                </span>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-600)] mb-1.5">
                <User size={14} className="inline mr-1.5" />
                Nombre completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 text-[var(--neutral-800)] focus:outline-none focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] transition-all"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={saveBasicInfo}
              disabled={saving}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save size={16} /> Guardar Nombre</>
              )}
            </motion.button>

            {saveResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                  saveResult.success ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-600"
                }`}
              >
                {saveResult.success ? <Check size={16} /> : <X size={16} />}
                {saveResult.message}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Email & Phone Changes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="font-bold text-[var(--neutral-800)] mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            <Shield size={18} className="text-[var(--ziesta-500)]" />
            Datos Sensibles
          </h3>
          <p className="text-xs text-[var(--neutral-400)] mb-4">
            Al cambiar email o teléfono se enviará un código de verificación cruzado por seguridad.
          </p>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-600)] mb-1.5">
                <Mail size={14} className="inline mr-1.5" />
                Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 text-[var(--neutral-800)] focus:outline-none focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={requestEmailChange}
                  disabled={verifyingEmail || newEmail === email}
                  className="px-4 py-3 rounded-xl bg-[rgba(139,70,255,0.08)] text-[var(--ziesta-600)] hover:bg-[rgba(139,70,255,0.15)] disabled:opacity-30 transition-all font-medium text-sm"
                >
                  <Send size={16} />
                </motion.button>
              </div>
              <p className="text-xs text-[var(--neutral-400)] mt-1">
                Se enviará un código a tu WhatsApp para confirmar el cambio
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-600)] mb-1.5">
                <Phone size={14} className="inline mr-1.5" />
                Teléfono WhatsApp
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+5493854..."
                  className="flex-1 px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 text-[var(--neutral-800)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={requestPhoneChange}
                  disabled={verifyingPhone || newPhone === phone || !newPhone}
                  className="px-4 py-3 rounded-xl bg-[rgba(139,70,255,0.08)] text-[var(--ziesta-600)] hover:bg-[rgba(139,70,255,0.15)] disabled:opacity-30 transition-all font-medium text-sm"
                >
                  <Send size={16} />
                </motion.button>
              </div>
              <p className="text-xs text-[var(--neutral-400)] mt-1">
                Se enviará un código a tu email para confirmar el cambio
              </p>
            </div>

            {/* Verification Code Input */}
            {pendingChange && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-xl bg-[rgba(139,70,255,0.04)] border border-[rgba(139,70,255,0.12)]"
              >
                <p className="text-sm font-medium text-[var(--neutral-700)] mb-3">
                  Ingresá el código de verificación:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="flex-1 px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.2)] bg-white text-center text-xl font-bold tracking-[0.3em] text-[var(--neutral-800)] focus:outline-none focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmVerification}
                    disabled={verifyCode.length !== 6}
                    className="btn-primary px-5 disabled:opacity-50"
                  >
                    <Check size={18} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {changeResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                  changeResult.success ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-600"
                }`}
              >
                {changeResult.success ? <Check size={16} /> : <X size={16} />}
                {changeResult.message}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Password Change */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="font-bold text-[var(--neutral-800)] mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            <Lock size={18} className="text-[var(--ziesta-500)]" />
            Cambiar Contraseña
          </h3>

          <div className="space-y-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 text-[var(--neutral-800)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] transition-all"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 text-[var(--neutral-800)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={changePassword}
              disabled={changingPassword || !newPassword || !confirmPassword}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              {changingPassword ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Lock size={16} /> Actualizar Contraseña</>
              )}
            </motion.button>

            {passwordResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                  passwordResult.success ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-600"
                }`}
              >
                {passwordResult.success ? <Check size={16} /> : <X size={16} />}
                {passwordResult.message}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
