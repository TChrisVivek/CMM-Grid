export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/dashboard/metrics
export async function GET() {
  // Fetch products for value and stock calculations
  const { data: products, error: pError } = await supabase.from('products').select('*');
  // Fetch counts for projects and allocations
  const { count: activeProjects, error: prError } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE');
  const { count: completedProjects } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED');
  const { count: totalProjects } = await supabase.from('projects').select('*', { count: 'exact', head: true });
  
  const { data: allocations, error: aError } = await supabase.from('allocations').select('quantity');

  if (pError || prError || aError) {
    return NextResponse.json({ error: "Failed to fetch dashboard metrics" }, { status: 500 });
  }

  const productsSafe = products || [];
  const allocationsSafe = allocations || [];

  const totalStockValue = productsSafe.reduce(
    (sum, p) => sum + (Number(p.warehouse_qty) * (Number(p.unit_price) || 0)),
    0
  );
  const lowStockCount = productsSafe.filter(
    (p) => p.warehouse_qty <= p.low_stock_threshold
  ).length;

  const warehouseQtyTotal = productsSafe.reduce((s, p) => s + Number(p.warehouse_qty), 0);
  const allocatedQtyTotal = allocationsSafe.reduce((s, a) => s + Number(a.quantity), 0);

  return NextResponse.json({
    totalStockValue,
    totalSkus: productsSafe.length,
    activeProjects: activeProjects || 0,
    lowStockCount,
    warehouseQtyTotal,
    allocatedQtyTotal,
    completedProjects: completedProjects || 0,
    totalProjects: totalProjects || 0,
    totalAllocations: allocationsSafe.length,
  });
}
