"use client";

import { useState, useMemo } from "react";
import { Package } from "lucide-react";
import { TarjetaProducto } from "@/components/productos/TarjetaProducto";
import { FiltrosProductos } from "@/components/productos/FiltrosProductos";
import type { Producto, CategoriaProducto } from "@/types/database";

interface CatalogoPublicoProps {
  productos: Producto[];
}

export function CatalogoPublico({ productos }: CatalogoPublicoProps) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<CategoriaProducto | "todas">(
    "todas"
  );

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
      <div>
        <h2 className="text-2xl font-bold">Nuestros productos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {productosFiltrados.length} producto
          {productosFiltrados.length !== 1 ? "s" : ""} disponibles
        </p>
      </div>

      <FiltrosProductos
        busqueda={busqueda}
        categoria={categoria}
        onBusqueda={setBusqueda}
        onCategoria={setCategoria}
      />

      {productosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Package className="h-10 w-10" />
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
