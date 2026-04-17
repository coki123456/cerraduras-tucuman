"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TarjetaProducto } from "@/components/productos/TarjetaProducto";
import { FiltrosProductos } from "@/components/productos/FiltrosProductos";
import { Plus, Package } from "lucide-react";
import type { Producto } from "@/types/database";

interface PaginaProductosClienteProps {
  productos: Producto[];
  esAdmin: boolean;
  busquedaActual: string;
  categoriaActual: string;
}

export function PaginaProductosCliente({
  productos,
  esAdmin,
  busquedaActual,
  categoriaActual,
}: PaginaProductosClienteProps) {
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Productos</h1>
          <p className="text-muted-foreground mt-1">
            {productos.length} producto{productos.length !== 1 ? "s" : ""} disponible
            {productos.length !== 1 ? "s" : ""}
          </p>
        </div>
        {esAdmin && (
          <Button asChild size="sm" className="gap-2 w-full sm:w-auto">
            <Link href="/dashboard/productos/nuevo">
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Link>
          </Button>
        )}
      </div>

      {/* Filtros — actualizan la URL, el servidor re-filtra */}
      <FiltrosProductos
        busquedaActual={busquedaActual}
        categoriaActual={categoriaActual}
      />

      {/* Grid de productos */}
      {productos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Package className="h-10 w-10 opacity-40" />
          <p className="text-sm">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}
