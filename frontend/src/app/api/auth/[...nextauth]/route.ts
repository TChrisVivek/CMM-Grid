import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: '/',
    error: '/',
    signOut: '/',
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // Check if user exists in Supabase
      const { data: existingUser } = await supabase
        .from('system_users')
        .select('role')
        .eq('email', user.email)
        .single();
      
      if (!existingUser) {
        // If no users exist in the database, the first person becomes the ADMIN
        const { count } = await supabase
          .from('system_users')
          .select('*', { count: 'exact', head: true });

        const isFirstUser = count === 0;
        
        await supabase.from('system_users').insert({
          id: user.email,
          email: user.email,
          name: user.name || "Unknown",
          image: user.image || "",
          role: isFirstUser ? "ADMIN" : "PENDING",
        });
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const { data: dbUser } = await supabase
          .from('system_users')
          .select('role')
          .eq('email', session.user.email)
          .single();
          
        if (dbUser) {
          // Pass role down to client
          (session as any).user.role = dbUser.role;
        }
      }
      return session;
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
