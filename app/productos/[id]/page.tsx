// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InsigniaStock } from "@/components/productos/InsigniaStock";
import { TiendaLayout } from "@/components/tienda/TiendaLayout";
import { CabeceraPublica } from "@/components/tienda/CabeceraPublica";
import { AgregarAlCarritoCliente } from "@/components/productos/AgregarAlCarritoCliente";
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

export default async function PaginaDetalleProductoPublico(
  ctx: RouteContext<"/productos/[id]">
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
    <TiendaLayout>
      <div className="min-h-screen flex flex-col bg-background">
        <CabeceraPublica />

        <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
          <div className="space-y-6 max-w-4xl">
            {/* Botón volver */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a catálogo
              </Link>
            </Button>

            {/* Grid: Imagen + Info */}
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
                <CardContent className="pt-6 space-y-6">
                  {/* Nombre */}
                  <div>
                    <h1 className="text-3xl font-bold">{producto.nombre}</h1>
                  </div>

                  {/* SKU y Categoría */}
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

                  {/* Descripción */}
                  {producto.descripcion && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Descripción</p>
                      <p className="text-sm text-muted-foreground">
                        {producto.descripcion}
                      </p>
                    </div>
                  )}

                  {/* Precio y Stock */}
                  <div className="pt-4 border-t border-border/40 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Precio</p>
                      <p className="text-3xl font-bold text-primary">
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

                  {/* Botón Agregar al carrito */}
                  <div className="pt-4 border-t border-border/40">
                    <AgregarAlCarritoCliente producto={producto} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <footer className="border-t border-border/50 py-6 mt-8">
          <div className="container mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Cerraduras Tucumán — Todos los
            derechos reservados
          </div>
        </footer>
      </div>
    </TiendaLayout>
  );
}
