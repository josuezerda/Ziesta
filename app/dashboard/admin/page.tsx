"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Store,
  Coins,
  Gift,
  Award,
  LogOut,
  ChevronRight,
  Shield,
  Activity,
  Zap,
  Phone,
  MessageCircle,
  Send,
  Plus,
  Settings,
  Check,
  X,
  Radio
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Tab = "overview" | "users" | "merchants" | "transactions" | "badges" | "campaigns" | "whatsapp" | "totems";

interface DashboardStats {
  totalUsers: number;
  totalMerchants: number;
  totalPointsEmitted: number;
  totalPointsRedeemed: number;
  totalTransactions: number;
  activeBadges: number;
}

interface UserRow {
  id: string;
  full_name: string;
  role: string;
  points_balance: number;
  level: number;
  total_points_earned: number;
  created_at: string;
}

interface MerchantRow {
  id: string;
  name: string;
  subscription_plan: string;
  is_active: boolean;
  merchant_points_balance: number;
  points_per_thousand: number;
  city: string;
  created_at: string;
  owner_id: string;
  profiles?: { full_name: string; email?: string };
}

interface TransactionRow {
  id: string;
  type: string;
  points: number;
  description: string;
  purchase_amount: number;
  created_at: string;
  client_id: string;
  merchant_id: string;
  tx_hash?: string;
}

interface BadgeRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  bonus_points: number;
}

interface CampaignRow {
  id: string;
  title: string;
  message: string;
  image_url?: string;
  button_text?: string;
  button_url?: string;
  target_filter?: any;
  target_count: number;
  sent_count: number;
  failed_count: number;
  status: 'draft'|'sending'|'completed'|'cancelled';
  created_by: string;
  created_at: string;
  completed_at?: string;
}

interface WhatsAppNumberRow {
  id: string;
  merchant_id: string;
  phone_number: string;
  label: string;
  can_emit: boolean;
  can_validate: boolean;
  can_stamp: boolean;
  created_at: string;
  merchants?: { name: string };
}

interface WhatsAppConfigRow {
  id: string;
  number_id: string;
  jwt_token: string;
  verify_token: string;
  webhook_url: string;
  is_active: boolean;
}

const LEVEL_NAMES = ["", "Siestero 🌙", "Soñador ☀️", "Leyenda 🌟"];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMerchants: 0,
    totalPointsEmitted: 0,
    totalPointsRedeemed: 0,
    totalTransactions: 0,
    activeBadges: 0,
  });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [merchants, setMerchants] = useState<MerchantRow[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [whatsappNumbers, setWhatsappNumbers] = useState<WhatsAppNumberRow[]>([]);
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfigRow | null>(null);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Transaction Filters
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('all');

  // Campaign Form State
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ title: '', message: '', image_url: '', button_text: '', button_url: '' });

  // WhatsApp Config Form State
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [configForm, setConfigForm] = useState({ number_id: '', jwt_token: '', verify_token: '', webhook_url: '', is_active: false });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    // Load all data in parallel
    const [usersRes, merchantsRes, txRes, badgesRes, campaignsRes, waNumbersRes, waConfigRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("merchants").select("*, profiles(full_name)").order("created_at", { ascending: false }),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("badges").select("*").order("requirement_value", { ascending: true }),
      supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
      supabase.from("whatsapp_numbers").select("*, merchants(name)").order("created_at", { ascending: false }),
      supabase.from("whatsapp_config").select("*").limit(1)
    ]);

    const usersData = usersRes.data || [];
    const merchantsData = merchantsRes.data || [];
    const txData = txRes.data || [];
    const badgesData = badgesRes.data || [];
    const campaignsData = campaignsRes.data || [];
    const waNumbersData = waNumbersRes.data || [];
    const waConfigData = waConfigRes.data?.[0] || null;

    setUsers(usersData);
    setMerchants(merchantsData);
    setTransactions(txData);
    setBadges(badgesData);
    setCampaigns(campaignsData);
    setWhatsappNumbers(waNumbersData);
    setWhatsappConfig(waConfigData);

    // Calc stats
    const earned = txData.filter((t) => t.type === "earn" || t.type === "bonus").reduce((s, t) => s + t.points, 0);
    const redeemed = txData.filter((t) => t.type === "redeem").reduce((s, t) => s + t.points, 0);

    setStats({
      totalUsers: usersData.length,
      totalMerchants: merchantsData.length,
      totalPointsEmitted: earned,
      totalPointsRedeemed: redeemed,
      totalTransactions: txData.length,
      activeBadges: badgesData.length,
    });

    setLoading(false);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data, error } = await supabase.from('campaigns').insert({
      title: newCampaign.title,
      message: newCampaign.message,
      image_url: newCampaign.image_url,
      button_text: newCampaign.button_text,
      button_url: newCampaign.button_url,
      status: 'draft',
      created_by: user.id
    }).select().single();
    
    if (!error && data) {
      setCampaigns([data, ...campaigns]);
      setShowCampaignForm(false);
      setNewCampaign({ title: '', message: '', image_url: '', button_text: '', button_url: '' });
    }
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    
    let res;
    if (whatsappConfig?.id) {
       res = await supabase.from('whatsapp_config').update({
         number_id: configForm.number_id,
         jwt_token: configForm.jwt_token,
         verify_token: configForm.verify_token,
         webhook_url: configForm.webhook_url,
         is_active: configForm.is_active
       }).eq('id', whatsappConfig.id).select().single();
    } else {
       res = await supabase.from('whatsapp_config').insert({
         number_id: configForm.number_id,
         jwt_token: configForm.jwt_token,
         verify_token: configForm.verify_token,
         webhook_url: configForm.webhook_url,
         is_active: configForm.is_active
       }).select().single();
    }
    
    if (!res.error && res.data) {
       setWhatsappConfig(res.data);
       setShowConfigForm(false);
    }
  }

  const openConfigForm = () => {
    setConfigForm({
      number_id: whatsappConfig?.number_id || '',
      jwt_token: whatsappConfig?.jwt_token || '',
      verify_token: whatsappConfig?.verify_token || '',
      webhook_url: whatsappConfig?.webhook_url || '',
      is_active: whatsappConfig?.is_active || false
    });
    setShowConfigForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="w-10 h-10 border-3 border-[var(--ziesta-300)] border-t-[var(--ziesta-600)] rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Vista General", icon: LayoutDashboard },
    { id: "users", label: "Usuarios", icon: Users },
    { id: "merchants", label: "Comercios", icon: Store },
    { id: "transactions", label: "Transacciones", icon: Activity },
    { id: "badges", label: "Insignias", icon: Award },
    { id: "campaigns", label: "Campañas", icon: Send },
    { id: "whatsapp", label: "WhatsApp", icon: Phone },
    { id: "totems", label: "Tótems (Próximamente)", icon: Radio },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-[rgba(139,70,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/ziesta-logo.png" alt="Ziesta" width={32} height={32} />
              <span className="text-lg font-bold text-gradient" style={{ fontFamily: "var(--font-outfit)" }}>
                Ziesta
              </span>
            </Link>
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[rgba(239,71,111,0.08)] text-[var(--accent-pink)] font-semibold border border-[rgba(239,71,111,0.12)]">
              <Shield size={12} />
              Super Admin
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 p-2 rounded-xl hover:bg-[rgba(139,70,255,0.06)] text-[var(--neutral-500)] hover:text-[var(--ziesta-600)] transition-all text-sm"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--neutral-900)]" style={{ fontFamily: "var(--font-outfit)" }}>
            Panel de Control 🛡️
          </h1>
          <p className="text-[var(--neutral-500)] text-sm">
            Vista completa del ecosistema Ziesta
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-[var(--ziesta-500)] text-white shadow-md"
                  : "text-[var(--neutral-500)] hover:bg-[rgba(139,70,255,0.06)] hover:text-[var(--ziesta-600)]"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══════ OVERVIEW TAB ═══════ */}
        {tab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                { icon: Users, label: "Usuarios totales", value: stats.totalUsers, color: "var(--ziesta-500)" },
                { icon: Store, label: "Comercios adheridos", value: stats.totalMerchants, color: "var(--accent-cyan)" },
                { icon: Coins, label: "Puntos emitidos", value: stats.totalPointsEmitted, color: "var(--accent-gold)" },
                { icon: Gift, label: "Puntos canjeados", value: stats.totalPointsRedeemed, color: "var(--accent-pink)" },
                { icon: Activity, label: "Transacciones", value: stats.totalTransactions, color: "var(--ziesta-600)" },
                { icon: Award, label: "Insignias activas", value: stats.activeBadges, color: "var(--accent-blue)" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card p-5"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${stat.color}12`, color: stat.color }}
                  >
                    <stat.icon size={20} />
                  </div>
                  <p className="text-2xl font-bold text-[var(--neutral-900)]" style={{ fontFamily: "var(--font-outfit)" }}>
                    {stat.value.toLocaleString("es-AR")}
                  </p>
                  <p className="text-xs text-[var(--neutral-400)] mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Quick view tables */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent users */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[var(--neutral-800)]" style={{ fontFamily: "var(--font-outfit)" }}>
                    Últimos Usuarios
                  </h3>
                  <button onClick={() => setTab("users")} className="text-xs text-[var(--ziesta-500)] font-semibold hover:underline flex items-center gap-1">
                    Ver todos <ChevronRight size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {users.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[rgba(139,70,255,0.03)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                          u.role === "admin" ? "bg-[var(--accent-pink)]" : u.role === "merchant" ? "bg-[var(--accent-cyan)]" : "bg-[var(--ziesta-400)]"
                        }`}>
                          {u.full_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--neutral-800)]">{u.full_name || "Sin nombre"}</p>
                          <p className="text-xs text-[var(--neutral-400)]">{u.role}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[var(--ziesta-500)]">
                        {u.points_balance?.toLocaleString("es-AR") || 0} pts
                      </span>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <p className="text-sm text-[var(--neutral-400)] text-center py-6">No hay usuarios aún</p>
                  )}
                </div>
              </div>

              {/* Recent transactions */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[var(--neutral-800)]" style={{ fontFamily: "var(--font-outfit)" }}>
                    Últimas Transacciones
                  </h3>
                  <button onClick={() => setTab("transactions")} className="text-xs text-[var(--ziesta-500)] font-semibold hover:underline flex items-center gap-1">
                    Ver todas <ChevronRight size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[rgba(139,70,255,0.03)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                          tx.type === "earn" || tx.type === "bonus" ? "bg-[var(--accent-cyan)]" : "bg-[var(--accent-pink)]"
                        }`}>
                          {tx.type === "earn" || tx.type === "bonus" ? "+" : "-"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--neutral-800)]">{tx.description || tx.type}</p>
                          <p className="text-xs text-[var(--neutral-400)]">
                            {new Date(tx.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${tx.type === "earn" || tx.type === "bonus" ? "text-[var(--accent-cyan)]" : "text-[var(--accent-pink)]"}`}>
                        {tx.type === "earn" || tx.type === "bonus" ? "+" : "-"}{tx.points.toLocaleString("es-AR")}
                      </span>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-sm text-[var(--neutral-400)] text-center py-6">No hay transacciones aún</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════ USERS TAB ═══════ */}
        {tab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-[var(--neutral-800)]" style={{ fontFamily: "var(--font-outfit)" }}>
                  Todos los Usuarios ({users.length})
                </h3>
                <div className="flex gap-2">
                  {["client", "merchant", "admin"].map((r) => {
                    const count = users.filter((u) => u.role === r).length;
                    return (
                      <span key={r} className="text-xs px-2.5 py-1 rounded-full bg-[rgba(139,70,255,0.06)] text-[var(--neutral-600)] font-medium">
                        {r}: {count}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgba(139,70,255,0.08)]">
                      <th className="text-left py-3 px-3 text-[var(--neutral-500)] font-medium">Nombre</th>
                      <th className="text-left py-3 px-3 text-[var(--neutral-500)] font-medium">Rol</th>
                      <th className="text-right py-3 px-3 text-[var(--neutral-500)] font-medium">Balance</th>
                      <th className="text-right py-3 px-3 text-[var(--neutral-500)] font-medium">Total Ganado</th>
                      <th className="text-center py-3 px-3 text-[var(--neutral-500)] font-medium">Nivel</th>
                      <th className="text-right py-3 px-3 text-[var(--neutral-500)] font-medium">Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-[rgba(139,70,255,0.04)] hover:bg-[rgba(139,70,255,0.02)]">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                              u.role === "admin" ? "bg-[var(--accent-pink)]" : u.role === "merchant" ? "bg-[var(--accent-cyan)]" : "bg-[var(--ziesta-400)]"
                            }`}>
                              {u.full_name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <span className="font-medium text-[var(--neutral-800)]">{u.full_name || "Sin nombre"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
                            u.role === "admin"
                              ? "bg-[rgba(239,71,111,0.1)] text-[var(--accent-pink)]"
                              : u.role === "merchant"
                              ? "bg-[rgba(6,214,160,0.1)] text-[var(--accent-cyan)]"
                              : "bg-[rgba(139,70,255,0.08)] text-[var(--ziesta-500)]"
                          }`}>
                            {u.role === "admin" ? "Admin" : u.role === "merchant" ? "Comercio" : "Cliente"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-[var(--ziesta-600)]">
                          {(u.points_balance || 0).toLocaleString("es-AR")}
                        </td>
                        <td className="py-3 px-3 text-right text-[var(--neutral-600)]">
                          {(u.total_points_earned || 0).toLocaleString("es-AR")}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-xs font-semibold">{LEVEL_NAMES[u.level || 1]}</span>
                        </td>
                        <td className="py-3 px-3 text-right text-[var(--neutral-400)] text-xs">
                          {new Date(u.created_at).toLocaleDateString("es-AR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════ MERCHANTS TAB ═══════ */}
        {tab === "merchants" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg text-[var(--neutral-800)] mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
                Comercios Adheridos ({merchants.length})
              </h3>
              {merchants.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(139,70,255,0.05)] flex items-center justify-center mb-4">
                    <Store size={28} className="text-[var(--neutral-300)]" />
                  </div>
                  <p className="text-[var(--neutral-400)]">No hay comercios registrados aún</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(139,70,255,0.08)]">
                        <th className="text-left py-3 px-3 text-[var(--neutral-500)] font-medium">Comercio</th>
                        <th className="text-left py-3 px-3 text-[var(--neutral-500)] font-medium">Dueño</th>
                        <th className="text-center py-3 px-3 text-[var(--neutral-500)] font-medium">Plan</th>
                        <th className="text-right py-3 px-3 text-[var(--neutral-500)] font-medium">Pts/$1000</th>
                        <th className="text-right py-3 px-3 text-[var(--neutral-500)] font-medium">Pts Acum.</th>
                        <th className="text-center py-3 px-3 text-[var(--neutral-500)] font-medium">Estado</th>
                        <th className="text-right py-3 px-3 text-[var(--neutral-500)] font-medium">Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {merchants.map((m) => (
                        <tr key={m.id} className="border-b border-[rgba(139,70,255,0.04)] hover:bg-[rgba(139,70,255,0.02)]">
                          <td className="py-3 px-3 font-medium text-[var(--neutral-800)]">{m.name}</td>
                          <td className="py-3 px-3 text-[var(--neutral-600)]">{m.profiles?.full_name || "-"}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                              m.subscription_plan === "premium"
                                ? "bg-[rgba(255,209,102,0.15)] text-[var(--accent-gold)]"
                                : m.subscription_plan === "enterprise"
                                ? "bg-[rgba(139,70,255,0.1)] text-[var(--ziesta-600)]"
                                : "bg-[var(--neutral-100)] text-[var(--neutral-500)]"
                            }`}>
                              {m.subscription_plan}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-[var(--neutral-600)]">{m.points_per_thousand}</td>
                          <td className="py-3 px-3 text-right font-semibold text-[var(--ziesta-600)]">
                            {(m.merchant_points_balance || 0).toLocaleString("es-AR")}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex w-2.5 h-2.5 rounded-full ${m.is_active ? "bg-[var(--accent-cyan)]" : "bg-[var(--neutral-300)]"}`} />
                          </td>
                          <td className="py-3 px-3 text-right text-[var(--neutral-400)] text-xs">
                            {new Date(m.created_at).toLocaleDateString("es-AR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══════ TRANSACTIONS TAB ═══════ */}
        {tab === "transactions" && (() => {
          const filteredTx = transactions.filter(tx => {
            const matchesSearch = tx.id.includes(txSearch) || (tx.description && tx.description.toLowerCase().includes(txSearch.toLowerCase())) || (tx.tx_hash && tx.tx_hash.includes(txSearch));
            const matchesType = txTypeFilter === 'all' || tx.type === txTypeFilter || (txTypeFilter === 'earn' && tx.type === 'bonus');
            return matchesSearch && matchesType;
          });
          return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="font-bold text-lg text-[var(--neutral-800)]" style={{ fontFamily: "var(--font-outfit)" }}>
                  Últimas Transacciones
                </h3>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Buscar hash o ID..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:outline-none focus:border-[var(--ziesta-400)] text-sm w-full sm:w-64"
                  />
                  <select
                    value={txTypeFilter}
                    onChange={(e) => setTxTypeFilter(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:outline-none focus:border-[var(--ziesta-400)] text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="earn">Emisiones</option>
                    <option value="redeem">Canjes</option>
                  </select>
                </div>
              </div>
              {filteredTx.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(139,70,255,0.05)] flex items-center justify-center mb-4">
                    <Activity size={28} className="text-[var(--neutral-300)]" />
                  </div>
                  <p className="text-[var(--neutral-400)]">No hay transacciones registradas aún</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(139,70,255,0.08)]">
                        <th className="text-left py-3 px-3 text-[var(--neutral-500)] font-medium">Hash / ID</th>
                        <th className="text-left py-3 px-3 text-[var(--neutral-500)] font-medium">Tipo</th>
                        <th className="text-left py-3 px-3 text-[var(--neutral-500)] font-medium">Descripción</th>
                        <th className="text-right py-3 px-3 text-[var(--neutral-500)] font-medium">Puntos</th>
                        <th className="text-right py-3 px-3 text-[var(--neutral-500)] font-medium">Monto</th>
                        <th className="text-right py-3 px-3 text-[var(--neutral-500)] font-medium">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTx.map((tx) => (
                        <tr key={tx.id} className="border-b border-[rgba(139,70,255,0.04)] hover:bg-[rgba(139,70,255,0.02)]">
                          <td className="py-3 px-3 text-[var(--neutral-400)] text-xs font-mono">
                            {tx.tx_hash ? `${tx.tx_hash.slice(0,10)}...` : tx.id.split('-')[0]}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
                              tx.type === "earn" || tx.type === "bonus"
                                ? "bg-[rgba(6,214,160,0.1)] text-[var(--accent-cyan)]"
                                : tx.type === "stamp_reward"
                                ? "bg-[rgba(255,209,102,0.15)] text-[var(--accent-gold)]"
                                : "bg-[rgba(239,71,111,0.1)] text-[var(--accent-pink)]"
                            }`}>
                              {tx.type === "earn" ? "Emisión" : tx.type === "redeem" ? "Canje" : tx.type === "bonus" ? "Bonus" : "Premio"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[var(--neutral-700)]">{tx.description || "-"}</td>
                          <td className={`py-3 px-3 text-right font-bold ${
                            tx.type === "earn" || tx.type === "bonus" ? "text-[var(--accent-cyan)]" : "text-[var(--accent-pink)]"
                          }`}>
                            {tx.type === "earn" || tx.type === "bonus" ? "+" : "-"}{tx.points.toLocaleString("es-AR")}
                          </td>
                          <td className="py-3 px-3 text-right text-[var(--neutral-600)]">
                            {tx.purchase_amount ? `$${Number(tx.purchase_amount).toLocaleString("es-AR")}` : "-"}
                          </td>
                          <td className="py-3 px-3 text-right text-[var(--neutral-400)] text-xs">
                            {new Date(tx.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )})()}

        {/* ═══════ BADGES TAB ═══════ */}
        {tab === "badges" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg text-[var(--neutral-800)] mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
                Sistema de Insignias ({badges.length})
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge, i) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-5 rounded-2xl border border-[rgba(139,70,255,0.08)] bg-white hover:border-[rgba(139,70,255,0.2)] hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[rgba(139,70,255,0.08)] flex items-center justify-center shrink-0">
                        <Award size={24} className="text-[var(--ziesta-500)]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--neutral-800)] mb-1">{badge.name}</h4>
                        <p className="text-xs text-[var(--neutral-500)] mb-3">{badge.description}</p>
                        <div className="flex gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(139,70,255,0.06)] text-[var(--ziesta-600)] font-medium">
                            {badge.requirement_type}: {badge.requirement_value}
                          </span>
                          {badge.bonus_points > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(6,214,160,0.08)] text-[var(--accent-cyan)] font-medium flex items-center gap-1">
                              <Zap size={10} />
                              +{badge.bonus_points} pts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════ CAMPAIGNS TAB ═══════ */}
        {tab === "campaigns" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-[var(--neutral-800)]" style={{ fontFamily: "var(--font-outfit)" }}>
                  Campañas de Marketing ({campaigns.length})
                </h3>
                <button
                  onClick={() => setShowCampaignForm(!showCampaignForm)}
                  className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
                >
                  {showCampaignForm ? <X size={16} /> : <Plus size={16} />}
                  {showCampaignForm ? "Cancelar" : "Nueva Campaña"}
                </button>
              </div>

              {showCampaignForm && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="mb-8 p-5 bg-[var(--neutral-100)] rounded-xl border border-[var(--neutral-200)]"
                  onSubmit={handleCreateCampaign}
                >
                  <h4 className="font-semibold text-[var(--neutral-800)] mb-4">Crear Nueva Campaña</h4>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--neutral-600)] mb-1">Título</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-300)] focus:border-[var(--ziesta-500)] outline-none text-sm"
                        value={newCampaign.title}
                        onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--neutral-600)] mb-1">URL de Imagen (Opcional)</label>
                      <input 
                        type="url" 
                        className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-300)] focus:border-[var(--ziesta-500)] outline-none text-sm"
                        value={newCampaign.image_url}
                        onChange={(e) => setNewCampaign({...newCampaign, image_url: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-[var(--neutral-600)] mb-1">Mensaje</label>
                      <textarea 
                        required
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-300)] focus:border-[var(--ziesta-500)] outline-none text-sm resize-none"
                        value={newCampaign.message}
                        onChange={(e) => setNewCampaign({...newCampaign, message: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--neutral-600)] mb-1">Texto del Botón (Opcional)</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-300)] focus:border-[var(--ziesta-500)] outline-none text-sm"
                        value={newCampaign.button_text}
                        onChange={(e) => setNewCampaign({...newCampaign, button_text: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--neutral-600)] mb-1">URL del Botón (Opcional)</label>
                      <input 
                        type="url" 
                        className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-300)] focus:border-[var(--ziesta-500)] outline-none text-sm"
                        value={newCampaign.button_url}
                        onChange={(e) => setNewCampaign({...newCampaign, button_url: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary text-sm px-6 py-2 flex items-center gap-2">
                      <Send size={16} /> Guardar Borrador
                    </button>
                  </div>
                </motion.form>
              )}

              {campaigns.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(139,70,255,0.05)] flex items-center justify-center mb-4">
                    <MessageCircle size={28} className="text-[var(--neutral-300)]" />
                  </div>
                  <p className="text-[var(--neutral-400)]">No hay campañas creadas aún</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {campaigns.map((camp) => (
                    <div key={camp.id} className="p-5 rounded-2xl border border-[rgba(139,70,255,0.08)] hover:shadow-sm transition-all bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-[var(--neutral-800)]">{camp.title}</h4>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          camp.status === 'completed' ? 'bg-[rgba(6,214,160,0.1)] text-[var(--accent-cyan)]' :
                          camp.status === 'sending' ? 'bg-[rgba(255,209,102,0.15)] text-[var(--accent-gold)]' :
                          camp.status === 'cancelled' ? 'bg-[rgba(239,71,111,0.1)] text-[var(--accent-pink)]' :
                          'bg-[var(--neutral-100)] text-[var(--neutral-500)]'
                        }`}>
                          {camp.status === 'completed' ? 'Completada' :
                           camp.status === 'sending' ? 'Enviando...' :
                           camp.status === 'cancelled' ? 'Cancelada' : 'Borrador'}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--neutral-500)] line-clamp-2 mb-4">{camp.message}</p>
                      
                      <div className="flex items-center justify-between text-xs text-[var(--neutral-500)]">
                        <div className="flex flex-col gap-1">
                          <span>Creada: {new Date(camp.created_at).toLocaleDateString()}</span>
                          <span className="font-semibold text-[var(--ziesta-600)]">
                            Progreso: {camp.sent_count} / {camp.target_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══════ WHATSAPP TAB ═══════ */}
        {tab === "whatsapp" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
            
            {/* WhatsApp System Config */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(6,214,160,0.1)] text-[var(--accent-cyan)] flex items-center justify-center">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[var(--neutral-800)]" style={{ fontFamily: "var(--font-outfit)" }}>
                      Configuración de API WhatsApp
                    </h3>
                    <p className="text-xs text-[var(--neutral-500)]">Credenciales de Meta para enviar y recibir mensajes</p>
                  </div>
                </div>
                <button 
                  onClick={openConfigForm}
                  className="px-4 py-2 bg-[rgba(139,70,255,0.06)] text-[var(--ziesta-600)] font-medium text-sm rounded-xl hover:bg-[rgba(139,70,255,0.1)] transition-all"
                >
                  Editar
                </button>
              </div>

              {showConfigForm ? (
                <motion.form 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[var(--neutral-50)] p-5 rounded-xl border border-[var(--neutral-200)]"
                  onSubmit={handleSaveConfig}
                >
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--neutral-600)] mb-1">Number ID</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-300)] focus:border-[var(--ziesta-500)] outline-none text-sm"
                        value={configForm.number_id}
                        onChange={(e) => setConfigForm({...configForm, number_id: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--neutral-600)] mb-1">Verify Token (Webhook)</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-300)] focus:border-[var(--ziesta-500)] outline-none text-sm"
                        value={configForm.verify_token}
                        onChange={(e) => setConfigForm({...configForm, verify_token: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-[var(--neutral-600)] mb-1">System User Access Token (JWT)</label>
                      <input 
                        type="password" 
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-300)] focus:border-[var(--ziesta-500)] outline-none text-sm"
                        value={configForm.jwt_token}
                        onChange={(e) => setConfigForm({...configForm, jwt_token: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-[var(--neutral-600)] mb-1">Webhook URL</label>
                      <input 
                        type="url" 
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--neutral-300)] focus:border-[var(--ziesta-500)] outline-none text-sm"
                        value={configForm.webhook_url}
                        onChange={(e) => setConfigForm({...configForm, webhook_url: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="is_active"
                        className="rounded text-[var(--ziesta-500)] focus:ring-[var(--ziesta-500)]"
                        checked={configForm.is_active}
                        onChange={(e) => setConfigForm({...configForm, is_active: e.target.checked})}
                      />
                      <label htmlFor="is_active" className="text-sm font-medium text-[var(--neutral-700)]">
                        Activar integración de WhatsApp
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowConfigForm(false)} className="px-4 py-2 text-sm text-[var(--neutral-600)] hover:bg-[var(--neutral-200)] rounded-xl transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary text-sm px-6 py-2">
                      Guardar Configuración
                    </button>
                  </div>
                </motion.form>
              ) : (
                <div className="bg-[var(--neutral-50)] p-4 rounded-xl flex items-center gap-4 border border-[var(--neutral-200)]">
                  <div className={`w-3 h-3 rounded-full ${whatsappConfig?.is_active ? 'bg-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)]' : 'bg-[var(--neutral-400)]'}`} />
                  <div>
                    <p className="text-sm font-medium text-[var(--neutral-800)]">
                      {whatsappConfig?.is_active ? 'Integración Activa' : 'Integración Inactiva'}
                    </p>
                    <p className="text-xs text-[var(--neutral-500)]">
                      Number ID: {whatsappConfig?.number_id || 'No configurado'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Merchant WhatsApp Numbers */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg text-[var(--neutral-800)] mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
                Números Autorizados de Comercios ({whatsappNumbers.length})
              </h3>
              
              {whatsappNumbers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(6,214,160,0.1)] flex items-center justify-center mb-4">
                    <Phone size={28} className="text-[var(--accent-cyan)]" />
                  </div>
                  <p className="text-[var(--neutral-400)]">No hay números de WhatsApp registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(139,70,255,0.08)]">
                        <th className="text-left py-3 px-3 text-[var(--neutral-500)] font-medium">Comercio</th>
                        <th className="text-left py-3 px-3 text-[var(--neutral-500)] font-medium">Número / Etiqueta</th>
                        <th className="text-center py-3 px-3 text-[var(--neutral-500)] font-medium">Emitir</th>
                        <th className="text-center py-3 px-3 text-[var(--neutral-500)] font-medium">Validar</th>
                        <th className="text-center py-3 px-3 text-[var(--neutral-500)] font-medium">Sellar</th>
                        <th className="text-right py-3 px-3 text-[var(--neutral-500)] font-medium">Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {whatsappNumbers.map((wn) => (
                        <tr key={wn.id} className="border-b border-[rgba(139,70,255,0.04)] hover:bg-[rgba(139,70,255,0.02)]">
                          <td className="py-3 px-3 font-medium text-[var(--neutral-800)]">{wn.merchants?.name || "Desconocido"}</td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-[var(--ziesta-600)]">{wn.phone_number}</div>
                            <div className="text-xs text-[var(--neutral-500)]">{wn.label}</div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {wn.can_emit ? <Check size={16} className="mx-auto text-[var(--accent-cyan)]" /> : <X size={16} className="mx-auto text-[var(--neutral-300)]" />}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {wn.can_validate ? <Check size={16} className="mx-auto text-[var(--accent-cyan)]" /> : <X size={16} className="mx-auto text-[var(--neutral-300)]" />}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {wn.can_stamp ? <Check size={16} className="mx-auto text-[var(--accent-cyan)]" /> : <X size={16} className="mx-auto text-[var(--neutral-300)]" />}
                          </td>
                          <td className="py-3 px-3 text-right text-[var(--neutral-400)] text-xs">
                            {new Date(wn.created_at).toLocaleDateString("es-AR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Quick Access Auditing */}
        <div className="mt-12 text-center pb-8">
          <Link href="/#ziestascan" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--neutral-900)] text-white font-medium hover:scale-105 transition-transform shadow-lg group">
             <Shield size={18} className="text-[var(--accent-cyan)] group-hover:rotate-12 transition-transform" />
             Auditar Transacción (ZiestaScan)
          </Link>
        </div>
      </div>
    </div>
  );
}
