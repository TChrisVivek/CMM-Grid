export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  let query = supabase
    .from('direct_purchases')
    .select(`
      *,
      project:projects(name)
    `)
    .order('date', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', Number(projectId));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map to the internal interface expected by the frontend
  const purchases = data.map(val => ({
    id: val.id,
    projectId: val.project_id,
    projectName: val.project?.name || "",
    description: val.description,
    amount: val.amount,
    date: val.date,
    invoiceNo: val.invoice_no,
    notes: val.notes,
    billUrl: val.bill_url
  }));
  
  return NextResponse.json(purchases);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.projectId || !body.description || !body.amount || !body.date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('direct_purchases')
    .insert({
      project_id: Number(body.projectId),
      description: body.description.trim(),
      amount: Number(body.amount),
      date: body.date,
      invoice_no: body.invoiceNo?.trim() || "",
      notes: body.notes?.trim() || "",
      bill_url: body.billUrl || "",
    })
    .select(`
      *,
      project:projects(name)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const purchase = {
    id: data.id,
    projectId: data.project_id,
    projectName: data.project?.name || "",
    description: data.description,
    amount: data.amount,
    date: data.date,
    invoiceNo: data.invoice_no,
    notes: data.notes,
    billUrl: data.bill_url
  };

  return NextResponse.json(purchase, { status: 201 });
}
