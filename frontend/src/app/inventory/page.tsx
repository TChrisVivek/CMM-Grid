"use client";

import { useEffect, useState, useCallback } from "react";
import { StockTable } from "@/components/StockTable";
import { InventoryDetailDrawer } from "@/components/InventoryDetailDrawer";
import { Package, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { confirmAction } from "@/lib/confirmToast";
import type { Product } from "@/lib/store";

const DEFAULT_FORM = { sku: "", name: "", unit: "Piece", totalQty: "", lowStockThreshold: "10", unitPrice: "", invoiceNo: "" };

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [billFile, setBillFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/inventory");
    setProducts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let billUrl = "";
      if (billFile) {
        const formData = new FormData();
        formData.append("file", billFile);
        const upRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!upRes.ok) throw new Error("Upload failed");
        const upData = await upRes.json();
        billUrl = upData.url;
      }

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: form.sku,
          name: form.name,
          unit: form.unit,
          totalQty: Number(form.totalQty),
          lowStockThreshold: Number(form.lowStockThreshold),
          unitPrice: Number(form.unitPrice),
          invoiceNo: form.invoiceNo,
          billUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) { 
        toast.error(data.error || "Failed to save"); 
        return; 
      }
      toast.success("Product added successfully");
      setShowModal(false);
      setForm(DEFAULT_FORM);
      setBillFile(null);
      await load();
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!(await confirmAction("Delete this product?"))) return;
    const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed to delete"); return; }
    toast.success("Product deleted");
    await load();
  }

  const inputCls = "w-full px-3 py-2 text-sm rounded-lg bg-space-blue border border-glass-border text-text-primary focus:outline-none focus:border-cyan-glow/50 focus:ring-1 focus:ring-cyan-glow/20 transition-all placeholder:text-text-secondary";
  const labelCls = "block text-xs text-text-secondary mb-1.5 font-medium";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-cyan-glow" />
            <span className="text-xs font-mono text-cyan-glow uppercase tracking-widest">Inventory Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Stock Register</h1>
          <p className="text-text-secondary text-sm mt-1">All SKUs tracked by CMM Electricals — warehouse quantities and site allocations.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-glow-grad text-deep-space text-sm font-semibold shadow-cyan-sm hover:shadow-cyan-glow transition-all"
        >
          <Plus size={15} />
          Add Inventory Item
        </button>
      </div>

      <StockTable
          products={products}
          isLoading={loading}
          onDelete={handleDelete}
          onRowClick={(p) => setSelectedProduct(p)}
        />

      <InventoryDetailDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onUpdate={(updated) => {
          setProducts((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
          setSelectedProduct(updated);
        }}
      />

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg glass rounded-2xl shadow-card border border-glass-border animate-fade-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-glass-border">
              <h2 className="text-base font-bold text-text-primary">Add Inventory Item</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-space-blue-light text-text-secondary hover:text-text-primary transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>SKU *</label>
                  <input required placeholder="e.g. WIR-001" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Unit</label>
                  <input placeholder="Piece / Meter / Roll…" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Product Name *</label>
                <input required placeholder="e.g. 2.5mm² PVC Copper Wire (Red)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Opening Qty *</label>
                  <input required type="number" min={0} placeholder="0" value={form.totalQty} onChange={e => setForm(f => ({ ...f, totalQty: e.target.value }))} className={cn(inputCls, "tabular-nums")} />
                </div>
                <div>
                  <label className={labelCls}>Low Stock Alert</label>
                  <input type="number" min={0} placeholder="10" value={form.lowStockThreshold} onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))} className={cn(inputCls, "tabular-nums")} />
                </div>
                <div>
                  <label className={labelCls}>Unit Price (₹)</label>
                  <input type="number" min={0} step="0.01" placeholder="0" value={form.unitPrice} onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))} className={cn(inputCls, "tabular-nums")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Invoice / Bill No (Optional)</label>
                  <input placeholder="e.g. INV-1002" value={form.invoiceNo} onChange={e => setForm(f => ({ ...f, invoiceNo: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Attach Bill (Optional)</label>
                  <input
                    type="file"
                    onChange={e => setBillFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-space-blue/50 border border-glass-border text-text-primary file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-cyan-glow/10 file:text-cyan-glow hover:file:bg-cyan-glow/20 transition-all cursor-pointer"
                    accept="image/*,.pdf"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary glass glass-hover transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-glow-grad text-deep-space text-sm font-semibold shadow-cyan-sm hover:shadow-cyan-glow transition-all disabled:opacity-60">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Saving…" : "Add to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
