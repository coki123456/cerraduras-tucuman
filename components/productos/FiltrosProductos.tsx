"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";

interface FiltrosProductosProps {
  busquedaActual: string;
  categoriaActual: string;
}

/** Actualiza los filtros en la URL → el Server Component re-filtra en Supabase */
export function FiltrosProductos({ busquedaActual, categoriaActual }: FiltrosProductosProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const actualizarUrl = useCallback(
    (busqueda: string, categoria: string) => {
      const params = new URLSearchParams();
      if (busqueda) params.set("busqueda", busqueda);
      if (categoria && categoria !== "todas") params.set("categoria", categoria);
      const query = params.toString();
      startTransition(() => {
        router.push(`/dashboard/productos${query ? `?${query}` : ""}`);
      });
    },
    [router]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        <Input
          placeholder="Buscar productos…"
          className="pl-9"
          defaultValue={busquedaActual}
          onChange={(e) => actualizarUrl(e.target.value, categoriaActual)}
        />
      </div>

      <Select
        defaultValue={categoriaActual}
        onValueChange={(v) => actualizarUrl(busquedaActual, v ?? "")}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas</SelectItem>
          <SelectItem value="cerraduras">Cerraduras</SelectItem>
          <SelectItem value="herrajes">Herrajes</SelectItem>
          <SelectItem value="accesorios">Accesorios</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
