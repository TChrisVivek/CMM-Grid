"use client";

import { signIn, signOut } from "next-auth/react";
import { ShieldAlert, Ban, Zap, ArrowRight, Package, FolderKanban, Users, BarChart3, CheckCircle2, Shield, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface Branding {
  companyName: string;
  companyLogo: string;
}

function useBranding(): Branding {
  const [branding, setBranding] = useState<Branding>({ companyName: "CMM Grid", companyLogo: "" });
  useEffect(() => {
    fetch("/api/branding", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setBranding({ companyName: data.companyName || "CMM Grid", companyLogo: data.companyLogo || "" });
      })
      .catch(() => {});
  }, []);
  return branding;
}

async function doSignOut() {
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) await r.unregister();
  }
  await signOut({ redirect: false });
  window.location.href = "/?t=" + Date.now();
}

const FEATURES = [
  {
    icon: Package,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.15)",
    title: "Smart Inventory",
    desc: "Track stock in real-time, get low-stock alerts, and allocate materials to projects instantly.",
  },
  {
    icon: FolderKanban,
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.15)",
    title: "Project Management",
    desc: "Manage multiple sites, track progress, log expenses, and monitor delivery timelines.",
  },
  {
    icon: Users,
    color: "#34d399",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.15)",
    title: "Labour Management",
    desc: "Record daily attendance, calculate wages, and manage payments for your entire field crew.",
  },
  {
    icon: BarChart3,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.15)",
    title: "Reports & Exports",
    desc: "Generate Excel reports for inventory, projects, and labour with one click.",
  },
];

const TRUST = [
  { icon: Shield, label: "Role-based access control" },
  { icon: CheckCircle2, label: "Google OAuth secured" },
  { icon: Clock, label: "Real-time data sync" },
];

export function LoginScreen() {
  const { companyName, companyLogo } = useBranding();

  return (
    <div className="min-h-[100dvh] bg-[#030712] font-sans text-white selection:bg-cyan-500/30 overflow-x-hidden">

      {/* ── Ambient glow ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-cyan-500/[0.08] blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/[0.08] blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_30%,#000_20%,transparent_100%)]" />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 border-b border-white/[0.04] backdrop-blur-md bg-[#030712]/60">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.25)] overflow-hidden flex-shrink-0 ${companyLogo ? "bg-transparent" : "bg-gradient-to-tr from-cyan-500 to-blue-600"}`}>
            {companyLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={companyLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Zap size={18} className="text-white" strokeWidth={2.5} />
            )}
          </div>
          <span className="text-base font-bold tracking-tight text-white/90">{companyName}</span>
        </div>
        <button
          onClick={() => signIn("google")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] hover:border-white/[0.15] text-sm font-semibold text-white/80 hover:text-white transition-all"
        >
          Sign In <ArrowRight size={15} />
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 text-center px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wide mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Operations Platform
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent max-w-4xl mx-auto">
          Your complete site<br />operations hub.
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Manage inventory, projects, and field labour for {companyName} — all in one unified platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => signIn("google")}
            className="group flex items-center gap-3 px-7 py-4 rounded-2xl bg-white text-slate-800 font-bold text-base hover:bg-slate-50 transition-all shadow-[0_4px_24px_rgba(255,255,255,0.12)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.18)] active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
            <ArrowRight size={18} className="opacity-40 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-5 mt-10">
          {TRUST.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-slate-500">
              <Icon size={13} className="text-slate-600" /> {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature grid ── */}
      <section className="relative z-10 px-6 sm:px-10 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, color, bg, border, title, desc }) => (
            <div
              key={title}
              style={{ background: bg, borderColor: border }}
              className="rounded-2xl border p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-300"
            >
              <div
                style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="font-bold text-white/90 text-sm mb-1.5">{title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative z-10 px-6 pb-20 text-center">
        <div className="max-w-xl mx-auto bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10">
          <p className="text-xl font-bold text-white mb-2">Ready to get started?</p>
          <p className="text-slate-500 text-sm mb-6">Sign in with your authorized Google account to access {companyName}.</p>
          <button
            onClick={() => signIn("google")}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:opacity-90 transition-all shadow-[0_4px_20px_rgba(6,182,212,0.3)] hover:shadow-[0_6px_28px_rgba(6,182,212,0.4)]"
          >
            Sign In with Google
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.04] px-6 py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} {companyName}. All rights reserved. · Authorized access only.
      </footer>
    </div>
  );
}

// Reusable elegant background for Pending & Blocked screens
const ElegantBackground = ({ children }: { children: React.ReactNode }) => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] p-4 bg-[#030712] relative overflow-hidden font-sans">
    <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
    <div className="relative z-10 w-full max-w-[440px]">
      {children}
    </div>
  </div>
);

export function PendingScreen() {
  const { companyName } = useBranding();

  return (
    <ElegantBackground>
      <div className="bg-[#0B1120]/90 backdrop-blur-2xl rounded-[32px] p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-white/[0.05] text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-32 bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="w-20 h-20 mx-auto bg-amber-500/[0.05] rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner mb-8">
          <ShieldAlert size={36} className="text-amber-400" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400 mb-3 tracking-tight">Access Pending</h1>
        <p className="text-slate-400 mb-10 text-sm leading-relaxed">
          Your account has been securely verified by Google, but you require manual clearance from an Administrator before you can access {companyName}.
        </p>

        <button
          onClick={doSignOut}
          className="w-full group px-6 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] text-sm font-semibold text-slate-300 transition-all flex items-center justify-center gap-2"
        >
          Return to Sign In <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </button>
      </div>
    </ElegantBackground>
  );
}

export function BlockedScreen() {
  const { companyName } = useBranding();

  return (
    <ElegantBackground>
      <div className="bg-[#0B1120]/90 backdrop-blur-2xl rounded-[32px] p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(220,38,38,0.2)] border border-red-500/20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-32 bg-red-500/10 blur-3xl pointer-events-none" />

        <div className="w-20 h-20 mx-auto bg-red-500/[0.05] rounded-2xl flex items-center justify-center border border-red-500/20 shadow-inner mb-8">
          <Ban size={36} className="text-red-400" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-red-100 to-red-400 mb-3 tracking-tight">Access Denied</h1>
        <p className="text-red-200/60 mb-10 text-sm leading-relaxed">
          Your access to {companyName} has been explicitly revoked or blocked by Administration. Contact your administrator to dispute this status.
        </p>

        <button
          onClick={doSignOut}
          className="w-full group px-6 py-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          Sign Out Securely
        </button>
      </div>
    </ElegantBackground>
  );
}
