"use client";

import { AuthProvider } from "@/lib/auth-context";
import { CarritoProvider } from "@/lib/carrito-context";
import type { ReactNode } from "react";

export function TiendaLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CarritoProvider>{children}</CarritoProvider>
    </AuthProvider>
  );
}
