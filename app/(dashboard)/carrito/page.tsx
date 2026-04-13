"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ItemCarrito } from "@/components/carrito/ItemCarrito";
import { ResumenCarrito } from "@/components/carrito/ResumenCarrito";
import { useCarrito } from "@/lib/carrito-context";
import { ShoppingCart, ArrowRight, KeyRound } from "lucide-react";

export default function PaginaCarrito() {
  const { items, totalItems, totalMonto, actualizarCantidad, quitar } = useCarrito();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
        <ShoppingCart className="h-12 w-12" />
        <p className="text-base font-medium">Tu carrito está vacío</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/productos">
            <KeyRound className="mr-2 h-4 w-4" />
            Ver productos
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold">Tu carrito</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border/50 bg-card px-4">
            {items.map((item) => (
              <ItemCarrito
                key={item.producto_id}
                item={item}
                onCambiarCantidad={actualizarCantidad}
                onQuitar={quitar}
              />
            ))}
          </div>
        </div>

        {/* Resumen */}
        <div>
          <ResumenCarrito totalItems={totalItems} totalMonto={totalMonto}>
            <Button className="w-full gap-2" asChild>
              <Link href="/dashboard/checkout">
                Proceder al pago
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </ResumenCarrito>
        </div>
      </div>
    </div>
  );
}
