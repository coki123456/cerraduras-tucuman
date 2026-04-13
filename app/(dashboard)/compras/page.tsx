import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InsigniaEstadoVenta } from "@/components/ventas/InsigniaEstadoVenta";
import { formatARS, formatFechaHora } from "@/lib/utils";
import { ShoppingBag, KeyRound } from "lucide-react";

export default async function PaginaCompras() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: ventas } = await supabase
    .from("ventas")
    .select(
      `
      id,
      fecha_compra,
      total_monto,
      estado,
      venta_items(id)
    `
    )
    .eq("cliente_id", user.id)
    .order("fecha_compra", { ascending: false });

  if (!ventas || ventas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
        <ShoppingBag className="h-12 w-12" />
        <p className="text-base font-medium">No tenés compras aún</p>
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
      <h2 className="text-lg font-bold">Mis compras</h2>

      <div className="space-y-3">
        {ventas.map((venta) => (
          <Link key={venta.id} href={`/dashboard/compras/${venta.id}`}>
            <Card className="border-border/50 hover:border-primary/40 transition-colors cursor-pointer">
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="text-sm font-mono text-muted-foreground">
                    #{venta.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFechaHora(venta.fecha_compra)} ·{" "}
                    {(venta.venta_items as { id: string }[]).length} producto
                    {(venta.venta_items as { id: string }[]).length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <InsigniaEstadoVenta estado={venta.estado} />
                  <span className="font-bold tabular-nums text-primary">
                    {formatARS(venta.total_monto)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
