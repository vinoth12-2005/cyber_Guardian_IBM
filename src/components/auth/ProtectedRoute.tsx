import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ShieldCheck } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cyber-base">
        <div className="flex flex-col items-center gap-3 text-secondary">
          <ShieldCheck className="h-8 w-8 animate-pulse-glow text-accent" />
          <p className="text-sm">Verifying your security session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
