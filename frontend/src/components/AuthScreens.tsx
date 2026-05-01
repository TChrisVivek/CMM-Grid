"use client";

import { signIn, signOut } from "next-auth/react";
import { ShieldAlert, Ban, Zap, ArrowRight } from "lucide-react";
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

export function LoginScreen() {
  const { companyName, companyLogo } = useBranding();

  return (
    <div className="flex bg-[#030712] min-h-[100dvh] font-sans selection:bg-cyan-500/30">
      {/* Left Hemisphere: Branding & Graphic */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden backdrop-blur-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-[#030712] to-blue-900/40 z-0" />

        {/* Dynamic Electrical/Grid background effect */}
        <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_10%,transparent_100%)]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] overflow-hidden flex-shrink-0 ${companyLogo ? 'bg-transparent' : 'bg-gradient-to-tr from-cyan-500 to-blue-600'}`}>
              {companyLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={companyLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Zap size={20} className="text-white" strokeWidth={2.5} />
              )}
            </div>
            <span className="text-xl font-bold tracking-tight text-white/90">{companyName}</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg mb-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40 leading-[1.1] tracking-tight mb-6">
            Powering smart <br /> infrastructure.
          </h1>
          <p className="text-lg text-slate-400 font-light leading-relaxed">
            A centralized management system for {companyName}. Manage inventory pipelines, allocate project resources, and track field labor in real-time.
          </p>
        </div>
      </div>

      {/* Right Hemisphere: Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
        {/* Mobile Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120] to-[#030712] lg:hidden z-0" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-[500px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none lg:hidden z-0" />

        <div className="w-full max-w-[420px] relative z-10">
          <div className="text-center lg:text-left mb-8">
            <div className={`lg:hidden w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] mb-6 overflow-hidden ${companyLogo ? 'bg-transparent' : 'bg-gradient-to-tr from-cyan-500 to-blue-600'}`}>
              {companyLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={companyLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Zap size={28} className="text-white" strokeWidth={2.5} />
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h2>
            <p className="text-slate-400 text-sm">Secure authorization required to access {companyName}.</p>
          </div>

          <div className="bg-[#0B1120]/80 backdrop-blur-xl border border-white/[0.05] p-8 rounded-3xl shadow-2xl">
            <div className="space-y-6">
              <button
                onClick={() => signIn("google")}
                className="group relative w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 transition-all duration-300 shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.15)] active:scale-[0.98]"
              >
                <div className="w-5 h-5 flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-700 text-base">Continue with Google</span>
                <ArrowRight size={18} className="text-slate-400 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.05]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#0B1120] px-3 text-slate-500">Security Notice</span>
                </div>
              </div>

              <div className="text-center rounded-xl bg-cyan-500/[0.03] border border-cyan-500/[0.08] p-4 text-xs text-cyan-200/50 leading-relaxed font-medium">
                Access is strictly restricted to authorized personnel. All authentication attempts are logged and monitored.
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600 mt-8">
            &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>
        </div>
      </div>
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
