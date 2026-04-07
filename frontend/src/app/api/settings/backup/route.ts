export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";

/**
 * GET /api/settings/backup
 * Returns the full store as a downloadable JSON backup.
 */
export async function GET() {
  const store = readStore();
  return NextResponse.json(store, {
    headers: {
      "Content-Disposition": `attachment; filename="CMM_Grid_Backup_${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
