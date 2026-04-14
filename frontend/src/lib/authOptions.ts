import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

// ─── Safe Supabase wrappers ───────────────────────────────────────────────────
// These never throw — they return null on any error so auth never breaks.

async function findUserInSupabase(email: string) {
  try {
    const { data } = await supabase
      .from("system_users")
      .select("role")
      .eq("email", email)
      .single();
    return data as { role: string } | null;
  } catch {
    return null;
  }
}

async function countUsersInSupabase(): Promise<number | null> {
  try {
    const { count, error } = await supabase
      .from("system_users")
      .select("*", { count: "exact", head: true });
    if (error) return null;
    return count;
  } catch {
    return null;
  }
}

async function insertUserInSupabase(user: {
  id: string;
  email: string;
  name: string;
  image: string;
  role: string;
}) {
  try {
    await supabase.from("system_users").insert(user);
  } catch {
    // silently ignore — local store will handle it
  }
}

// ─── Local store fallback ─────────────────────────────────────────────────────
// Used when Supabase is unavailable.

async function findUserInLocalStore(email: string): Promise<{ role: string } | null> {
  try {
    // Dynamic import to keep this server-only
    const { readStore } = await import("@/lib/store");
    const store = readStore();
    const user = store.users.find((u) => u.email === email);
    return user ? { role: user.role } : null;
  } catch {
    return null;
  }
}

async function saveUserToLocalStore(user: {
  id: string;
  email: string;
  name: string;
  image: string;
  role: string;
}) {
  try {
    const { readStore, writeStore } = await import("@/lib/store");
    const store = readStore();
    const existing = store.users.find((u) => u.email === user.email);
    if (!existing) {
      store.users.push({
        ...user,
        role: user.role as "ADMIN" | "USER" | "PENDING" | "REJECTED",
        createdAt: new Date().toISOString(),
      });
      writeStore(store);
    }
  } catch {
    // ignore — read-only environments (e.g. Vercel) can't write store.json
  }
}

// ─── Auth Options ─────────────────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
    signOut: "/",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        // 1. Check if user already exists (Supabase first, local store fallback)
        const existingInDB = await findUserInSupabase(user.email);
        const existingLocal = await findUserInLocalStore(user.email);

        if (!existingInDB && !existingLocal) {
          // Brand-new user — determine their role
          // Count users in Supabase; if Supabase is unavailable, count local store users
          let supabaseCount = await countUsersInSupabase();
          let localCount: number | null = null;

          try {
            const { readStore } = await import("@/lib/store");
            localCount = readStore().users.length;
          } catch { /* ignore */ }

          // Only grant ADMIN if there are genuinely ZERO users in any source
          // If either source is unavailable but the other has users, new user is PENDING
          const totalKnownUsers =
            supabaseCount !== null ? supabaseCount :
            localCount !== null ? localCount :
            1; // Both DBs unreachable — assume users exist, default to PENDING (safe)

          const isFirstUser = totalKnownUsers === 0;
          const role = isFirstUser ? "ADMIN" : "PENDING";

          await insertUserInSupabase({
            id: user.email,
            email: user.email,
            name: user.name || "Unknown",
            image: user.image || "",
            role,
          });
          await saveUserToLocalStore({
            id: user.email,
            email: user.email,
            name: user.name || "Unknown",
            image: user.image || "",
            role,
          });
        }
      } catch (err) {
        console.error("[auth] signIn callback error:", err);
        // Don't block login on DB errors — user gets in, role defaulted in session callback
      }

      return true;
    },

    async session({ session }) {
      if (!session.user?.email) return session;

      try {
        // 1. Try Supabase for role
        let dbUser = await findUserInSupabase(session.user.email);

        // 2. Fallback to local store
        if (!dbUser) {
          dbUser = await findUserInLocalStore(session.user.email);
        }

        if (dbUser) {
          (session as unknown as Record<string, Record<string, unknown>>).user.role =
            dbUser.role;
        } else {
          // Unknown user — treat as PENDING rather than giving full access
          (session as unknown as Record<string, Record<string, unknown>>).user.role =
            "PENDING";
        }
      } catch (err) {
        console.error("[auth] session callback error:", err);
        // Default to PENDING on any error to prevent unauthorized access
        (session as unknown as Record<string, Record<string, unknown>>).user.role =
          "PENDING";
      }

      return session;
    },
  },
};
