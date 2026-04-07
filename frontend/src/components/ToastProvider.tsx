"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster 
      position="top-center" 
      toastOptions={{
        duration: 3500,
        style: {
          background: "rgba(10, 25, 47, 0.8)",
          backdropFilter: "blur(12px)",
          color: "#e2e8f0",
          border: "1px solid rgba(0, 212, 255, 0.2)",
          borderRadius: "12px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: 500,
        },
        success: {
          iconTheme: {
            primary: "#10b981", // emerald-500
            secondary: "transparent",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444", // red-500
            secondary: "transparent",
          },
        },
      }}
    />
  );
}
