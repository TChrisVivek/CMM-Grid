export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseAvailable } from "@/lib/supabase";
import { readStore, writeStore, nextId } from "@/lib/store";

// GET /api/workers
export async function GET() {
  if (await isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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

  // Fallback: local store
  const store = readStore();
  return NextResponse.json(store.workers);
}

// POST /api/workers
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Worker name is required" }, { status: 400 });
  }

  if (await isSupabaseAvailable()) {
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

    return NextResponse.json({
      id: data.id,
      name: data.name,
      phone: data.phone,
      trade: data.trade,
      dailyRate: data.daily_rate,
      isActive: data.is_active,
      createdAt: data.created_at,
    }, { status: 201 });
  }

  // Fallback: local store
  const store = readStore();
  const worker = {
    id: nextId(store, "nextWorkerId"),
    name: body.name.trim(),
    phone: body.phone?.trim() || "",
    trade: body.trade?.trim() || "Electrician",
    dailyRate: Number(body.dailyRate) || 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  store.workers.push(worker);
  writeStore(store);
  return NextResponse.json(worker, { status: 201 });
}
