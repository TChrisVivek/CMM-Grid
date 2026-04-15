"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      containerStyle={{ zIndex: 9999 }}
      toastOptions={{
        duration: 2500,
        style: {
          background: "#ffffff",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "12px 16px",
          fontSize: "13.5px",
          fontWeight: 500,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
          maxWidth: "340px",
        },
        success: {
          iconTheme: {
            primary: "#16a34a",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
