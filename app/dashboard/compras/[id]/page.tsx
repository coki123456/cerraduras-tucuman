// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InsigniaEstadoVenta } from "@/components/ventas/InsigniaEstadoVenta";
import { InsigniaEstadoPago } from "@/components/ventas/InsigniaEstadoPago";
import { InsigniaEstadoCompra } from "@/components/ventas/InsigniaEstadoCompra";
import { ActualizadorEstadoPago } from "@/components/admin/ActualizadorEstadoPago";
import { ActualizadorEstadoEntrega } from "@/components/admin/ActualizadorEstadoEntrega";
import { formatARS, formatFechaHora } from "@/lib/utils";
import { ArrowLeft, CreditCard } from "lucide-react";
import type { RouteContext } from "next/server";

export default async function PaginaDetalleCompra(
  ctx: RouteContext<"/dashboard/compras/[id]">
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verificar el rol del usuario
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // Query base
  let query = supabase
    .from("ventas")
    .select(
      `
      *,
      venta_items(
        id,
        cantidad,
        precio_unitario,
        subtotal,
        productos(nombre, sku)
      ),
      users(nombre_completo, email, telefono)
    `
    )
    .eq("id", id);

  // Si no es admin, solo puede ver sus propias compras
  if (!isAdmin) {
    query = query.eq("cliente_id", user.id);
  }

  const { data: venta } = await query.single();

  if (!venta) notFound();

  type ItemConProducto = {
    id: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    productos: { nombre: string; sku: string } | null;
  };

  const items = venta.venta_items as unknown as ItemConProducto[];

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={isAdmin ? "/dashboard/admin/ventas" : "/dashboard/compras"}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold">
            Pedido #{venta.id.slice(0, 8).toUpperCase()}
          </h2>
          <p className="text-xs text-muted-foreground">
            {formatFechaHora(venta.fecha_compra)}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin ? (
            <>
              <ActualizadorEstadoPago
                ventaId={venta.id}
                estadoPago={venta.estado_pago}
              />
              <ActualizadorEstadoEntrega
                ventaId={venta.id}
                estadoCompra={venta.estado_compra}
                clienteNombre={(venta.users as any)?.nombre_completo ?? ""}
                clienteEmail={(venta.users as any)?.email ?? ""}
                clienteTelefono={(venta.users as any)?.telefono ?? ""}
              />
            </>
          ) : (
            <>
              <InsigniaEstadoPago estado={venta.estado_pago} />
              <InsigniaEstadoCompra estado={venta.estado_compra} />
            </>
          )}
        </div>
      </div>

      {/* Información del cliente (solo para admins) */}
      {isAdmin && (
        <Card className="border-border/50 bg-muted/30">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="font-semibold">{(venta.users as any)?.nombre_completo || "Desconocido"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-mono text-xs">{(venta.users as any)?.email}</p>
              </div>
              {(venta.users as any)?.telefono && (
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="font-mono">{(venta.users as any)?.telefono}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Productos ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium">
                  {item.productos?.nombre ?? "Producto"}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {item.productos?.sku} · ×{item.cantidad}
                </p>
              </div>
              <span className="font-medium tabular-nums">
                {formatARS(item.subtotal)}
              </span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary tabular-nums">
              {formatARS(venta.total_monto)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Pago */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Información de pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>MercadoPago</span>
          </div>
          {venta.mercadopago_payment_id && (
            <p className="text-xs font-mono text-muted-foreground">
              ID de pago: {venta.mercadopago_payment_id}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
