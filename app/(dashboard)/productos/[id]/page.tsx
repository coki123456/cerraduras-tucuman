import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InsigniaStock } from "@/components/productos/InsigniaStock";
import {
  formatARS,
  ETIQUETAS_CATEGORIA,
} from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import type { RouteContext } from "next/server";

export default async function PaginaDetalleProducto(
  ctx: RouteContext<"/dashboard/productos/[id]">
) {
  const { id } = await ctx.params;
  const supabase = await createServerClient();

  const { data: producto } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .eq("activo", true)
    .single();

  if (!producto) notFound();

  return (
    <div className="space-y-5 max-w-xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/productos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-lg font-bold">{producto.nombre}</h2>
      </div>

      <Card className="border-border/50">
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-mono">
                SKU: {producto.sku}
              </p>
              <Badge variant="outline">
                {ETIQUETAS_CATEGORIA[producto.categoria]}
              </Badge>
            </div>
            <InsigniaStock
              stock={producto.stock}
              stockMinimo={producto.stock_minimo}
            />
          </div>

          {producto.descripcion && (
            <p className="text-sm text-muted-foreground">
              {producto.descripcion}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <span className="text-2xl font-bold text-primary">
              {formatARS(producto.precio)}
            </span>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Stock actual</p>
              <p className="text-xl font-bold tabular-nums">{producto.stock}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
