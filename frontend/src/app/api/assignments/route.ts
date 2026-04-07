export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/assignments — optionally filter by ?projectId=X or ?workerId=X
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const workerId = searchParams.get("workerId");

  let query = supabase
    .from('assignments')
    .select(`
      *,
      worker:workers(name, trade),
      project:projects(name)
    `);

  if (projectId) query = query.eq('project_id', Number(projectId));
  if (workerId) query = query.eq('worker_id', Number(workerId));

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map to the internal interface expected by the frontend
  const assignments = data.map(a => ({
    id: a.id,
    workerId: a.worker_id,
    workerName: a.worker?.name,
    workerTrade: a.worker?.trade,
    projectId: a.project_id,
    projectName: a.project?.name,
    startDate: a.start_date,
    endDate: a.end_date || "",
    notes: a.notes
  }));

  // Sort: active first then by startDate desc
  assignments.sort((a, b) => {
    if (!a.endDate && b.endDate) return -1;
    if (a.endDate && !b.endDate) return 1;
    return b.startDate.localeCompare(a.startDate);
  });

  return NextResponse.json(assignments);
}

// POST /api/assignments — assign a worker to a project
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Prevent duplicate active assignment for same worker+project
  const { data: existing } = await supabase
    .from('assignments')
    .select('id')
    .eq('worker_id', body.workerId)
    .eq('project_id', body.projectId)
    .is('end_date', null)
    .single();

  if (existing) {
    return NextResponse.json({ error: `Worker is already active on this project` }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('assignments')
    .insert({
      worker_id: Number(body.workerId),
      project_id: Number(body.projectId),
      start_date: body.startDate || new Date().toISOString().split("T")[0],
      notes: body.notes?.trim() || "",
    })
    .select(`
      *,
      worker:workers(name, trade),
      project:projects(name)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const assignment = {
    id: data.id,
    workerId: data.worker_id,
    workerName: data.worker?.name,
    workerTrade: data.worker?.trade,
    projectId: data.project_id,
    projectName: data.project?.name,
    startDate: data.start_date,
    endDate: data.end_date || "",
    notes: data.notes
  };

  return NextResponse.json(assignment, { status: 201 });
}

// PATCH /api/assignments — mark an assignment as ended
export async function PATCH(req: NextRequest) {
  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
  }

  const updateData: any = {};
  if (body.endDate !== undefined) updateData.end_date = body.endDate || new Date().toISOString().split("T")[0];
  if (body.notes !== undefined) updateData.notes = body.notes;

  const { data, error } = await supabase
    .from('assignments')
    .update(updateData)
    .eq('id', Number(body.id))
    .select(`
      *,
      worker:workers(name, trade),
      project:projects(name)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const assignment = {
    id: data.id,
    workerId: data.worker_id,
    workerName: data.worker?.name,
    workerTrade: data.worker?.trade,
    projectId: data.project_id,
    projectName: data.project?.name,
    startDate: data.start_date,
    endDate: data.end_date || "",
    notes: data.notes
  };

  return NextResponse.json(assignment);
}
