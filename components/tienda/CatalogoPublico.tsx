"use client";

import { useState, useMemo } from "react";
import { Package, Lock, Wrench, Search, X } from "lucide-react";
import { TarjetaProducto } from "@/components/productos/TarjetaProducto";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Producto, CategoriaProducto } from "@/types/database";
import { ETIQUETAS_CATEGORIA } from "@/lib/utils";

interface CatalogoPublicoProps {
  productos: Producto[];
}

const CATEGORIAS: CategoriaProducto[] = ["cerraduras", "herrajes", "accesorios"];

const ICONOS_CATEGORIA: Record<CategoriaProducto, React.ReactNode> = {
  cerraduras: <Lock className="h-12 w-12" />,
  herrajes: <Wrench className="h-12 w-12" />,
  accesorios: <Package className="h-12 w-12" />,
};

const GRADIENTES: Record<CategoriaProducto, string> = {
  cerraduras: "from-blue-500 to-slate-600",
  herrajes: "from-orange-500 to-amber-600",
  accesorios: "from-green-500 to-emerald-600",
};

export function CatalogoPublico({ productos }: CatalogoPublicoProps) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaProducto | null>(null);

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

  const productosResultado = useMemo(() => {
    if (busqueda === "") return [];
    return CATEGORIAS.flatMap((cat) => productosPorCategoria[cat]);
  }, [productosPorCategoria, busqueda]);

  // Si hay búsqueda activa, mostrar resultados de todas las categorías
  const mostrarResultados = busqueda !== "";

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold">Nuestros productos</h2>
      </div>

      {/* Búsqueda mejorada */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o SKU..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9 pr-9 h-10"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Vista de resultados (búsqueda activa) */}
      {mostrarResultados && (
        <div className="space-y-6">
          {productosResultado.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <Package className="h-10 w-10" />
              <p className="text-sm">No se encontraron productos</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {productosResultado.length} resultado{productosResultado.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {productosResultado.map((producto) => (
                  <TarjetaProducto key={producto.id} producto={producto} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Vista de categorías (sin búsqueda) */}
      {!mostrarResultados && (
        <>
          {/* Si hay una categoría seleccionada, mostrar productos de esa categoría */}
          {categoriaSeleccionada ? (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCategoriaSeleccionada(null)}
                className="gap-2"
              >
                ← Volver a categorías
              </Button>

              <h3 className="text-xl font-semibold capitalize">
                {ETIQUETAS_CATEGORIA[categoriaSeleccionada]}
              </h3>

              {productosPorCategoria[categoriaSeleccionada].length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground rounded-lg bg-muted/20">
                  <Package className="h-10 w-10" />
                  <p className="text-sm">No hay productos en esta categoría</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {productosPorCategoria[categoriaSeleccionada].map((producto) => (
                    <TarjetaProducto key={producto.id} producto={producto} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Grid de Cards de categorías */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CATEGORIAS.map((categoria) => (
                <button
                  key={categoria}
                  onClick={() => setCategoriaSeleccionada(categoria)}
                  className="group"
                >
                  <Card className="border-border/50 overflow-hidden hover:shadow-lg transition-shadow h-full">
                    {/* Fondo con gradiente e icono */}
                    <div
                      className={`bg-gradient-to-br ${GRADIENTES[categoria]} h-40 flex items-center justify-center text-white relative overflow-hidden`}
                    >
                      {/* Icono */}
                      <div className="relative z-10 opacity-90 group-hover:opacity-100 transition-opacity">
                        {ICONOS_CATEGORIA[categoria]}
                      </div>

                      {/* Overlay decorativo */}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    </div>

                    {/* Contenido */}
                    <CardContent className="pt-6 pb-6">
                      <h3 className="text-lg font-semibold capitalize text-foreground">
                        {ETIQUETAS_CATEGORIA[categoria]}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {productosPorCategoria[categoria].length} producto
                        {productosPorCategoria[categoria].length !== 1 ? "s" : ""}
                      </p>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
