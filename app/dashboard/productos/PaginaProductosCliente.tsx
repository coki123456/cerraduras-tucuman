// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TarjetaProducto } from "@/components/productos/TarjetaProducto";
import { FiltrosProductos } from "@/components/productos/FiltrosProductos";
import { Plus, Package } from "lucide-react";
import type { Producto, CategoriaProducto } from "@/types/database";

interface PaginaProductosClienteProps {
  productos: Producto[];
  esAdmin: boolean;
}

export function PaginaProductosCliente({
  productos,
  esAdmin,
}: PaginaProductosClienteProps) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<CategoriaProducto | "todas">("todas");

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideBusqueda =
        busqueda === "" ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sku.toLowerCase().includes(busqueda.toLowerCase());

      const coincideCategoria =
        categoria === "todas" || p.categoria === categoria;

      return coincideBusqueda && coincideCategoria;
    });
  }, [productos, busqueda, categoria]);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Productos</h1>
          <p className="text-muted-foreground mt-1">
            {productosFiltrados.length} producto
            {productosFiltrados.length !== 1 ? "s" : ""} disponible
            {productosFiltrados.length !== 1 ? "s" : ""}
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

      {/* Filtros */}
      <FiltrosProductos
        busqueda={busqueda}
        categoria={categoria}
        onBusqueda={setBusqueda}
        onCategoria={setCategoria}
      />

      {/* Grid de productos */}
      {productosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Package className="h-10 w-10 opacity-40" />
          <p className="text-sm">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productosFiltrados.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}
