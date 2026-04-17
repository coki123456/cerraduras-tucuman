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

  return (
    <Card className="border-border/50 flex flex-col hover:border-primary/40 transition-colors overflow-hidden group">
      {/* Imagen del producto */}
      <div className="relative aspect-square bg-muted/30 border-b border-border/50">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40">
            <ShoppingCart className="h-12 w-12 mb-2" />
            <span className="text-xs">Sin foto</span>
          </div>
        )}
      </div>

      <CardContent className="pt-4 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">
              {producto.nombre}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {producto.sku}
            </p>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {ETIQUETAS_CATEGORIA[producto.categoria]}
          </Badge>
        </div>

        {producto.descripcion && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {producto.descripcion}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatARS(producto.precio)}
          </span>
          <InsigniaStock
            stock={producto.stock}
            stockMinimo={producto.stock_minimo}
          />
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 gap-2">
        {!cargando && (
          <>
            {role === null && (
              <Button
                size="sm"
                className="w-full gap-2"
                asChild
                disabled={producto.stock === 0}
              >
                <Link href="/login">
                  <ShoppingCart className="h-4 w-4" />
                  {producto.stock === 0 ? "Sin stock" : "Agregar"}
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
    </Card>
  );
}
