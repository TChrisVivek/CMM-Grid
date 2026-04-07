export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/allocations
export async function GET() {
  const { data, error } = await supabase
    .from('allocations')
    .select(`
      *,
      product:products(sku, name, unit),
      project:projects(name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map to the internal interface expected by the frontend
  const allocations = data.map(val => ({
    id: val.id,
    productId: val.product_id,
    productName: val.product?.name,
    productSku: val.product?.sku,
    productUnit: val.product?.unit,
    projectId: val.project_id,
    projectName: val.project?.name,
    quantity: val.quantity,
    allocatedDate: val.allocated_date,
    notes: val.notes
  }));

  return NextResponse.json(allocations);
}

// POST /api/allocations — accepts single or batch (array)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const lines = Array.isArray(body) ? body : [body];
  const created = [];

  for (const line of lines) {
    // 1. Get current product stock
    const { data: product, error: pError } = await supabase
      .from('products')
      .select('id, name, sku, unit, warehouse_qty')
      .eq('id', line.productId)
      .single();

    if (pError || !product) {
       return NextResponse.json({ error: `Product ${line.productId} not found` }, { status: 404 });
    }

    const qty = Number(line.quantity);
    if (!qty || qty <= 0) return NextResponse.json({ error: "Quantity must be > 0" }, { status: 400 });

    if (product.warehouse_qty < qty) {
      return NextResponse.json(
        { error: `Insufficient warehouse stock for ${product.sku}: ${product.warehouse_qty} available, ${qty} requested` },
        { status: 409 }
      );
    }

    // 2. Insert Allocation
    const { data: allocation, error: aError } = await supabase
      .from('allocations')
      .insert({
        product_id: product.id,
        project_id: Number(line.projectId),
        quantity: qty,
        allocated_date: line.allocatedDate || new Date().toISOString().split("T")[0],
        notes: line.notes?.trim() || "",
      })
      .select(`
        *,
        project:projects(name)
      `)
      .single();

    if (aError) {
      return NextResponse.json({ error: aError.message }, { status: 500 });
    }

    // 3. Deduct from warehouse
    const { error: uError } = await supabase
      .from('products')
      .update({ warehouse_qty: product.warehouse_qty - qty })
      .eq('id', product.id);

    if (uError) {
       // Rollback allocation? (In pure JS this is hard, usually handled via Postgres RPC)
       console.error("Failed to update warehouse qty", uError);
    }

    created.push({
      id: allocation.id,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productUnit: product.unit,
      projectId: allocation.project_id,
      projectName: (allocation as any).project?.name,
      quantity: qty,
      allocatedDate: allocation.allocated_date,
      notes: allocation.notes,
    });
  }

  return NextResponse.json(created, { status: 201 });
}
