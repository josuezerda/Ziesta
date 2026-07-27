"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Store,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Role = "client" | "merchant";

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("client");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Auto redirect after short delay
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 2000);
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-4"
      >
        <div className="glass-card p-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto rounded-full bg-[rgba(6,214,160,0.1)] flex items-center justify-center mb-6"
          >
            <Image
              src="/ziesta-logo.png"
              alt="Ziesta"
              width={48}
              height={48}
              className="animate-float"
            />
          </motion.div>
          <h2
            className="text-2xl font-bold text-[var(--neutral-900)] mb-3"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            ¡Bienvenido a Ziesta! 🎉
          </h2>
          <p className="text-[var(--neutral-500)] mb-2">
            Tu cuenta fue creada exitosamente.
          </p>
          <p className="text-sm text-[var(--neutral-400)]">
            Redirigiendo al panel...
          </p>
          <div className="mt-6">
            <div className="w-8 h-8 mx-auto border-2 border-[var(--ziesta-300)] border-t-[var(--ziesta-600)] rounded-full animate-spin" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-4"
    >
      <div className="glass-card p-8 sm:p-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-3 mb-4"
            >
              <Image
                src="/ziesta-logo.png"
                alt="Ziesta"
                width={48}
                height={48}
                className="drop-shadow-lg"
              />
              <span
                className="text-2xl font-bold text-gradient"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Ziesta
              </span>
            </motion.div>
          </Link>
          <h1
            className="text-2xl font-bold text-[var(--neutral-900)] mb-2"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Creá tu cuenta
          </h1>
          <p className="text-[var(--neutral-500)] text-sm">
            Empezá a sumar puntos y beneficios hoy mismo
          </p>
        </div>

        {/* Role selector */}
        <div className="flex gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setRole("client")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm transition-all border ${
              role === "client"
                ? "bg-[var(--ziesta-500)] text-white border-[var(--ziesta-500)] shadow-md"
                : "bg-white/50 text-[var(--neutral-600)] border-[rgba(139,70,255,0.12)] hover:border-[var(--ziesta-300)]"
            }`}
          >
            <Users size={18} />
            Soy Cliente
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setRole("merchant")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm transition-all border ${
              role === "merchant"
                ? "bg-[var(--ziesta-500)] text-white border-[var(--ziesta-500)] shadow-md"
                : "bg-white/50 text-[var(--neutral-600)] border-[rgba(139,70,255,0.12)] hover:border-[var(--ziesta-300)]"
            }`}
          >
            <Store size={18} />
            Soy Comercio
          </motion.button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
              {role === "merchant" ? "Nombre del responsable" : "Nombre completo"}
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]"
              />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={
                  role === "merchant" ? "Juan Pérez" : "Tu nombre"
                }
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 text-[var(--neutral-800)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
              Email
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 text-[var(--neutral-800)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 text-[var(--neutral-800)] placeholder:text-[var(--neutral-400)] focus:outline-none focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--neutral-400)] hover:text-[var(--neutral-600)] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {role === "merchant"
                  ? "Registrar mi Comercio"
                  : "Crear mi Cuenta"}
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        {/* Login link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--neutral-500)]">
            ¿Ya tenés cuenta?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-[var(--ziesta-600)] hover:text-[var(--ziesta-700)] transition-colors"
            >
              Iniciá sesión
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs text-[var(--neutral-400)] hover:text-[var(--neutral-600)] transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
