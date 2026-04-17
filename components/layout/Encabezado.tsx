"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ShoppingCart, Bell } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BarraLateral } from "@/components/layout/BarraLateral";
import { useAuth } from "@/lib/auth-context";
import { useCarrito } from "@/lib/carrito-context";
import { Badge } from "@/components/ui/badge";

const TITULOS_RUTAS: Record<string, string> = {
  "/dashboard": "Inicio",
  "/dashboard/productos": "Productos",
  "/dashboard/visitas": "Visitas",
  "/dashboard/carrito": "Carrito",
  "/dashboard/compras": "Mis compras",
  "/dashboard/reportes": "Reportes",
  "/dashboard/admin/alertas-stock": "Alertas de stock",
};

function obtenerTitulo(pathname: string): string {
  for (const [ruta, titulo] of Object.entries(TITULOS_RUTAS)) {
    if (pathname === ruta || (ruta !== "/dashboard" && pathname.startsWith(ruta))) {
      return titulo;
    }
  }
  return "Cerraduras Tucumán";
}

export function Encabezado() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, nombreCompleto, cerrarSesion } = useAuth();
  const { totalItems } = useCarrito();

  const iniciales = nombreCompleto
    ? nombreCompleto
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  const titulo = obtenerTitulo(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-sm px-4 lg:px-6">
      {/* Hamburger (mobile) */}
      <Sheet>
        <SheetTrigger>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-60">
          <BarraLateral />
        </SheetContent>
      </Sheet>

      {/* Título de la página */}
      <h1 className="text-base font-semibold flex-1">{titulo}</h1>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        {/* Carrito (solo clientes) */}
        {role === "cliente" && (
          <Link
            href="/dashboard/carrito"
            className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {totalItems}
              </Badge>
            )}
            <span className="sr-only">Carrito ({totalItems})</span>
          </Link>
        )}

        {/* Notificaciones (admin) */}
        {role === "admin" && (
          <Link
            href="/dashboard/admin/alertas-stock"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Alertas</span>
          </Link>
        )}

        {/* Avatar + Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {iniciales}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <p className="font-medium truncate">{nombreCompleto}</p>
              <p className="text-xs font-normal text-muted-foreground truncate">
                {user?.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/perfil")}>
              Mi perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={cerrarSesion}
            >
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
