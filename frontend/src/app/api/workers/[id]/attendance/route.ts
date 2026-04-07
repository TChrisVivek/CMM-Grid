import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/workers/[id]/attendance
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const workerId = Number(params.id);
  
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      *,
      project:projects(name)
    `)
    .eq('worker_id', workerId)
    .order('date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map to the internal interface expected by the frontend
  const records = data.map(val => ({
    id: val.id,
    workerId: val.worker_id,
    date: val.date,
    present: val.present,
    projectId: val.project_id,
    projectName: val.project?.name || "",
    notes: val.notes
  }));

  return NextResponse.json(records);
}

// POST /api/workers/[id]/attendance — mark a day present/absent
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const workerId = Number(params.id);
  const body = await req.json();

  const date = body.date || new Date().toISOString().split("T")[0];

  // If body.present is null, the frontend intends to delete the record (reset attendance)
  if (body.present === null) {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('worker_id', workerId)
      .eq('date', date);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ deleted: true });
  }

  // Upsert record
  const { data, error } = await supabase
    .from('attendance')
    .upsert({
      worker_id: workerId,
      project_id: body.projectId ? Number(body.projectId) : null,
      date: date,
      present: body.present !== false,
      notes: body.notes?.trim() || "",
    }, {
      onConflict: 'worker_id,date'
    })
    .select(`
      *,
      project:projects(name)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const record = {
    id: data.id,
    workerId: data.worker_id,
    date: data.date,
    present: data.present,
    projectId: data.project_id,
    projectName: data.project?.name || "",
    notes: data.notes
  };

  return NextResponse.json(record, { status: 201 });
}
