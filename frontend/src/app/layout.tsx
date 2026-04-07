import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { OfflineProvider } from "@/components/OfflineProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { LoginScreen, PendingScreen, BlockedScreen } from "@/components/AuthScreens";

export const metadata: Metadata = {
  title: "CMM Grid — Electrical Inventory",
  description: "Professional inventory and project management for CMM Electricals.",
  keywords: ["CMM Electricals", "inventory", "project allocation", "electrical goods"],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00d4ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CMM Grid" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* Register/Update/Unregister Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                // Force unregister all old service workers to fix cache issues
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                });
                
                // Then register the new one fresh
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.warn('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="bg-deep-space text-text-primary grid-bg antialiased">
        <AuthProvider>
          <ToastProvider />
          <OfflineProvider>
            {!session ? (
              <LoginScreen />
            ) : (session as any).user?.role === "PENDING" ? (
              <PendingScreen />
            ) : (session as any).user?.role === "REJECTED" ? (
              <BlockedScreen />
            ) : (
              <div className="relative flex min-h-screen">
                <Sidebar isAdmin={(session as any).user?.role === "ADMIN"} />
                <main className="flex-1 lg:pl-64 min-h-screen">
                  <div className="max-w-[1400px] mx-auto px-5 sm:px-7 lg:px-10 py-8 pt-16 lg:pt-8">
                    {children}
                  </div>
                </main>
              </div>
            )}
          </OfflineProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
