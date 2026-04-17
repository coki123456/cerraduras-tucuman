"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, LogIn, UserPlus } from "lucide-react";
import { useCarrito } from "@/lib/carrito-context";
import { useAuth } from "@/lib/auth-context";

export function CabeceraPublica() {
  const { totalItems } = useCarrito();
  const { role, cargando, cerrarSesion, nombreCompleto } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="Cerraduras Tucumán" width={36} height={36} className="rounded-lg" />
          <span className="font-bold text-base hidden sm:block">Cerraduras Tucumán</span>
        </Link>

        {!cargando && (
          <div className="flex items-center gap-2">
            {role === "cliente" && (
              <>
                <Button variant="ghost" size="sm" asChild className="relative gap-2">
                  <Link href="/dashboard/carrito">
                    <ShoppingCart className="h-4 w-4" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                        {totalItems}
                      </span>
                    )}
                    <span className="hidden sm:inline">Carrito</span>
                    {totalItems > 0 && <span className="sm:hidden">({totalItems})</span>}
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/perfil">
                    {nombreCompleto}
                  </Link>
                </Button>
                <Button size="sm" variant="outline" onClick={cerrarSesion}>Salir</Button>
              </>
            )}

            {role === null && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Iniciar sesión</span>
                    <span className="sm:hidden">Ingresar</span>
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Registrarse</span>
                    <span className="sm:hidden">Registro</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
