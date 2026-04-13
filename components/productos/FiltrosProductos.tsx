"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { CategoriaProducto } from "@/types/database";

interface FiltrosProductosProps {
  busqueda: string;
  categoria: CategoriaProducto | "todas";
  onBusqueda: (valor: string) => void;
  onCategoria: (valor: CategoriaProducto | "todas") => void;
}

/** Molécula: barra de búsqueda + filtro de categoría */
export function FiltrosProductos({
  busqueda,
  categoria,
  onBusqueda,
  onCategoria,
}: FiltrosProductosProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar productos…"
          className="pl-9"
          value={busqueda}
          onChange={(e) => onBusqueda(e.target.value)}
        />
      </div>

      <Select
        value={categoria}
        onValueChange={(v) => onCategoria(v as CategoriaProducto | "todas")}
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
