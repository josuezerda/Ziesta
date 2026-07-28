"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Store,
  Coins,
  Users,
  User,
  TrendingUp,
  QrCode,
  Gift,
  Clock,
  LogOut,
  Check,
  X,
  Zap,
  ArrowRight,
  Plus,
  Trash2,
  Edit,
  Phone,
  MessageCircle,
  Tag,
  Package,
  Award,
  Settings,
  ShoppingCart,
  Shield,
  Camera,
  CameraOff,
  Radio
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Interfaces
interface MerchantData {
  id: string;
  name: string;
  description: string;
  points_per_thousand: number;
  merchant_points_balance: number;
  is_active: boolean;
  subscription_plan: string;
}

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

interface Transaction {
  id: string;
  type: string;
  points: number;
  description: string;
  purchase_amount: number;
  created_at: string;
  client_id: string;
  profiles?: { full_name: string };
  tx_hash?: string;
}

interface Product {
  id: string;
  merchant_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_active: boolean;
}

interface StampCard {
  id: string;
  merchant_id: string;
  name: string;
  description: string;
  stamp_type: 'product' | 'amount' | 'visit';
  target_product_id?: string;
  min_amount?: number;
  stamps_required: number;
  reward_type: 'free_product' | 'discount_percent' | 'discount_fixed' | 'bonus_points' | 'free_service';
  reward_product_id?: string;
  reward_value?: number;
  reward_description?: string;
  is_active: boolean;
}

interface Promotion {
  id: string;
  merchant_id: string;
  title: string;
  description: string;
  discount_type: 'percent' | 'fixed' | 'points_multiplier';
  discount_value: number;
  points_cost: number;
  min_purchase?: number;
  start_date?: string;
  end_date?: string;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
}

interface WhatsAppNumber {
  id: string;
  merchant_id: string;
  phone: string;
  label: string;
  is_active: boolean;
  can_emit_points: boolean;
  can_validate_tokens: boolean;
  can_stamp: boolean;
}

const TABS = [
  { id: 'panel', label: 'Panel', icon: Store },
  { id: 'products', label: 'Productos', icon: Package },
  { id: 'stamp_cards', label: 'Tarjetas de Sellos', icon: Award },
  { id: 'promotions', label: 'Promociones', icon: Tag },
  { id: 'paquetes', label: 'Recargar Puntos', icon: ShoppingCart },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'totems', label: 'Mis Tótems', icon: Radio },
];

export default function MerchantDashboard() {
  const router = useRouter();

  // Core State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [activeTab, setActiveTab] = useState('panel');

  useEffect(() => {
    const saved = localStorage.getItem('merchantTab');
    if (saved) setActiveTab(saved);
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    localStorage.setItem('merchantTab', tabId);
  };

  // Panel State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txSearch, setTxSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("all");
  const [tokenInput, setTokenInput] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedClient, setScannedClient] = useState<string | null>(null);
  const [emitEmail, setEmitEmail] = useState("");
  const [emitAmount, setEmitAmount] = useState("");
  const [emitting, setEmitting] = useState(false);

  // Setup Form State
  const [merchantName, setMerchantName] = useState("");
  const [merchantDesc, setMerchantDesc] = useState("");
  const [pointsPerThousand, setPointsPerThousand] = useState("1");

  // CRUD Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [stampCards, setStampCards] = useState<StampCard[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [whatsappNumbers, setWhatsappNumbers] = useState<WhatsAppNumber[]>([]);
  const [totems, setTotems] = useState<any[]>([]);
  const [totemMedia, setTotemMedia] = useState<any[]>([]);
  const [totemSurprises, setTotemSurprises] = useState<any[]>([]);

  // Editing State
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Modal State
  const [modalType, setModalType] = useState<'product' | 'stamp_card' | 'promotion' | 'whatsapp' | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant) return;
    setIsSubmitting(true);
    const supabase = createClient();
    try {
      if (modalType === 'product') {
        await supabase.from('products').insert({
          merchant_id: merchant.id,
          name: formData.name,
          description: formData.description,
          price: formData.price || 0,
          is_active: true
        });
      } else if (modalType === 'stamp_card') {
        await supabase.from('stamp_cards').insert({
          merchant_id: merchant.id,
          name: formData.name,
          description: formData.description,
          stamp_type: 'visit',
          stamps_required: formData.stamps_required || 10,
          reward_type: formData.reward_type || 'free_product',
          is_active: true
        });
      } else if (modalType === 'promotion') {
        await supabase.from('promotions').insert({
          merchant_id: merchant.id,
          title: formData.title,
          description: formData.description,
          discount_type: 'percent',
          discount_value: formData.discount_value || 0,
          points_cost: formData.points_cost || 0,
          current_uses: 0,
          is_active: true
        });
      } else if (modalType === 'whatsapp') {
        await supabase.from('whatsapp_numbers').insert({
          merchant_id: merchant.id,
          phone: formData.phone,
          label: formData.label,
          is_active: true,
          can_emit_points: true,
          can_validate_tokens: true,
          can_stamp: true
        });
      }
      setModalType(null);
      setFormData({});
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profileData) setProfile(profileData);

    const { data: merchantData } = await supabase.from("merchants").select("*").eq("owner_id", user.id).single();

    if (merchantData) {
      setMerchant(merchantData);
      await Promise.all([
        loadTransactions(merchantData.id),
        loadProducts(merchantData.id),
        loadStampCards(merchantData.id),
        loadPromotions(merchantData.id),
        loadWhatsAppNumbers(merchantData.id)
      ]);
      const { data: t } = await supabase.from("totems").select("*").eq("merchant_id", merchantData.id);
      const { data: tm } = await supabase.from("totem_media").select("*"); // With RLS it only gets theirs
      const { data: ts } = await supabase.from("totem_surprises").select("*");
      setTotems(t || []);
      setTotemMedia(tm || []);
      setTotemSurprises(ts || []);
    } else {
      setShowSetup(true);
    }
    setLoading(false);
  }

  // Loaders
  async function loadTransactions(merchantId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("transactions").select("*").eq("merchant_id", merchantId).order("created_at", { ascending: false }).limit(20);
    if (data) setTransactions(data);
  }
  async function loadProducts(merchantId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("products").select("*").eq("merchant_id", merchantId);
    if (data) setProducts(data);
  }
  async function loadStampCards(merchantId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("stamp_cards").select("*").eq("merchant_id", merchantId);
    if (data) setStampCards(data);
  }
  async function loadPromotions(merchantId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("promotions").select("*").eq("merchant_id", merchantId);
    if (data) setPromotions(data);
  }
  async function loadWhatsAppNumbers(merchantId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("whatsapp_numbers").select("*").eq("merchant_id", merchantId);
    if (data) setWhatsappNumbers(data);
  }

  // Setup Handler
  async function createMerchant(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from("merchants").insert({
      owner_id: user.id,
      name: merchantName,
      description: merchantDesc,
      points_per_thousand: parseInt(pointsPerThousand) || 1,
    }).select().single();

    if (error) { alert("Error: " + error.message); return; }
    setMerchant(data);
    setShowSetup(false);
  }

  // Panel Handlers
  async function validateToken() {
    if (!merchant) return;
    setValidating(true);
    setValidationResult(null);
    const supabase = createClient();
    
    // Si es el nuevo código rotativo ZST-uuid-timestamp
    if (tokenInput.startsWith("ZST-")) {
      const parts = tokenInput.split('-');
      if (parts.length >= 2) {
        const clientId = parts.slice(1, parts.length - 1).join('-'); // Extract UUID
        setScannedClient(clientId);
        setValidationResult({ success: true, message: "Cliente identificado. Usá Emitir Puntos." });
      } else {
        setValidationResult({ success: false, message: "QR Inválido" });
      }
      setValidating(false);
      return;
    }

    if (tokenInput.length !== 6) {
      setValidating(false);
      return;
    }

    const { data, error } = await supabase.rpc("validate_redemption_token", {
      p_token_code: tokenInput,
      p_merchant_id: merchant.id,
    });
    if (error) setValidationResult({ success: false, message: error.message });
    else if (data && data.length > 0) {
      setValidationResult({ success: data[0].success, message: data[0].message });
      if (data[0].success) setTimeout(() => loadData(), 1500);
    }
    setValidating(false);
    setTokenInput("");
  }

  async function emitPoints(e: React.FormEvent) {
    e.preventDefault();
    if (!merchant || !emitAmount) return;
    setEmitting(true);
    const purchaseAmount = parseFloat(emitAmount);
    const points = Math.floor((purchaseAmount / 1000) * (merchant.points_per_thousand || 1));
    if (points <= 0) { alert("Monto insuficiente"); setEmitting(false); return; }
    alert(`Se emitirían ${points} Puntos Siesta por una compra de $${purchaseAmount.toLocaleString("es-AR")}.`);
    setEmitAmount("");
    setEmitEmail("");
    setEmitting(false);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Common delete handler
  async function deleteItem(table: string, id: string) {
    if (!confirm("¿Seguro que deseas eliminar esto?")) return;
    const supabase = createClient();
    await supabase.from(table).delete().eq('id', id);
    loadData();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="w-10 h-10 border-3 border-[var(--ziesta-300)] border-t-[var(--ziesta-600)] rounded-full animate-spin" />
      </div>
    );
  }

  if (showSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--gradient-hero)" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <div className="glass-card p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[rgba(139,70,255,0.1)] flex items-center justify-center mb-4">
                <Store size={32} className="text-[var(--ziesta-500)]" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--neutral-900)] mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
                Configurá tu Comercio
              </h1>
              <p className="text-[var(--neutral-500)] text-sm">Completá estos datos para empezar a usar Ziesta</p>
            </div>
            <form onSubmit={createMerchant} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Nombre del comercio</label>
                <input type="text" value={merchantName} onChange={(e) => setMerchantName(e.target.value)} required className="w-full px-4 py-3.5 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Descripción</label>
                <textarea value={merchantDesc} onChange={(e) => setMerchantDesc(e.target.value)} rows={3} className="w-full px-4 py-3.5 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">Puntos por cada $1.000 de compra</label>
                <input type="number" value={pointsPerThousand} onChange={(e) => setPointsPerThousand(e.target.value)} min={1} className="w-full px-4 py-3.5 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] outline-none" />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-4">
                <Zap size={18} /> Activar mi Comercio <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Render Functions for Tabs ---

  const renderPanel = () => {
    const totalEarned = transactions.filter((t) => t.type === "earn").reduce((s, t) => s + t.points, 0);
    const totalRedeemed = transactions.filter((t) => t.type === "redeem").reduce((s, t) => s + t.points, 0);
    const uniqueClients = new Set(transactions.map((t) => t.client_id)).size;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Coins, label: "Puntos emitidos", value: totalEarned.toLocaleString("es-AR"), color: "var(--ziesta-500)" },
            { icon: Gift, label: "Puntos canjeados", value: totalRedeemed.toLocaleString("es-AR"), color: "var(--accent-pink)" },
            { icon: Users, label: "Clientes únicos", value: uniqueClients.toString(), color: "var(--accent-cyan)" },
            { icon: TrendingUp, label: "Puntos acumulados", value: (merchant?.merchant_points_balance || 0).toLocaleString("es-AR"), color: "var(--accent-gold)" },
          ].map((stat, i) => (
            <div key={stat.label} className="glass-card p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${stat.color}12`, color: stat.color }}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-bold text-[var(--neutral-900)]" style={{ fontFamily: "var(--font-outfit)" }}>{stat.value}</p>
              <p className="text-xs text-[var(--neutral-400)] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[rgba(139,70,255,0.1)] flex items-center justify-center"><QrCode size={20} className="text-[var(--ziesta-500)]" /></div>
              <div><h3 className="font-bold text-[var(--neutral-800)]">Validar Canje</h3><p className="text-xs text-[var(--neutral-400)]">Ingresá el token de 6 dígitos del cliente</p></div>
            </div>
            <div className="space-y-4">
              <input type="text" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} placeholder="Ej: 000000 o escaneá QR" className="w-full px-4 py-4 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 text-center text-xl font-bold focus:outline-none focus:border-[var(--ziesta-400)] focus:ring-2 font-mono" />
              <div className="flex gap-2">
                <button onClick={validateToken} disabled={validating || (!tokenInput.startsWith("ZST-") && tokenInput.length !== 6)} className="btn-primary flex-1 justify-center disabled:opacity-50">
                  {validating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={18} />Validar</>}
                </button>
                <button onClick={() => setIsScanning(!isScanning)} className={`px-4 py-3 rounded-xl border flex items-center justify-center transition-colors ${isScanning ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-[var(--neutral-700)] border-[rgba(139,70,255,0.12)] hover:bg-[var(--neutral-50)]"}`}>
                  {isScanning ? <CameraOff size={20} /> : <Camera size={20} />}
                </button>
              </div>

              {isScanning && (
                <div className="rounded-xl overflow-hidden border-2 border-[var(--ziesta-400)] bg-black h-64 relative">
                  <Scanner 
                    onScan={(result) => {
                      if (result && result.length > 0) {
                        setTokenInput(result[0].rawValue);
                        setIsScanning(false);
                        // Optional: automatically trigger validation if it looks like a ZST token
                        // setTimeout(validateToken, 100);
                      }
                    }} 
                  />
                  <div className="absolute inset-0 border-4 border-[rgba(139,70,255,0.3)] z-10 pointer-events-none rounded-xl" />
                </div>
              )}

              {validationResult && (
                <div className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${validationResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"}`}>
                  {validationResult.success ? <Check size={18} /> : <X size={18} />}{validationResult.message}
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[rgba(6,214,160,0.1)] flex items-center justify-center"><Coins size={20} className="text-[var(--accent-cyan)]" /></div>
              <div><h3 className="font-bold text-[var(--neutral-800)]">Emitir Puntos</h3><p className="text-xs text-[var(--neutral-400)]">Registrá una compra y acreditá puntos</p></div>
            </div>
            <form onSubmit={emitPoints} className="space-y-4">
              <input 
                type="number" 
                value={emitAmount} 
                onChange={(e) => setEmitAmount(e.target.value)} 
                placeholder="Monto de la compra ($)" 
                required 
                min={1} 
                className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:outline-none focus:border-[var(--ziesta-400)] focus:ring-2" 
              />
              <div className="relative">
                <input 
                  type="text" 
                  value={emitEmail} 
                  onChange={(e) => setEmitEmail(e.target.value.replace(/\D/g, "").slice(0, 6))} 
                  placeholder="Token del cliente (6 dígitos o escanear QR)" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:outline-none focus:border-[var(--ziesta-400)] focus:ring-2" 
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--ziesta-500)] hover:bg-[rgba(139,70,255,0.1)] rounded-lg transition-colors" aria-label="Escanear QR">
                  <QrCode size={20} />
                </button>
              </div>
              {emitAmount && parseInt(emitAmount) > 0 && (
                <div className="p-3 rounded-xl bg-[rgba(6,214,160,0.06)] border border-[rgba(6,214,160,0.15)] text-sm text-[var(--accent-cyan)] font-medium">
                  💰 Se acreditarán {Math.floor((parseInt(emitAmount) / 1000) * (merchant?.points_per_thousand || 1))} Puntos
                </div>
              )}
              <button type="submit" disabled={emitting || !emitAmount} className="btn-primary w-full justify-center disabled:opacity-50" style={{ background: "linear-gradient(135deg, var(--accent-cyan), #0ba380)" }}>
                {emitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap size={18} />Acreditar Puntos</>}
              </button>
            </form>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="font-bold text-lg text-[var(--neutral-800)]" style={{ fontFamily: "var(--font-outfit)" }}>
              Últimas Transacciones
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Buscar hash o cliente..."
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[rgba(139,70,255,0.08)]"><th className="text-left py-3 px-3">Hash / ID</th><th className="text-left py-3 px-3">Tipo</th><th className="text-left py-3 px-3">Descripción</th><th className="text-right py-3 px-3">Puntos</th><th className="text-right py-3 px-3">Fecha</th></tr></thead>
              <tbody>
                {transactions.filter(tx => {
                  const matchesSearch = tx.id.includes(txSearch) || (tx.description && tx.description.toLowerCase().includes(txSearch.toLowerCase())) || (tx.tx_hash && tx.tx_hash.includes(txSearch));
                  const matchesType = txTypeFilter === 'all' || tx.type === txTypeFilter || (txTypeFilter === 'earn' && tx.type === 'bonus');
                  return matchesSearch && matchesType;
                }).map(tx => (
                  <tr key={tx.id} className="border-b border-[rgba(139,70,255,0.04)] hover:bg-[rgba(139,70,255,0.02)]">
                    <td className="py-3 px-3 text-[var(--neutral-400)] text-xs font-mono">{tx.tx_hash ? `${tx.tx_hash.slice(0,10)}...` : tx.id.split('-')[0]}</td>
                    <td className="py-3 px-3"><span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${tx.type === "earn" || tx.type === "bonus" ? "bg-[rgba(6,214,160,0.1)] text-[var(--accent-cyan)]" : tx.type === "stamp_reward" ? "bg-[rgba(255,209,102,0.15)] text-[var(--accent-gold)]" : "bg-[rgba(239,71,111,0.1)] text-[var(--accent-pink)]"}`}>{tx.type === "earn" ? "Emisión" : tx.type === "redeem" ? "Canje" : tx.type === "bonus" ? "Bonus" : "Premio"}</span></td>
                    <td className="py-3 px-3">{tx.description}</td>
                    <td className={`py-3 px-3 text-right font-bold ${tx.type === "earn" ? "text-[var(--accent-cyan)]" : "text-[var(--accent-pink)]"}`}>{tx.type === "earn" ? "+" : "-"}{tx.points}</td>
                    <td className="py-3 px-3 text-right text-[var(--neutral-400)]">{new Date(tx.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderProducts = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Tus Productos</h2>
        <button onClick={() => { setModalType('product'); setFormData({}); }} className="btn-primary"><Plus size={18} /> Nuevo Producto</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="glass-card p-5">
            <h3 className="font-bold">{p.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{p.description}</p>
            <p className="mt-2 font-bold text-[var(--ziesta-500)]">${p.price}</p>
            <div className="mt-4 flex gap-2">
              <button className="p-2 bg-gray-100 rounded-lg"><Edit size={16}/></button>
              <button onClick={() => deleteItem('products', p.id)} className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStampCards = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Tarjetas de Sellos</h2>
        <button onClick={() => { setModalType('stamp_card'); setFormData({}); }} className="btn-primary"><Plus size={18} /> Nueva Tarjeta</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {stampCards.map(s => (
          <div key={s.id} className="glass-card p-5">
            <h3 className="font-bold">{s.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{s.stamps_required} sellos requeridos</p>
            <div className="mt-4 flex gap-2">
              <button className="p-2 bg-gray-100 rounded-lg"><Edit size={16}/></button>
              <button onClick={() => deleteItem('stamp_cards', s.id)} className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPromotions = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Promociones</h2>
        <button onClick={() => { setModalType('promotion'); setFormData({}); }} className="btn-primary"><Plus size={18} /> Nueva Promoción</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map(p => (
          <div key={p.id} className="glass-card p-5">
            <h3 className="font-bold">{p.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{p.description}</p>
            <p className="mt-2 text-sm">Costo: {p.points_cost} puntos</p>
            <div className="mt-4 flex gap-2">
              <button className="p-2 bg-gray-100 rounded-lg"><Edit size={16}/></button>
              <button onClick={() => deleteItem('promotions', p.id)} className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWhatsApp = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Números de WhatsApp Autorizados</h2>
        <button onClick={() => { setModalType('whatsapp'); setFormData({}); }} className="btn-primary"><Plus size={18} /> Añadir Número</button>
      </div>
      <div className="overflow-x-auto glass-card p-4">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100"><th className="text-left py-3 px-3">Etiqueta</th><th className="text-left py-3 px-3">Teléfono</th><th className="text-left py-3 px-3">Permisos</th><th className="text-right py-3 px-3">Acciones</th></tr></thead>
          <tbody>
            {whatsappNumbers.map(w => (
              <tr key={w.id} className="border-b border-gray-50">
                <td className="py-3 px-3">{w.label}</td>
                <td className="py-3 px-3">{w.phone}</td>
                <td className="py-3 px-3">
                  <div className="flex gap-2">
                    {w.can_emit_points && <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Emitir</span>}
                    {w.can_validate_tokens && <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Validar</span>}
                    {w.can_stamp && <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">Sellar</span>}
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <button className="p-2 mx-1 bg-gray-100 rounded-lg inline-block"><Edit size={16}/></button>
                  <button onClick={() => deleteItem('whatsapp_numbers', w.id)} className="p-2 mx-1 bg-red-100 text-red-600 rounded-lg inline-block"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTotems = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Mis Tótems</h2>
      </div>

      {/* Lista de Tótems */}
      <div className="glass-card p-6 mb-6">
        <h3 className="font-bold text-lg mb-4 text-[var(--neutral-800)]">Tus Tótems Activos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {totems.length === 0 ? (
            <p className="text-sm text-[var(--neutral-500)] col-span-full">No tienes tótems configurados aún.</p>
          ) : (
            totems.map(t => (
              <div key={t.id} className="border border-[rgba(139,70,255,0.1)] rounded-2xl p-5 bg-white/50 flex flex-col relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-[var(--ziesta-600)]">{t.name}</h4>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${t.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {t.status === 'online' ? 'Online' : 'Offline'}
                  </div>
                </div>
                <p className="text-sm text-[var(--neutral-500)] mb-4">{t.location || 'Sin ubicación'}</p>
                <div className="mt-auto">
                  <a href={`/totem/${t.id}`} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center text-sm py-2">
                    Abrir Tótem <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Form to create a new Totem */}
        <div className="mt-8 border-t border-[rgba(139,70,255,0.1)] pt-6">
          <h4 className="font-bold text-md mb-4 text-[var(--neutral-800)]">Crear Nuevo Tótem</h4>
          <form className="flex flex-col sm:flex-row gap-4" onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const name = (form.elements.namedItem('name') as HTMLInputElement).value;
            const location = (form.elements.namedItem('location') as HTMLInputElement).value;
            const supabase = createClient();
            await supabase.from('totems').insert({ merchant_id: merchant?.id, name, location, status: 'offline' });
            form.reset();
            loadData();
          }}>
            <input type="text" name="name" placeholder="Nombre (ej: Tótem Entrada)" required className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] outline-none flex-1" />
            <input type="text" name="location" placeholder="Ubicación" className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] outline-none flex-1" />
            <button type="submit" className="btn-primary px-6"><Plus size={18} /> Crear</button>
          </form>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Media Management */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4 text-[var(--neutral-800)]">Multimedia (Imágenes/Videos)</h3>
          <ul className="space-y-3 mb-6">
            {totemMedia.map(m => (
              <li key={m.id} className="flex justify-between items-center text-sm p-3 bg-white/50 rounded-xl border border-[rgba(139,70,255,0.05)]">
                <span className="truncate flex-1 mr-4">{m.url} ({m.type}) - {m.duration}s</span>
                <button onClick={async () => {
                  const supabase = createClient();
                  await supabase.from('totem_media').delete().eq('id', m.id);
                  loadData();
                }} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
              </li>
            ))}
          </ul>
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const url = (form.elements.namedItem('url') as HTMLInputElement).value;
            const type = (form.elements.namedItem('type') as HTMLSelectElement).value;
            const duration = (form.elements.namedItem('duration') as HTMLInputElement).value;
            const totem_id = (form.elements.namedItem('totem_id') as HTMLSelectElement).value;
            if (!totem_id) return alert('Selecciona un tótem primero');
            const supabase = createClient();
            await supabase.from('totem_media').insert({ totem_id, merchant_id: merchant?.id, url, type, duration: parseInt(duration) || 10, order_index: totemMedia.length });
            form.reset();
            loadData();
          }}>
            <select name="totem_id" required className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] outline-none">
              <option value="">Seleccionar Tótem...</option>
              {totems.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input type="text" name="url" placeholder="URL de la imagen o video" required className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] outline-none" />
            <div className="flex gap-4">
              <select name="type" className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] outline-none flex-1">
                <option value="image">Imagen</option>
                <option value="video">Video</option>
              </select>
              <input type="number" name="duration" placeholder="Duración (seg)" defaultValue={10} className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] outline-none flex-1" />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3"><Plus size={18} /> Agregar Media</button>
          </form>
        </div>

        {/* Surprises Management */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4 text-[var(--neutral-800)]">Sorpresas Aleatorias</h3>
          <ul className="space-y-3 mb-6">
            {totemSurprises.map(s => (
              <li key={s.id} className="flex justify-between items-center text-sm p-3 bg-white/50 rounded-xl border border-[rgba(139,70,255,0.05)]">
                <span className="flex-1 mr-4">
                  <strong>{s.prize_type}</strong>: {s.prize_description} ({s.frequency_per_day}/día)
                </span>
                <button onClick={async () => {
                  const supabase = createClient();
                  await supabase.from('totem_surprises').delete().eq('id', s.id);
                  loadData();
                }} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
              </li>
            ))}
          </ul>
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const prize_type = (form.elements.namedItem('prize_type') as HTMLSelectElement).value;
            const prize_description = (form.elements.namedItem('prize_description') as HTMLInputElement).value;
            const frequency_per_day = (form.elements.namedItem('frequency_per_day') as HTMLInputElement).value;
            const totem_id = (form.elements.namedItem('totem_id') as HTMLSelectElement).value;
            if (!totem_id) return alert('Selecciona un tótem primero');
            const supabase = createClient();
            await supabase.from('totem_surprises').insert({ totem_id, merchant_id: merchant?.id, prize_type, prize_description, frequency_per_day: parseInt(frequency_per_day) || 1 });
            form.reset();
            loadData();
          }}>
            <select name="totem_id" required className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] outline-none">
              <option value="">Seleccionar Tótem...</option>
              {totems.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select name="prize_type" className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] outline-none">
              <option value="discount">Descuento</option>
              <option value="free_product">Producto Gratis</option>
              <option value="bonus_points">Puntos Extra</option>
            </select>
            <input type="text" name="prize_description" placeholder="Descripción (ej: 10% de descuento en café)" required className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] outline-none" />
            <input type="number" name="frequency_per_day" placeholder="Frecuencia por día (ej: 5)" required min={1} className="w-full px-4 py-3 rounded-xl border border-[rgba(139,70,255,0.12)] bg-white/80 focus:border-[var(--ziesta-400)] focus:ring-2 focus:ring-[rgba(139,70,255,0.1)] outline-none" />
            <button type="submit" className="btn-primary w-full justify-center py-3"><Plus size={18} /> Agregar Sorpresa</button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderPaquetes = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Recargar Puntos (Paquetes)</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: "Pack Básico", points: 5000, price: "$5.000", color: "var(--accent-cyan)" },
          { name: "Pack Emprendedor", points: 10000, price: "$10.000", color: "var(--ziesta-500)" },
          { name: "Pack Negocio", points: 50000, price: "$45.000", color: "var(--accent-pink)" },
          { name: "Pack Corporativo", points: 100000, price: "$85.000", color: "var(--accent-gold)" }
        ].map((pack, i) => (
          <div key={i} className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity" style={{ backgroundImage: `linear-gradient(to bottom right, transparent, ${pack.color})` }} />
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${pack.color}15`, color: pack.color }}>
              <Package size={28} />
            </div>
            <h3 className="font-bold text-lg mb-1">{pack.name}</h3>
            <p className="text-2xl font-black mb-1" style={{ color: pack.color, fontFamily: "var(--font-outfit)" }}>{pack.points.toLocaleString("es-AR")} pts</p>
            <p className="text-[var(--neutral-500)] font-medium mb-6">{pack.price}</p>
            <button 
              onClick={() => alert(`🚀 Próximamente: Integración con MercadoPago para comprar el ${pack.name}.`)}
              className="w-full py-3 rounded-xl font-bold text-white transition-transform hover:scale-105 active:scale-95 mt-auto" 
              style={{ backgroundColor: pack.color }}
            >
              Comprar
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-[rgba(139,70,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/ziesta-logo.png" alt="Ziesta" width={32} height={32} />
            <span className="text-lg font-bold text-gradient" style={{ fontFamily: "var(--font-outfit)" }}>Ziesta</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(139,70,255,0.08)] text-[var(--ziesta-600)] font-semibold">Comercio</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[var(--neutral-800)]">{merchant?.name}</p>
              <p className="text-xs text-[var(--neutral-500)]">Plan {merchant?.subscription_plan}</p>
            </div>
            <Link
              href="/dashboard/profile"
              className="p-2 rounded-xl hover:bg-[rgba(139,70,255,0.06)] text-[var(--neutral-500)] hover:text-[var(--ziesta-600)] transition-all"
              title="Mi Perfil"
            >
              <User size={20} />
            </Link>
            <button 
              onClick={() => alert("🚀 Funcionalidad Blockchain en Desarrollo (Estimado 2028). Esta función permitirá exportar tus puntos a la red de Polygon como tokens reales.")}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-[rgba(139,70,255,0.12)] bg-[var(--ziesta-50)] text-[var(--ziesta-600)] hover:bg-[var(--ziesta-100)] text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5H5a2 2 0 0 1 0-4h16v-4z"/></svg>
              <span className="hidden sm:inline">Exportar Web3</span>
              <span className="sm:hidden">Web3</span>
            </button>
            <button onClick={handleSignOut} className="p-2 rounded-xl hover:bg-[rgba(139,70,255,0.06)] text-[var(--neutral-500)] hover:text-[var(--ziesta-600)] transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--neutral-900)] mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
            Panel de {merchant?.name} 🏪
          </h1>
          <p className="text-[var(--neutral-500)]">Gestioná tu comercio y beneficios desde un solo lugar</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/40 p-2 rounded-2xl border border-[rgba(139,70,255,0.08)]">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-white shadow-sm text-[var(--ziesta-600)] border border-[rgba(139,70,255,0.1)]' 
                    : 'text-[var(--neutral-500)] hover:text-[var(--neutral-800)] hover:bg-white/50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'panel' && renderPanel()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'stamp_cards' && renderStampCards()}
          {activeTab === 'promotions' && renderPromotions()}
          {activeTab === 'paquetes' && renderPaquetes()}
          {activeTab === 'whatsapp' && renderWhatsApp()}
          {activeTab === 'totems' && renderTotems()}
        </div>

        {/* Quick Access Auditing */}
        <div className="mt-12 text-center pb-8">
          <Link href="/#ziestascan" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--neutral-900)] text-white font-medium hover:scale-105 transition-transform shadow-lg group">
             <Shield size={18} className="text-[var(--accent-cyan)] group-hover:rotate-12 transition-transform" />
             Auditar Transacción (ZiestaScan)
          </Link>
        </div>
      </main>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {modalType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setModalType(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
                {modalType === 'product' && 'Nuevo Producto'}
                {modalType === 'stamp_card' && 'Nueva Tarjeta'}
                {modalType === 'promotion' && 'Nueva Promoción'}
                {modalType === 'whatsapp' && 'Nuevo Número'}
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                {(modalType === 'product' || modalType === 'stamp_card' || modalType === 'promotion') && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre / Título</label>
                    <input
                      required
                      type="text"
                      className="input-field w-full"
                      placeholder="Ej: Café Gratis, Promo Verano..."
                      value={formData.name || formData.title || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value, title: e.target.value })}
                    />
                  </div>
                )}
                {(modalType === 'product' || modalType === 'stamp_card' || modalType === 'promotion') && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea
                      required
                      className="input-field w-full"
                      placeholder="Agregá una descripción detallada..."
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                )}
                {modalType === 'product' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Precio ($)</label>
                    <input
                      required
                      type="number"
                      className="input-field w-full"
                      placeholder="Ej: 5000"
                      value={formData.price || ''}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                )}
                {modalType === 'stamp_card' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Sellos Requeridos</label>
                    <input
                      required
                      type="number"
                      className="input-field w-full"
                      placeholder="Ej: 10 (visitas para el premio)"
                      value={formData.stamps_required || ''}
                      onChange={e => setFormData({ ...formData, stamps_required: e.target.value })}
                    />
                  </div>
                )}
                {modalType === 'promotion' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Costo en Puntos Ziesta</label>
                    <input
                      required
                      type="number"
                      className="input-field w-full"
                      placeholder="Ej: 1500 (cuánto le cuesta al cliente)"
                      value={formData.points_cost || ''}
                      onChange={e => setFormData({ ...formData, points_cost: e.target.value })}
                    />
                  </div>
                )}
                {modalType === 'whatsapp' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Número (ej: 549385...)</label>
                      <input
                        required
                        type="text"
                        className="input-field w-full"
                        placeholder="Ej: 5493850000000"
                        value={formData.phone || ''}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Etiqueta (ej: Celular Vendedor)</label>
                      <input
                        required
                        type="text"
                        className="input-field w-full"
                        placeholder="Ej: Celular Vendedor / Caja 1"
                        value={formData.label || ''}
                        onChange={e => setFormData({ ...formData, label: e.target.value })}
                      />
                    </div>
                  </>
                )}
                <div className="pt-4">
                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
