"use client";

import { Button } from "@/components/ui/button";
import { useCarrito } from "@/lib/carrito-context";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Producto } from "@/types/database";

interface AgregarAlCarritoClienteProps {
  producto: Producto;
}

export function AgregarAlCarritoCliente({ producto }: AgregarAlCarritoClienteProps) {
  const { role } = useAuth();
  const { agregar } = useCarrito();

  // No logueado: enlace a login
  if (role === null) {
    return (
      <Button asChild size="lg" className="w-full gap-2">
        <Link href="/login">
          <ShoppingCart className="h-4 w-4" />
          Iniciar sesión para comprar
        </Link>
      </Button>
    );
  }

  // Logueado como cliente: agregar al carrito
  if (role === "cliente") {
    const handleAgregar = () => {
      agregar({
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_unitario: producto.precio,
        sku: producto.sku,
      });
      toast.success(`"${producto.nombre}" agregado al carrito`);
    };

    return (
      <Button
        size="lg"
        className="w-full gap-2"
        onClick={handleAgregar}
      >
        <ShoppingCart className="h-4 w-4" />
        Agregar al carrito
      </Button>
    );
  }

  // Admin o empleado: no mostrar botón (esta página es para clientes)
  return null;
}
