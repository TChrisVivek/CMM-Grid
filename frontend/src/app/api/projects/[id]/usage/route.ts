import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore, nextId } from "@/lib/store";

// GET /api/projects/[id]/usage — get all usage entries for a project
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const projectId = Number(params.id);
  const store = readStore();
  const usages = store.usages
    .filter((u) => u.projectId === projectId)
    .sort((a, b) => b.usedDate.localeCompare(a.usedDate));
  return NextResponse.json(usages);
}

// POST /api/projects/[id]/usage — record items used at a project site
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const projectId = Number(params.id);
  const body = await req.json();
  const store = readStore();

  const project = store.projects.find((p) => p.id === projectId);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const product = store.products.find((p) => p.id === Number(body.productId));
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const qty = Number(body.quantity);
  if (!qty || qty <= 0) return NextResponse.json({ error: "Quantity must be > 0" }, { status: 400 });

  // Check how much of this product has been allocated to this project
  const dispatched = store.allocations
    .filter((a) => a.projectId === projectId && a.productId === product.id)
    .reduce((s, a) => s + a.quantity, 0);

  // Check how much has already been recorded as used
  const alreadyUsed = store.usages
    .filter((u) => u.projectId === projectId && u.productId === product.id)
    .reduce((s, u) => s + u.quantity, 0);

  const remaining = dispatched - alreadyUsed;

  if (qty > remaining) {
    return NextResponse.json(
      {
        error: `Only ${remaining} ${product.unit}(s) of ${product.sku} available at this site. (${dispatched} dispatched − ${alreadyUsed} already used)`,
      },
      { status: 409 }
    );
  }

  const usage = {
    id: nextId(store, "nextUsageId"),
    productId: product.id,
    productName: product.name,
    productSku: product.sku,
    productUnit: product.unit,
    projectId,
    projectName: project.name,
    quantity: qty,
    usedDate: body.usedDate || new Date().toISOString().split("T")[0],
    notes: body.notes?.trim() || "",
  };

  store.usages.push(usage);
  writeStore(store);
  return NextResponse.json(usage, { status: 201 });
}
