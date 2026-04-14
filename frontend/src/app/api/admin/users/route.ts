export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

interface SessionWithRole {
  user?: { name?: string | null; email?: string | null; image?: string | null; role?: string };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session as SessionWithRole)?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('system_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session as SessionWithRole)?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, role } = await req.json();
    if (!email || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if this is the last admin
    if (role !== "ADMIN") {
      const { data: adminUsers } = await supabase
        .from('system_users')
        .select('email')
        .eq('role', 'ADMIN');

      if (adminUsers && adminUsers.length <= 1 && adminUsers[0].email === email) {
        return NextResponse.json({ error: "Cannot demote the last remaining administrator." }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('system_users')
      .update({ role })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
