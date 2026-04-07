"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Settings, Building2, SlidersHorizontal, FileText,
  Database, Save, CheckCircle, Download, Loader2,
  AlertTriangle, RefreshCw, ChevronRight,
  ShieldAlert, UserCheck, UserX, Ban, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { SystemUser } from "@/lib/store";

interface AppSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  defaultLowStockThreshold: number;
  defaultDailyRate: number;
  currency: string;
  reportFooter: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  companyName: "CMM Electricals",
  companyAddress: "",
  companyPhone: "",
  companyEmail: "",
  defaultLowStockThreshold: 50,
  defaultDailyRate: 600,
  currency: "INR",
  reportFooter: "Confidential — CMM Electricals",
};

const inputCls = "w-full px-3 py-2 text-sm rounded-lg bg-space-blue border border-glass-border text-text-primary focus:outline-none focus:border-cyan-glow/50 focus:ring-1 focus:ring-cyan-glow/20 transition-all placeholder:text-text-secondary/60";
const labelCls = "block text-xs font-medium text-text-secondary mb-1.5";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("company");
  const { data: session } = useSession();

  // Admin User State
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (res.ok) setSettings(await res.json());
    setLoading(false);
  }, []);

  const loadUsers = useCallback(async () => {
    if ((session as any)?.user?.role !== "ADMIN") return;
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      toast.error("Could not fetch user list");
    } finally {
      setUsersLoading(false);
    }
  }, [session]);

  useEffect(() => { load(); loadUsers(); }, [load, loadUsers]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      setSettings(await res.json());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  async function changeUserRole(email: string, role: string) {
    setUpdatingUser(email);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");
      toast.success("Role updated successfully!");
      await loadUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdatingUser(null);
    }
  }

  function handleExportBackup() {
    fetch("/api/settings/backup")
      .then(r => r.json())
      .then(data => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `CMM_Grid_Backup_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  const isAdmin = (session as any)?.user?.role === "ADMIN";

  const sections = [
    { id: "company",   label: "Company Profile",   icon: Building2 },
    { id: "defaults",  label: "App Defaults",       icon: SlidersHorizontal },
    { id: "reports",   label: "Report Branding",    icon: FileText },
    ...(isAdmin ? [{ id: "access", label: "System Access", icon: ShieldAlert }] : []),
    { id: "data",      label: "Data Management",    icon: Database },
  ];

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="h-8 w-48 bg-space-blue-light rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="h-64 glass rounded-2xl animate-pulse" />
        <div className="lg:col-span-3 h-64 glass rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={16} className="text-cyan-glow" />
            <span className="text-xs font-mono text-cyan-glow uppercase tracking-widest">System</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary text-sm mt-1">Configure company details, defaults, and report preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg glass glass-hover text-text-secondary hover:text-text-primary text-xs transition-all">
            <RefreshCw size={13} />Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-glow-grad text-deep-space text-sm font-bold shadow-cyan-sm hover:shadow-cyan-glow transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} /> : <Save size={15} />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-success/10 border border-success/25 text-success text-sm animate-fade-in">
          <CheckCircle size={16} />Settings saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left: Section nav */}
        <div className="glass rounded-2xl overflow-hidden border border-glass-border h-fit">
          {sections.map((s) => {
            const Icon = s.icon;
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-all text-left border-b border-glass-border/50 last:border-0",
                  active
                    ? "bg-cyan-glow/10 text-cyan-glow font-semibold"
                    : "text-text-secondary hover:text-text-primary hover:bg-space-blue-light"
                )}
              >
                <Icon size={15} className={active ? "text-cyan-glow" : "text-text-secondary"} />
                <span className="flex-1">{s.label}</span>
                {active && <ChevronRight size={13} className="text-cyan-glow" />}
              </button>
            );
          })}
        </div>

        {/* Right: Section content */}
        <div className="lg:col-span-3 space-y-5">

          {/* ── Company Profile ── */}
          {activeSection === "company" && (
            <div className="glass rounded-2xl overflow-hidden border border-glass-border animate-fade-in">
              <div className="px-6 py-5 border-b border-glass-border flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-glow/10 border border-cyan-glow/20">
                  <Building2 size={17} className="text-cyan-glow" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary">Company Profile</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Used in Excel report headers and system-wide branding</p>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Company Name *</label>
                  <input
                    required
                    value={settings.companyName}
                    onChange={e => setSettings(s => ({ ...s, companyName: e.target.value }))}
                    placeholder="CMM Electricals"
                    className={inputCls}
                  />
                  <p className="text-[11px] text-text-secondary mt-1">Appears as the bold header on all Excel reports</p>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Office Address</label>
                  <textarea
                    rows={2}
                    value={settings.companyAddress}
                    onChange={e => setSettings(s => ({ ...s, companyAddress: e.target.value }))}
                    placeholder="Shop 4, Main Market, Faridabad, Haryana"
                    className={cn(inputCls, "resize-none")}
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input
                    value={settings.companyPhone}
                    onChange={e => setSettings(s => ({ ...s, companyPhone: e.target.value }))}
                    placeholder="+91 98xxx xxxxx"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input
                    type="email"
                    value={settings.companyEmail}
                    onChange={e => setSettings(s => ({ ...s, companyEmail: e.target.value }))}
                    placeholder="accounts@cmmelectricals.in"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── App Defaults ── */}
          {activeSection === "defaults" && (
            <div className="glass rounded-2xl overflow-hidden border border-glass-border animate-fade-in">
              <div className="px-6 py-5 border-b border-glass-border flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-accent/10 border border-purple-accent/20">
                  <SlidersHorizontal size={17} className="text-purple-soft" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary">App Defaults</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Pre-filled values when creating new inventory items or workers</p>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Default Low Stock Threshold</label>
                    <div className="relative">
                      <input
                        type="number" min={1}
                        value={settings.defaultLowStockThreshold}
                        onChange={e => setSettings(s => ({ ...s, defaultLowStockThreshold: Number(e.target.value) }))}
                        className={cn(inputCls, "tabular-nums")}
                      />
                    </div>
                    <p className="text-[11px] text-text-secondary mt-1">Pre-filled when adding a new inventory item</p>
                  </div>
                  <div>
                    <label className={labelCls}>Default Daily Rate (&#8377;)</label>
                    <input
                      type="number" min={1}
                      value={settings.defaultDailyRate}
                      onChange={e => setSettings(s => ({ ...s, defaultDailyRate: Number(e.target.value) }))}
                      className={cn(inputCls, "tabular-nums")}
                    />
                    <p className="text-[11px] text-text-secondary mt-1">Pre-filled when registering a new worker</p>
                  </div>
                </div>

                <div className="rounded-xl border border-glass-border bg-space-blue px-5 py-4">
                  <p className="text-xs font-semibold text-text-primary mb-1">Currency</p>
                  <div className="flex gap-3 mt-2">
                    {["INR", "USD", "AED"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, currency: c }))}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          settings.currency === c
                            ? "bg-cyan-glow/10 border-cyan-glow/30 text-cyan-glow"
                            : "border-glass-border text-text-secondary hover:text-text-primary hover:bg-space-blue-light"
                        )}
                      >{c}</button>
                    ))}
                  </div>
                  <p className="text-[11px] text-text-secondary mt-2">Display currency throughout the app (cosmetic only — all stored values are in ₹)</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Report Branding ── */}
          {activeSection === "reports" && (
            <div className="glass rounded-2xl overflow-hidden border border-glass-border animate-fade-in">
              <div className="px-6 py-5 border-b border-glass-border flex items-center gap-3">
                <div className="p-2 rounded-xl bg-warning/10 border border-warning/20">
                  <FileText size={17} className="text-warning" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary">Report Branding</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Customise how your Excel reports look and what they say</p>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className={labelCls}>Report Header (Company Name)</label>
                  <input
                    value={settings.companyName}
                    onChange={e => setSettings(s => ({ ...s, companyName: e.target.value }))}
                    placeholder="CMM Electricals"
                    className={inputCls}
                  />
                  <p className="text-[11px] text-text-secondary mt-1">Row 1 of every downloaded Excel sheet — large dark navy bold text</p>
                </div>
                <div>
                  <label className={labelCls}>Report Footer / Confidentiality Note</label>
                  <input
                    value={settings.reportFooter}
                    onChange={e => setSettings(s => ({ ...s, reportFooter: e.target.value }))}
                    placeholder="Confidential — CMM Electricals"
                    className={inputCls}
                  />
                  <p className="text-[11px] text-text-secondary mt-1">Small note shown as file metadata (future use)</p>
                </div>

                {/* Preview */}
                <div className="rounded-xl border border-glass-border overflow-hidden">
                  <div className="px-4 py-2 bg-space-blue border-b border-glass-border">
                    <span className="text-[10px] text-text-secondary uppercase tracking-wider">Excel Preview (Row 1–3)</span>
                  </div>
                  <div className="divide-y divide-glass-border/40">
                    <div className="px-4 py-3 bg-[#1B2B4B]/60 flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{settings.companyName || "CMM Electricals"}</span>
                      <span className="text-[10px] text-white/40 ml-auto">Row 1 — Company header (navy)</span>
                    </div>
                    <div className="px-4 py-2.5 bg-[#2D4F82]/50 flex items-center gap-2">
                      <span className="text-xs text-white/80">Inventory Report — Generated: 03 Apr 2026</span>
                      <span className="text-[10px] text-white/30 ml-auto">Row 2 — Report title (blue)</span>
                    </div>
                    <div className="px-4 py-2.5 bg-[#1F4E79]/60 flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-white/90">SKU · Product Name · Unit · &hellip;</span>
                      <span className="text-[10px] text-white/30 ml-auto">Row 3 — Column headers (dark blue)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── System Access ── */}
          {activeSection === "access" && isAdmin && (
            <div className="glass rounded-2xl overflow-hidden border border-glass-border animate-fade-in">
              <div className="px-6 py-5 border-b border-glass-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-warning/10 border border-warning/20">
                    <ShieldAlert size={17} className="text-warning" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-text-primary">System Access & Personnel</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Manage users and grant dashboard access</p>
                  </div>
                </div>
                <button type="button" onClick={loadUsers} className="p-2 rounded-lg bg-space-blue border border-glass-border hover:text-cyan-glow transition-all">
                  <RefreshCw size={14} className={usersLoading ? "animate-spin" : ""} />
                </button>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-space-blue/30 text-text-secondary text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 font-semibold">User</th>
                      <th className="px-5 py-3 font-semibold">Role</th>
                      <th className="px-5 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border/50">
                    {users.map((u) => (
                      <tr key={u.email} className="table-row-hover">
                        <td className="px-5 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-text-primary">{u.name}</span>
                            <span className="text-[11px] text-text-secondary font-mono mt-0.5">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === "ADMIN" ? "bg-warning/20 text-warning border border-warning/30" :
                            u.role === "USER" ? "bg-success/20 text-success border border-success/30" :
                            "bg-danger/10 text-danger border border-danger/30"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {updatingUser === u.email ? (
                            <span className="inline-flex items-center text-text-secondary text-[11px] gap-1.5"><Loader2 size={12} className="animate-spin"/> Saving</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {u.role !== "ADMIN" && u.role !== "USER" && (
                                <button type="button" onClick={() => changeUserRole(u.email, "USER")} className="flex flex-col items-center justify-center p-1.5 rounded bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all font-semibold" title="Approve Access">
                                  <UserCheck size={14} />
                                </button>
                              )}
                              {u.role === "USER" && (
                                <button type="button" onClick={() => changeUserRole(u.email, "PENDING")} className="flex flex-col items-center justify-center p-1.5 rounded bg-space-blue text-text-secondary border border-glass-border hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-all font-semibold" title="Revoke Access (Pending)">
                                  <UserX size={14} />
                                </button>
                              )}
                              {u.role !== "ADMIN" && u.role !== "REJECTED" && (
                                <button type="button" onClick={() => changeUserRole(u.email, "REJECTED")} className="flex flex-col items-center justify-center p-1.5 rounded bg-space-blue text-text-secondary border border-glass-border hover:bg-danger/20 hover:text-danger border border-danger/40 transition-all font-semibold" title="Block / Reject User">
                                  <Ban size={14} />
                                </button>
                              )}
                              {u.role === "REJECTED" && (
                                <button type="button" onClick={() => changeUserRole(u.email, "PENDING")} className="flex flex-col items-center justify-center p-1.5 rounded bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20 transition-all font-semibold" title="Unblock (Move to Pending)">
                                  <RotateCcw size={14} />
                                </button>
                              )}
                              {u.role !== "ADMIN" && (
                                <button type="button" onClick={() => changeUserRole(u.email, "ADMIN")} className="flex flex-col items-center justify-center p-1.5 rounded bg-space-blue text-text-secondary border border-glass-border hover:bg-warning/10 hover:text-warning hover:border-warning/30 transition-all font-semibold" title="Make Admin">
                                  <ShieldAlert size={14} />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && !usersLoading && (
                  <div className="p-8 text-center text-text-secondary text-sm">No users registered yet.</div>
                )}
              </div>
            </div>
          )}

          {/* ── Data Management ── */}
          {activeSection === "data" && (
            <div className="space-y-4 animate-fade-in">
              {/* Backup */}
              <div className="glass rounded-2xl overflow-hidden border border-glass-border">
                <div className="px-6 py-5 border-b border-glass-border flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-success/10 border border-success/20">
                    <Download size={17} className="text-success" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-text-primary">Export Data Backup</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Download all your data as a JSON file for safekeeping</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Inventory", color: "text-purple-soft" },
                      { label: "Projects", color: "text-cyan-glow" },
                      { label: "Labour", color: "text-success" },
                      { label: "Allocations", color: "text-warning" },
                    ].map(({ label, color }) => (
                      <div key={label} className="rounded-xl bg-space-blue border border-glass-border p-3 text-center">
                        <span className={cn("text-xs font-semibold", color)}>{label}</span>
                        <p className="text-[10px] text-text-secondary mt-0.5">included</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-success/10 border border-success/25 text-success text-sm font-semibold hover:bg-success/15 transition-all"
                  >
                    <Download size={16} />Download Full Backup (.json)
                  </button>
                  <p className="text-[11px] text-text-secondary">
                    Backup includes all products, projects, allocations, labour, attendance, payments, and settings.
                    Store this file securely — it can be used to restore data.
                  </p>
                </div>
              </div>

              {/* Warning panel */}
              <div className="glass rounded-2xl overflow-hidden border border-warning/20">
                <div className="px-6 py-5 border-b border-warning/20 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-warning/10 border border-warning/20">
                    <AlertTriangle size={17} className="text-warning" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-text-primary">Data Storage Info</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Current storage backend and migration status</p>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
                    <span className="text-text-primary font-medium">Active Backend:</span>
                    <code className="text-cyan-glow font-mono text-xs bg-cyan-glow/5 px-2 py-0.5 rounded border border-cyan-glow/15">src/data/store.json</code>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    All data is stored locally in a JSON flat-file. This works well for single-user operation.
                    For multi-user or cloud access, migrate to a PostgreSQL database using the schema in <code className="text-text-primary">database/schema.sql</code>.
                  </p>
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-warning/5 border border-warning/20">
                    <AlertTriangle size={13} className="text-warning mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-warning/90">Export a backup regularly. The JSON file is not version-controlled by default.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
