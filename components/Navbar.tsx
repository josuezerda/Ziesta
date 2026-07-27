"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Sparkles, LogIn, User, LogOut, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navLinks = [
  { label: "Inicio", href: "#hero" },
  { label: "Beneficios", href: "#features" },
  { label: "Cómo Funciona", href: "#how-it-works" },
  { label: "Ecosistema", href: "#ecosystem" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Programas", href: "#programas" },
  { label: "Contacto", href: "#cta" },
];

interface UserInfo {
  name: string;
  role: string;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    checkAuth();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function checkAuth() {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", authUser.id)
        .single();
      if (profile) {
        setUser({ name: profile.full_name || authUser.email || "", role: profile.role });
      }
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  }

  const dashboardPath = user?.role === "admin"
    ? "/dashboard/admin"
    : user?.role === "merchant"
    ? "/dashboard/merchant"
    : "/dashboard/client";

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass shadow-[var(--shadow-md)] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="#hero"
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="relative w-10 h-10">
              <Image
                src="/ziesta-logo.png"
                alt="Ziesta"
                fill
                className="object-contain drop-shadow-md group-hover:drop-shadow-lg transition-all duration-300"
              />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              <span className="text-gradient">Ziesta</span>
            </span>
          </motion.a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-[var(--neutral-600)] hover:text-[var(--ziesta-600)] rounded-full hover:bg-[rgba(139,70,255,0.06)] transition-all duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Section: Auth + Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Auth Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {user ? (
                /* === LOGGED IN === */
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[rgba(139,70,255,0.06)] border border-[rgba(139,70,255,0.1)] hover:border-[rgba(139,70,255,0.25)] transition-all"
                  >
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold ${
                      user.role === "admin" ? "bg-[var(--accent-pink)]" :
                      user.role === "merchant" ? "bg-[var(--accent-cyan)]" :
                      "bg-[var(--ziesta-500)]"
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-[var(--neutral-700)] max-w-[80px] sm:max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white shadow-xl border border-[rgba(139,70,255,0.08)] overflow-hidden"
                      >
                        <div className="p-3 border-b border-[rgba(139,70,255,0.06)]">
                          <p className="text-sm font-semibold text-[var(--neutral-800)] truncate">{user.name}</p>
                          <p className="text-xs text-[var(--neutral-400)] capitalize">{user.role === "admin" ? "Super Admin" : user.role === "merchant" ? "Comercio" : "Cliente"}</p>
                        </div>
                        <div className="p-1.5">
                          <Link
                            href={dashboardPath}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--neutral-700)] hover:bg-[rgba(139,70,255,0.05)] hover:text-[var(--ziesta-600)] transition-all"
                          >
                            <LayoutDashboard size={16} />
                            Mi Panel
                          </Link>
                          <Link
                            href="/dashboard/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--neutral-700)] hover:bg-[rgba(139,70,255,0.05)] hover:text-[var(--ziesta-600)] transition-all"
                          >
                            <User size={16} />
                            Mi Perfil
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--accent-pink)] hover:bg-[rgba(239,71,111,0.05)] transition-all"
                          >
                            <LogOut size={16} />
                            Cerrar Sesión
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* === NOT LOGGED IN === */
                <>
                  <Link href="/auth/login">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="btn-secondary w-[90px] sm:w-[110px] justify-center text-[11px] sm:text-xs font-semibold py-2 px-0"
                    >
                      Ingresar
                    </motion.button>
                  </Link>
                  <Link href="/auth/register">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="btn-primary w-[90px] sm:w-[110px] justify-center text-[11px] sm:text-xs font-semibold py-2 px-0"
                    >
                      Registrate
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl hover:bg-[rgba(139,70,255,0.06)] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X size={24} className="text-[var(--ziesta-600)]" />
              ) : (
                <Menu size={24} className="text-[var(--neutral-700)]" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-40 pt-20 bg-white/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col items-center gap-2 p-6">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-4 text-lg font-medium text-[var(--neutral-700)] hover:text-[var(--ziesta-600)] rounded-2xl hover:bg-[rgba(139,70,255,0.05)] transition-all"
                >
                  {link.label}
                </motion.a>
              ))}

              {user ? (
                <>
                  <Link href={dashboardPath} className="w-full" onClick={() => setMobileOpen(false)}>
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="btn-secondary w-full justify-center text-lg py-4"
                    >
                      <LayoutDashboard size={20} />
                      Mi Panel
                    </motion.button>
                  </Link>
                  <Link href="/dashboard/profile" className="w-full" onClick={() => setMobileOpen(false)}>
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="btn-secondary w-full justify-center text-lg py-4"
                    >
                      <User size={20} />
                      Mi Perfil
                    </motion.button>
                  </Link>
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    onClick={() => { handleSignOut(); setMobileOpen(false); }}
                    className="w-full text-center py-4 text-lg font-medium text-[var(--accent-pink)] hover:bg-[rgba(239,71,111,0.05)] rounded-2xl transition-all"
                  >
                    Cerrar Sesión
                  </motion.button>
                </>
              ) : (
                <Link href="/auth/register" className="w-full" onClick={() => setMobileOpen(false)}>
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="btn-primary mt-4 w-full justify-center text-lg py-4"
                  >
                    <Sparkles size={20} />
                    Comenzar Gratis
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
