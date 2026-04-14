"use client";

import { useEffect, useState, useCallback } from "react";
import { StockTable } from "@/components/StockTable";
import { InventoryDetailDrawer } from "@/components/InventoryDetailDrawer";
import { Package, Plus, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { confirmAction } from "@/lib/confirmToast";
import type { Product } from "@/lib/types";

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
      try {
         const res = await fetch("/api/inventory");
         const data = await res.json();
         if (Array.isArray(data)) {
            setProducts(data);
         } else {
            console.error("Invalid inventory data:", data);
            setProducts([]);
            if (data.error) toast.error(data.error);
         }
      } catch (err) {
         console.error("Failed to load inventory:", err);
         setProducts([]);
      } finally {
         setLoading(false);
      }
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
            formData.append("bucket", "bills");
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
      } catch {
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

   const inputCls = "w-full px-3 py-2 text-sm rounded-lg bg-deep-space/50 border border-white/10 text-text-primary focus:outline-none focus:border-cyan-glow/50 transition-all placeholder:text-text-muted";
   const labelCls = "block text-xs text-text-secondary mb-1.5 font-medium uppercase tracking-widest opacity-60";

   return (
      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <Package size={16} className="text-cyan-glow" />
                  <span className="text-[10px] font-black text-cyan-glow uppercase tracking-[2px]">Logistics Core</span>
               </div>
               <h1 className="text-3xl font-black text-text-primary tracking-tight">Stock Register</h1>
               <p className="text-text-secondary text-sm mt-1 font-medium">Real-time telemetry of warehouse assets and site allocations.</p>
            </div>
            <button
               onClick={() => setShowModal(true)}
               className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-glow-grad text-deep-space text-sm font-black shadow-cyan-glow hover:scale-105 transition-all active:scale-95"
            >
               <Plus size={16} strokeWidth={3} />
               APPEND NEW SKU
            </button>
         </div>

         <div className="glass rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
            <StockTable
               products={products}
               isLoading={loading}
               onDelete={handleDelete}
               onRowClick={(p) => setSelectedProduct(p)}
            />
         </div>

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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
               <div className="absolute inset-0 bg-deep-space/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
               <div className="relative w-full max-w-lg glass rounded-[2.5rem] shadow-3xl border border-white/10 overflow-hidden relative animate-fade-in-up">
                  <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                     <div>
                        <h2 className="text-xl font-black text-text-primary tracking-tight">Initialize Asset</h2>
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[2px] mt-0.5">System Registry Protocol</p>
                     </div>
                     <button onClick={() => setShowModal(false)} className="p-2 rounded-xl glass glass-hover text-text-muted hover:text-text-primary transition-all active:scale-90">
                        <X size={20} />
                     </button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-8 space-y-6">
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className={labelCls}>System SKU</label>
                           <input required placeholder="e.g. CMM-POL-24" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))} className={inputCls} />
                        </div>
                        <div>
                           <label className={labelCls}>Metric Unit</label>
                           <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className={inputCls}>
                              <option>Piece</option><option>Meter</option><option>Kg</option><option>Box</option><option>Roll</option>
                           </select>
                        </div>
                     </div>
                     <div>
                        <label className={labelCls}>Asset Nomenclature</label>
                        <input required placeholder="e.g. Polycarbonate 2.5" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
                     </div>
                     <div className="grid grid-cols-3 gap-6">
                        <div>
                           <label className={labelCls}>Init Stock</label>
                           <input required type="number" min={0} placeholder="0" value={form.totalQty} onChange={e => setForm(f => ({ ...f, totalQty: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                           <label className={labelCls}>Low Alarm</label>
                           <input type="number" min={0} placeholder="10" value={form.lowStockThreshold} onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                           <label className={labelCls}>Valuation (₹)</label>
                           <input type="number" min={0} step="0.01" placeholder="0" value={form.unitPrice} onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))} className={inputCls} />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className={labelCls}>Invoice Ref</label>
                           <input placeholder="Optional" value={form.invoiceNo} onChange={e => setForm(f => ({ ...f, invoiceNo: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                           <label className={labelCls}>Audit Payload</label>
                           <input
                              type="file"
                              onChange={e => setBillFile(e.target.files?.[0] || null)}
                              className="w-full text-[10px] text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-white/5 file:text-text-primary hover:file:bg-white/10 transition-all cursor-pointer"
                              accept="image/*,.pdf"
                           />
                        </div>
                     </div>
                     <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
                        <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-all">Abort</button>
                        <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-cyan-glow-grad text-deep-space text-xs font-black uppercase tracking-widest shadow-cyan-glow hover:scale-[1.02] transition-all disabled:opacity-50">
                           {saving && <Loader2 size={14} className="animate-spin" />}
                           {saving ? "SYNCING..." : "COMMIT REGISTRY"}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
