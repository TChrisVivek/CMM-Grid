import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseAvailable } from "@/lib/supabase";
import { readStore, writeStore, nextId } from "@/lib/store";

export const dynamic = 'force-dynamic';

// GET /api/projects
export async function GET() {
  if (await isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const projects = data.map(p => ({
      id: p.id,
      name: p.name,
      siteAddress: p.site_address,
      status: p.status,
      budget: p.budget,
      createdAt: p.created_at,
    }));

    return NextResponse.json(projects);
  }

  // Fallback: local store
  const store = readStore();
  return NextResponse.json(store.projects);
}

// POST /api/projects
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  if (await isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: body.name.trim(),
        site_address: body.siteAddress?.trim() || "",
        status: body.status || "ACTIVE",
        budget: Number(body.budget) || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      siteAddress: data.site_address,
      status: data.status,
      budget: data.budget,
      createdAt: data.created_at,
    }, { status: 201 });
  }

  // Fallback: local store
  const store = readStore();
  const newProject = {
    id: nextId(store, "nextProjectId"),
    name: body.name.trim(),
    siteAddress: body.siteAddress?.trim() || "",
    status: (body.status || "ACTIVE") as "ACTIVE" | "COMPLETED" | "ON_HOLD",
    budget: Number(body.budget) || 0,
    createdAt: new Date().toISOString(),
  };
  store.projects.push(newProject);
  writeStore(store);
  return NextResponse.json(newProject, { status: 201 });
}

// PATCH /api/projects
export async function PATCH(req: NextRequest) {
  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  if (await isSupabaseAvailable()) {
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.siteAddress !== undefined) updateData.site_address = body.siteAddress.trim();
    if (body.status !== undefined) updateData.status = body.status;
    if (body.budget !== undefined) updateData.budget = Number(body.budget);

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      siteAddress: data.site_address,
      status: data.status,
      budget: data.budget,
      createdAt: data.created_at,
    });
  }

  // Fallback: local store
  const store = readStore();
  const idx = store.projects.findIndex(p => p.id === Number(body.id));
  if (idx === -1) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (body.name !== undefined) store.projects[idx].name = body.name.trim();
  if (body.siteAddress !== undefined) store.projects[idx].siteAddress = body.siteAddress.trim();
  if (body.status !== undefined) store.projects[idx].status = body.status;
  if (body.budget !== undefined) store.projects[idx].budget = Number(body.budget);

  writeStore(store);
  return NextResponse.json(store.projects[idx]);
}
