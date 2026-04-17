// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsigniaStock } from "@/components/productos/InsigniaStock";
import {
  formatARS,
  ETIQUETAS_CATEGORIA,
} from "@/lib/utils";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import type { RouteContext } from "next/server";

export const metadata = {
  title: "Detalle de Producto",
};

export default async function PaginaDetalleProducto(
  ctx: RouteContext<"/dashboard/productos/[id]">
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: producto } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .eq("activo", true)
    .single();

  if (!producto) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/productos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{producto.nombre}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Imagen del producto */}
        <Card className="border-border/50 md:col-span-1">
          <CardContent className="pt-6">
            {producto.imagen_url ? (
              <div className="relative aspect-square">
                <Image
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="aspect-square flex flex-col items-center justify-center bg-muted/30 rounded-lg">
                <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground mt-2">Sin foto</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información del producto */}
        <Card className="border-border/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-1">SKU</p>
                <p className="text-sm font-semibold">{producto.sku}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Categoría</p>
                <Badge variant="outline">
                  {ETIQUETAS_CATEGORIA[producto.categoria]}
                </Badge>
              </div>
            </div>

            {producto.descripcion && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Descripción</p>
                <p className="text-sm text-muted-foreground">
                  {producto.descripcion}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-border/40 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Precio</p>
                <p className="text-2xl font-bold text-primary">
                  {formatARS(producto.precio)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Stock</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{producto.stock}</p>
                  <InsigniaStock
                    stock={producto.stock}
                    stockMinimo={producto.stock_minimo}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40">
              <p className="text-xs text-muted-foreground mb-1">Stock Mínimo</p>
              <p className="text-sm">{producto.stock_minimo} unidades</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
