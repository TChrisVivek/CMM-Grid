export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/** GET /api/budget/client-payments — list all client payments */
export async function GET() {
  const { data, error } = await supabase
    .from('client_payments')
    .select(`
      *,
      project:projects(name)
    `)
    .order('payment_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map to the internal interface expected by the frontend
  const payments = data.map(val => ({
    id: val.id,
    projectId: val.project_id,
    projectName: val.project?.name || "",
    amount: val.amount,
    paymentDate: val.payment_date,
    invoiceNo: val.invoice_no,
    notes: val.notes,
    billUrl: val.bill_url
  }));

  return NextResponse.json(payments);
}

/** POST /api/budget/client-payments — record a new client payment */
export async function POST(req: Request) {
  const body = await req.json();
  const { projectId, amount, paymentDate, invoiceNo, notes, billUrl } = body;

  if (!projectId || !amount || !paymentDate) {
    return NextResponse.json({ error: "projectId, amount, paymentDate required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('client_payments')
    .insert({
      project_id: Number(projectId),
      amount: Number(amount),
      payment_date: paymentDate,
      invoice_no: invoiceNo ?? "",
      notes: notes ?? "",
      bill_url: billUrl ?? "",
    })
    .select(`
      *,
      project:projects(name)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const cp = {
    id: data.id,
    projectId: data.project_id,
    projectName: data.project?.name || "",
    amount: data.amount,
    paymentDate: data.payment_date,
    invoiceNo: data.invoice_no,
    notes: data.notes,
    billUrl: data.bill_url
  };

  return NextResponse.json(cp, { status: 201 });
}
