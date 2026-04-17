"use client";

import { useState, useMemo } from "react";
import { Package } from "lucide-react";
import { TarjetaProducto } from "@/components/productos/TarjetaProducto";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Producto, CategoriaProducto } from "@/types/database";
import { ETIQUETAS_CATEGORIA } from "@/lib/utils";

interface CatalogoPublicoProps {
  productos: Producto[];
}

const CATEGORIAS: CategoriaProducto[] = ["cerraduras", "herrajes", "accesorios"];

export function CatalogoPublico({ productos }: CatalogoPublicoProps) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<
    Record<CategoriaProducto, boolean>
  >({
    cerraduras: true,
    herrajes: true,
    accesorios: true,
  });

  const productosPorCategoria = useMemo(() => {
    return CATEGORIAS.reduce(
      (acc, cat) => {
        const productosCat = productos.filter((p) => {
          const coincideBusqueda =
            busqueda === "" ||
            p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.sku.toLowerCase().includes(busqueda.toLowerCase());
          return p.categoria === cat && coincideBusqueda;
        });
        acc[cat] = productosCat;
        return acc;
      },
      {} as Record<CategoriaProducto, Producto[]>
    );
  }, [productos, busqueda]);

  const totalProductos = Object.values(productosPorCategoria).reduce(
    (sum, prods) => sum + prods.length,
    0
  );

  const toggleCategoria = (cat: CategoriaProducto) => {
    setCategoriasExpandidas((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Nuestros productos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {totalProductos} producto
          {totalProductos !== 1 ? "s" : ""} disponibles
        </p>
      </div>

      {/* Búsqueda */}
      <div className="max-w-sm">
        <Input
          placeholder="Buscar por nombre o SKU..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="h-10"
        />
      </div>

      {/* Categorías y productos */}
      <div className="space-y-6">
        {CATEGORIAS.map((categoria) => {
          const productosCategoria = productosPorCategoria[categoria];
          const estaExpandida = categoriasExpandidas[categoria];

          return (
            <div key={categoria} className="space-y-3">
              {/* Header de categoría */}
              <button
                onClick={() => toggleCategoria(categoria)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold capitalize">
                    {ETIQUETAS_CATEGORIA[categoria]}
                  </h3>
                  <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-1">
                    {productosCategoria.length}
                  </span>
                </div>
                <svg
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    estaExpandida ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {/* Grid de productos */}
              {estaExpandida && (
                <div>
                  {productosCategoria.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground rounded-lg bg-muted/20">
                      <Package className="h-10 w-10" />
                      <p className="text-sm">No hay productos en esta categoría</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {productosCategoria.map((producto) => (
                        <TarjetaProducto key={producto.id} producto={producto} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sin resultados */}
      {totalProductos === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Package className="h-10 w-10" />
          <p className="text-sm">No se encontraron productos</p>
        </div>
      )}
    </div>
  );
}
