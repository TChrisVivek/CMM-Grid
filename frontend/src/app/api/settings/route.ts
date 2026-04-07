import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    // Return defaults if not found or error
    return NextResponse.json({
      companyName: "CMM Electricals",
      companyAddress: "",
      companyPhone: "",
      companyEmail: "",
      defaultLowStockThreshold: 50,
      defaultDailyRate: 600,
      currency: "INR",
      reportFooter: "Confidential — CMM Electricals",
    });
  }

  // Map to camelCase
  return NextResponse.json({
    companyName: data.company_name,
    companyAddress: data.company_address,
    companyPhone: data.company_phone,
    companyEmail: data.company_email,
    defaultLowStockThreshold: data.default_low_stock_threshold,
    defaultDailyRate: data.default_daily_rate,
    currency: data.currency,
    reportFooter: data.report_footer,
  });
}

export async function PUT(req: Request) {
  const body = await req.json();

  const { data, error } = await supabase
    .from('settings')
    .upsert({
      id: 1,
      company_name: body.companyName ?? "CMM Electricals",
      company_address: body.companyAddress ?? "",
      company_phone: body.companyPhone ?? "",
      company_email: body.companyEmail ?? "",
      default_low_stock_threshold: Number(body.defaultLowStockThreshold) || 50,
      default_daily_rate: Number(body.defaultDailyRate) || 600,
      currency: body.currency ?? "INR",
      report_footer: body.report_footer ?? "Confidential — CMM Electricals",
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map back to camelCase
  return NextResponse.json({
    companyName: data.company_name,
    companyAddress: data.company_address,
    companyPhone: data.company_phone,
    companyEmail: data.company_email,
    defaultLowStockThreshold: data.default_low_stock_threshold,
    defaultDailyRate: data.default_daily_rate,
    currency: data.currency,
    reportFooter: data.report_footer,
  });
}
