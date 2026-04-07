export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/workers
export async function GET() {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map to camelCase
  const workers = data.map(w => ({
    id: w.id,
    name: w.name,
    phone: w.phone,
    trade: w.trade,
    dailyRate: w.daily_rate,
    isActive: w.is_active,
    createdAt: w.created_at,
  }));

  return NextResponse.json(workers);
}

// POST /api/workers
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Worker name is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('workers')
    .insert({
      name: body.name.trim(),
      phone: body.phone?.trim() || "",
      trade: body.trade?.trim() || "Electrician",
      daily_rate: Number(body.dailyRate) || 0,
      is_active: body.isActive !== undefined ? body.isActive : true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const worker = {
    id: data.id,
    name: data.name,
    phone: data.phone,
    trade: data.trade,
    dailyRate: data.daily_rate,
    isActive: data.is_active,
    createdAt: data.created_at,
  };

  return NextResponse.json(worker, { status: 201 });
}
