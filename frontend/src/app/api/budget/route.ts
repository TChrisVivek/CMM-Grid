export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";

/**
 * GET /api/budget
 *
 * Aggregates financial data for the budget overview:
 * - materialCost per project (allocations × unit price)
 * - labourCost per project (project attendance × worker daily rate)
 * - clientPaymentsReceived per project
 * - totals
 */
export async function GET() {
  const store = readStore();

  // Build a product price lookup
  const productPrice: Record<number, number> = {};
  for (const p of store.products) productPrice[p.id] = p.unitPrice;

  // Build a worker daily-rate lookup
  const workerRate: Record<number, number> = {};
  for (const w of store.workers) workerRate[w.id] = w.dailyRate;

  type ProjectBudget = {
    projectId: number;
    projectName: string;
    status: string;
    materialCost: number;
    labourCost: number;
    labourDays: number;
    directPurchaseCost: number;
    totalSpent: number;
    clientReceived: number;
    netPL: number;
    invoices: typeof store.clientPayments;
  };

  // Build per-project map
  const budgetMap = new Map<number, ProjectBudget>();
  const ensureProject = (id: number, name: string, status: string) => {
    if (!budgetMap.has(id)) {
      budgetMap.set(id, {
        projectId: id, projectName: name, status,
        materialCost: 0, labourCost: 0, labourDays: 0, directPurchaseCost: 0,
        totalSpent: 0, clientReceived: 0, netPL: 0, invoices: [],
      });
    }
    return budgetMap.get(id)!;
  };

  // Seed all projects first
  for (const p of store.projects) ensureProject(p.id, p.name, p.status);

  // Material cost from allocations (dispatch = material investment)
  for (const a of store.allocations) {
    if (a.projectId) {
      const entry = ensureProject(a.projectId, a.projectName, "ACTIVE");
      const price = productPrice[a.productId] ?? 0;
      entry.materialCost += a.quantity * price;
    }
  }

  // Labour cost from project-specific attendance
  for (const att of store.attendance) {
    if (att.present && att.projectId > 0) {
      const entry = ensureProject(att.projectId, att.projectName, "ACTIVE");
      entry.labourCost += workerRate[att.workerId] ?? 0;
      entry.labourDays += 1;
    }
  }

  // Client payments received
  for (const cp of store.clientPayments) {
    if (cp.projectId) {
      const entry = ensureProject(cp.projectId, cp.projectName, "ACTIVE");
      entry.clientReceived += cp.amount;
      entry.invoices.push(cp);
    }
  }

  // Direct purchases
  for (const dp of store.directPurchases) {
    if (dp.projectId) {
      const entry = ensureProject(dp.projectId, dp.projectName, "ACTIVE");
      entry.directPurchaseCost += dp.amount;
    }
  }

  // Compute totals
  const projects: ProjectBudget[] = [];
  for (const entry of Array.from(budgetMap.values())) {
    entry.totalSpent = entry.materialCost + entry.labourCost + entry.directPurchaseCost;
    entry.netPL = entry.clientReceived - entry.totalSpent;
    projects.push(entry);
  }

  // Sort active first, then by name
  projects.sort((a, b) => {
    if (a.status === b.status) return a.projectName.localeCompare(b.projectName);
    return a.status === "ACTIVE" ? -1 : 1;
  });

  const totals = {
    totalMaterial:  projects.reduce((s, p) => s + p.materialCost,   0),
    totalLabour:    projects.reduce((s, p) => s + p.labourCost,     0),
    totalDirectPurchases: projects.reduce((s, p) => s + p.directPurchaseCost, 0),
    totalSpent:     projects.reduce((s, p) => s + p.totalSpent,     0),
    totalReceived:  projects.reduce((s, p) => s + p.clientReceived, 0),
    netPL:          projects.reduce((s, p) => s + p.netPL,          0),
  };

  return NextResponse.json({ projects, totals });
}
