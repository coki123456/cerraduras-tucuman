"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  ShoppingCart,
  History,
  BarChart3,
  AlertTriangle,
  LogOut,
  KeyRound,
  User,
  ShoppingBag,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import type { Rol } from "@/types/database";

interface EnlaceNav {
  href: string;
  label: string;
  icono: React.ElementType;
  roles: Rol[];
}

const enlaces: EnlaceNav[] = [
  {
    href: "/dashboard",
    label: "Inicio",
    icono: LayoutDashboard,
    roles: ["cliente", "empleado", "admin"],
  },
  {
    href: "/dashboard/admin/ventas",
    label: "Ventas",
    icono: ShoppingBag,
    roles: ["admin"],
  },
  {
    href: "/dashboard/perfil",
    label: "Mi Perfil",
    icono: User,
    roles: ["cliente", "empleado", "admin"],
  },
  {
    href: "/dashboard/productos",
    label: "Productos",
    icono: KeyRound,
    roles: ["cliente", "empleado", "admin"],
  },
  {
    href: "/dashboard/visitas",
    label: "Visitas",
    icono: CalendarCheck,
    roles: ["empleado", "admin"],
  },
  {
    href: "/dashboard/carrito",
    label: "Carrito",
    icono: ShoppingCart,
    roles: ["cliente"],
  },
  {
    href: "/dashboard/compras",
    label: "Mis compras",
    icono: History,
    roles: ["cliente"],
  },
  {
    href: "/dashboard/reportes",
    label: "Reportes",
    icono: BarChart3,
    roles: ["admin"],
  },
  {
    href: "/dashboard/admin/alertas-stock",
    label: "Alertas de stock",
    icono: AlertTriangle,
    roles: ["admin"],
  },
  {
    href: "/dashboard/admin/configuracion",
    label: "Configuración",
    icono: Settings,
    roles: ["admin"],
  },
];

export function BarraLateral() {
  const pathname = usePathname();
  const { role, cerrarSesion } = useAuth();

  const enlacesFiltrados = enlaces.filter(
    (e) => role && e.roles.includes(role)
  );

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border/50 bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50">
        <Image
          src="/logo.png"
          alt="Cerraduras Tucumán"
          width={36}
          height={36}
          className="rounded-lg shrink-0"
        />
        <div className="overflow-hidden">
          <p className="text-sm font-bold leading-tight truncate">Cerraduras</p>
          <p className="text-xs text-primary font-semibold truncate">Tucumán</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {enlacesFiltrados.map((enlace) => {
          const Icono = enlace.icono;
          const activo =
            enlace.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(enlace.href);

          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                activo
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icono className="h-4 w-4 shrink-0" />
              {enlace.label}
            </Link>
          );
        })}
      </nav>

      {/* Cerrar sesión */}
      <div className="p-3 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={cerrarSesion}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
