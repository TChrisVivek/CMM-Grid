import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";

// GET /api/projects/[id]
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const store = readStore();

  const project = store.projects.find((p) => p.id === id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allocations = store.allocations
    .filter((a) => a.projectId === id)
    .sort((a, b) => b.allocatedDate.localeCompare(a.allocatedDate));

  const usages = store.usages
    .filter((u) => u.projectId === id)
    .sort((a, b) => b.usedDate.localeCompare(a.usedDate));

  const directPurchases = store.directPurchases
    .filter((dp) => dp.projectId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Per-product summary: dispatched vs used vs remaining at site
  const productMap: Record<number, {
    productId: number; sku: string; name: string; unit: string;
    dispatched: number; used: number; remaining: number; entries: number;
  }> = {};

  for (const a of allocations) {
    if (!productMap[a.productId]) {
      productMap[a.productId] = { productId: a.productId, sku: a.productSku, name: a.productName, unit: a.productUnit, dispatched: 0, used: 0, remaining: 0, entries: 0 };
    }
    productMap[a.productId].dispatched += a.quantity;
    productMap[a.productId].entries++;
  }

  for (const u of usages) {
    if (!productMap[u.productId]) {
      productMap[u.productId] = { productId: u.productId, sku: u.productSku, name: u.productName, unit: u.productUnit, dispatched: 0, used: 0, remaining: 0, entries: 0 };
    }
    productMap[u.productId].used += u.quantity;
  }

  for (const item of Object.values(productMap)) {
    item.remaining = item.dispatched - item.used;
  }

  const productSummary = Object.values(productMap).sort((a, b) => b.dispatched - a.dispatched);

  const totalDispatched = allocations.reduce((s, a) => s + a.quantity, 0);
  const totalUsed = usages.reduce((s, u) => s + u.quantity, 0);
  const totalDirectPurchasesCost = directPurchases.reduce((s, dp) => s + dp.amount, 0);

  return NextResponse.json({
    project,
    allocations,
    usages,
    directPurchases,
    productSummary,
    totalDispatched,
    totalUsed,
    totalRemaining: totalDispatched - totalUsed,
    totalEntries: allocations.length,
    totalUsageEntries: usages.length,
    totalDirectPurchasesCost,
  });
}

// PATCH /api/projects/[id]
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const store = readStore();
  
  const pIndex = store.projects.findIndex((p) => p.id === id);
  if (pIndex === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  store.projects[pIndex] = { ...store.projects[pIndex], ...body };
  writeStore(store);
  return NextResponse.json(store.projects[pIndex]);
}

// DELETE /api/projects/[id]
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const store = readStore();
  
  const pIndex = store.projects.findIndex((p) => p.id === id);
  if (pIndex === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Cascade delete everything related to this project
  store.projects.splice(pIndex, 1);
  store.allocations = store.allocations.filter((a) => a.projectId !== id);
  store.usages = store.usages.filter((u) => u.projectId !== id);
  store.directPurchases = store.directPurchases.filter((d) => d.projectId !== id);
  store.clientPayments = store.clientPayments?.filter((c) => c.projectId !== id) || [];
  store.assignments = store.assignments.filter((a) => a.projectId !== id);
  store.attendance = store.attendance.filter((a) => a.projectId !== id);
  // Optional: Could also remove related payments, but payments are often worker-wide weekly blocks

  writeStore(store);
  return NextResponse.json({ success: true });
}
