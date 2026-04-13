"use client";

import { useState } from "react";
import Link from "next/link";
import { useCarrito } from "@/lib/carrito-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResumenCarrito } from "@/components/carrito/ResumenCarrito";
import { formatARS } from "@/lib/utils";
import { CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PaginaCheckout() {
  const { items, totalItems, totalMonto, vaciar } = useCarrito();
  const { user, nombreCompleto } = useAuth();
  const [procesando, setProcesando] = useState(false);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
        <p>No hay productos en el carrito</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/productos">Ver productos</Link>
        </Button>
      </div>
    );
  }

  async function handlePagar() {
    setProcesando(true);

    try {
      const res = await fetch("/api/ventas/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Error al procesar el pago");
        setProcesando(false);
        return;
      }

      // Vaciar carrito y redirigir a MercadoPago
      vaciar();
      window.location.href = data.initPoint;
    } catch {
      toast.error("Error de conexión. Intentá de nuevo.");
      setProcesando(false);
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/carrito">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-lg font-bold">Confirmar pedido</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detalle */}
        <div className="lg:col-span-2 space-y-4">
          {/* Datos del comprador */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Datos del comprador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm font-medium">{nombreCompleto}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </CardContent>
          </Card>

          {/* Items del pedido */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Productos ({totalItems})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.producto_id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.nombre}{" "}
                    <span className="text-xs">×{item.cantidad}</span>
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatARS(item.precio_unitario * item.cantidad)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary tabular-nums">
                  {formatARS(totalMonto)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen + Botón pago */}
        <div>
          <ResumenCarrito totalItems={totalItems} totalMonto={totalMonto}>
            <Button
              className="w-full gap-2"
              onClick={handlePagar}
              disabled={procesando}
            >
              {procesando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando…
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pagar con Mercadopago
                </>
              )}
            </Button>
          </ResumenCarrito>
        </div>
      </div>
    </div>
  );
}
