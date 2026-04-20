"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InsigniaStock } from "@/components/productos/InsigniaStock";
import { ShoppingCart, Pencil, LogIn } from "lucide-react";
import { formatARS, ETIQUETAS_CATEGORIA } from "@/lib/utils";
import { useCarrito } from "@/lib/carrito-context";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import type { Producto } from "@/types/database";

interface TarjetaProductoProps {
  producto: Producto;
}

import Image from "next/image";

/** Molécula: tarjeta de producto con acción según rol */
export function TarjetaProducto({ producto }: TarjetaProductoProps) {
  const { agregar } = useCarrito();
  const { role, cargando } = useAuth();

  function handleAgregarAlCarrito() {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio,
      sku: producto.sku,
    });
    toast.success(`"${producto.nombre}" agregado al carrito`);
  }

  const getHrefImagen = () => {
    if (role === null || role === "cliente") return `/productos/${producto.id}`;
    if (role === "admin") return `/dashboard/productos/${producto.id}/edit`;
    if (role === "empleado") return `/dashboard/productos/${producto.id}`;
    return "#";
  };

  return (
    <Card className="border-border/50 flex flex-row sm:flex-col hover:border-primary/40 transition-colors overflow-hidden group">
      {/* Imagen del producto — pequeña en móvil, cuadrada en desktop */}
      <Link href={getHrefImagen()} className="shrink-0">
        <div className="relative w-24 h-24 sm:w-full sm:aspect-square sm:h-auto bg-muted/30 border-r sm:border-r-0 sm:border-b border-border/50 cursor-pointer">
          {producto.imagen_url ? (
            <Image
              src={producto.imagen_url}
              alt={producto.nombre}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40">
              <ShoppingCart className="h-8 w-8 sm:h-12 sm:w-12 mb-1 sm:mb-2" />
              <span className="text-xs hidden sm:block">Sin foto</span>
            </div>
          )}
        </div>
      </Link>

      {/* Contenido + footer envueltos para que en móvil queden a la derecha de la imagen */}
      <div className="flex flex-col flex-1 min-w-0">
        <CardContent className="pt-3 sm:pt-4 flex-1 space-y-1 sm:space-y-3 pb-2 px-3 sm:px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight line-clamp-2 sm:truncate">
                {producto.nombre}
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {producto.sku}
              </p>
            </div>
            <Badge variant="outline" className="text-xs shrink-0 hidden sm:inline-flex">
              {ETIQUETAS_CATEGORIA[producto.categoria]}
            </Badge>
          </div>

          {producto.descripcion && (
            <p className="text-xs text-muted-foreground line-clamp-2 hidden sm:block">
              {producto.descripcion}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-bold text-primary">
              {formatARS(producto.precio)}
            </span>
            <InsigniaStock
              stock={producto.stock}
              stockMinimo={producto.stock_minimo}
            />
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-3 sm:pb-4 px-3 sm:px-4 gap-2">
          {!cargando && (
            <>
              {role === null && (
                <Button
                  size="sm"
                  className="w-full gap-2"
                  asChild
                  disabled={producto.stock === 0}
                >
                  <Link href={`/productos/${producto.id}`}>
                    <ShoppingCart className="h-4 w-4" />
                    {producto.stock === 0 ? "Sin stock" : "Ver detalles"}
                  </Link>
                </Button>
              )}

              {role === "cliente" && (
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleAgregarAlCarrito}
                  disabled={producto.stock === 0}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {producto.stock === 0 ? "Sin stock" : "Agregar"}
                </Button>
              )}

              {role === "admin" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2"
                  asChild
                >
                  <Link href={`/dashboard/productos/${producto.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Link>
                </Button>
              )}

              {role === "empleado" && (
                <Button size="sm" variant="ghost" className="w-full" asChild>
                  <Link href={`/dashboard/productos/${producto.id}`}>
                    Ver detalle
                  </Link>
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </div>
    </Card>
  );
}
