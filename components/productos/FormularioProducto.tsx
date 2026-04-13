"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { schemaProducto, type ProductoInput } from "@/lib/validations/producto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { MensajeError } from "@/components/auth/MensajeError";
import { Loader2 } from "lucide-react";
import { generarSKU } from "@/lib/utils";
import { toast } from "sonner";
import type { Producto } from "@/types/database";

interface FormularioProductoProps {
  producto?: Producto;
  modo: "crear" | "editar";
}

/** Organismo: formulario de creación/edición de producto */
export function FormularioProducto({ producto, modo }: FormularioProductoProps) {
  const router = useRouter();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductoInput>({
    resolver: zodResolver(schemaProducto),
    defaultValues: producto
      ? {
          nombre: producto.nombre,
          descripcion: producto.descripcion ?? "",
          precio: producto.precio,
          stock: producto.stock,
          stock_minimo: producto.stock_minimo,
          categoria: producto.categoria,
          sku: producto.sku,
          activo: producto.activo,
        }
      : {
          stock: 0,
          stock_minimo: 5,
          activo: true,
        },
  });

  const nombre = watch("nombre");
  const activo = watch("activo");

  function generarSkuDesdeNombre() {
    if (nombre) setValue("sku", generarSKU(nombre));
  }

  async function onSubmit(data: ProductoInput) {
    setErrorServidor(null);

    const url =
      modo === "crear"
        ? "/api/productos"
        : `/api/productos/${producto?.id}`;

    const method = modo === "crear" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErrorServidor(body.error ?? "Error al guardar el producto.");
      return;
    }

    toast.success(
      modo === "crear" ? "Producto creado correctamente" : "Producto actualizado"
    );
    router.push("/dashboard/productos");
    router.refresh();
  }

  return (
    <Card className="border-border/50 max-w-2xl">
      <CardHeader>
        <CardTitle>
          {modo === "crear" ? "Nuevo producto" : "Editar producto"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              placeholder="Cerradura de Seguridad Yale"
              {...register("nombre")}
            />
            {errors.nombre && (
              <p className="text-xs text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Descripción del producto…"
              rows={3}
              {...register("descripcion")}
            />
          </div>

          {/* Precio + Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio (ARS) *</Label>
              <Input
                id="precio"
                type="number"
                min="0"
                step="0.01"
                placeholder="85000"
                {...register("precio", { valueAsNumber: true })}
              />
              {errors.precio && (
                <p className="text-xs text-destructive">{errors.precio.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select
                defaultValue={producto?.categoria}
                onValueChange={(v) =>
                  setValue("categoria", v as ProductoInput["categoria"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cerraduras">Cerraduras</SelectItem>
                  <SelectItem value="herrajes">Herrajes</SelectItem>
                  <SelectItem value="accesorios">Accesorios</SelectItem>
                </SelectContent>
              </Select>
              {errors.categoria && (
                <p className="text-xs text-destructive">{errors.categoria.message}</p>
              )}
            </div>
          </div>

          {/* Stock + Stock mínimo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                step="1"
                {...register("stock", { valueAsNumber: true })}
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_minimo">Stock mínimo</Label>
              <Input
                id="stock_minimo"
                type="number"
                min="0"
                step="1"
                {...register("stock_minimo", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <div className="flex gap-2">
              <Input
                id="sku"
                placeholder="YALE-3PT-001"
                className="font-mono uppercase"
                {...register("sku")}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generarSkuDesdeNombre}
                className="shrink-0"
              >
                Generar
              </Button>
            </div>
            {errors.sku && (
              <p className="text-xs text-destructive">{errors.sku.message}</p>
            )}
          </div>

          {/* Activo (solo en edición) */}
          {modo === "editar" && (
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
              <div>
                <p className="text-sm font-medium">Producto activo</p>
                <p className="text-xs text-muted-foreground">
                  Los productos inactivos no se muestran en el catálogo
                </p>
              </div>
              <Switch
                checked={activo}
                onCheckedChange={(v) => setValue("activo", v)}
              />
            </div>
          )}

          {errorServidor && <MensajeError mensaje={errorServidor} />}

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : modo === "crear" ? (
                "Crear producto"
              ) : (
                "Guardar cambios"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
