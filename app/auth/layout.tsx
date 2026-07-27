import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión — Ziesta",
  description: "Accedé a tu cuenta de Ziesta",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* Decorative orbs */}
      <div className="absolute top-20 right-20 w-80 h-80 rounded-full opacity-20 blur-[100px]"
        style={{ background: "var(--ziesta-500)" }}
      />
      <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full opacity-15 blur-[80px]"
        style={{ background: "var(--accent-cyan)" }}
      />
      {children}
    </div>
  );
}
