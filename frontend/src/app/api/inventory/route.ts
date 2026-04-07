import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

// GET /api/inventory
export async function GET() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map to camelCase for frontend compatibility
  const products = data.map(p => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    unit: p.unit,
    totalQty: p.total_qty,
    warehouseQty: p.warehouse_qty,
    lowStockThreshold: p.low_stock_threshold,
    unitPrice: p.unit_price,
    createdAt: p.created_at,
    invoiceNo: p.invoice_no,
    billUrl: p.bill_url,
  }));

  return NextResponse.json(products);
}

// POST /api/inventory
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate required fields
  if (!body.sku || !body.name) {
    return NextResponse.json({ error: "SKU and name are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      sku: body.sku.toUpperCase().trim(),
      name: body.name.trim(),
      unit: body.unit?.trim() || "Piece",
      total_qty: Number(body.totalQty) || 0,
      warehouse_qty: Number(body.totalQty) || 0, // starts fully in warehouse
      low_stock_threshold: Number(body.lowStockThreshold) || 10,
      unit_price: Number(body.unitPrice) || 0,
      invoice_no: body.invoiceNo?.trim() || "",
      bill_url: body.billUrl || "",
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map back to camelCase
  const product = {
    id: data.id,
    sku: data.sku,
    name: data.name,
    unit: data.unit,
    totalQty: data.total_qty,
    warehouseQty: data.warehouse_qty,
    lowStockThreshold: data.low_stock_threshold,
    unitPrice: data.unit_price,
    createdAt: data.created_at,
    invoiceNo: data.invoice_no,
    billUrl: data.bill_url,
  };

  return NextResponse.json(product, { status: 201 });
}
