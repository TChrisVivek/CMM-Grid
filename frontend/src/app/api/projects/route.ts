import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

// GET /api/projects
export async function GET() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map to camelCase
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

// POST /api/projects
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

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

  const project = {
    id: data.id,
    name: data.name,
    siteAddress: data.site_address,
    status: data.status,
    budget: data.budget,
    createdAt: data.created_at,
  };

  return NextResponse.json(project, { status: 201 });
}

// PATCH /api/projects
export async function PATCH(req: NextRequest) {
  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  // Prepare fields for update (mapping camelCase to snake_case where necessary)
  const updateData: any = {};
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

  const project = {
    id: data.id,
    name: data.name,
    siteAddress: data.site_address,
    status: data.status,
    budget: data.budget,
    createdAt: data.created_at,
  };

  return NextResponse.json(project);
}
