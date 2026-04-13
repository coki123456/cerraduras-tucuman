"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatARS } from "@/lib/utils";
import type { ItemCarrito as IItemCarrito } from "@/lib/carrito-context";

interface ItemCarritoProps {
  item: IItemCarrito;
  onCambiarCantidad: (id: string, cantidad: number) => void;
  onQuitar: (id: string) => void;
}

/** Molécula: fila de item en el carrito */
export function ItemCarrito({ item, onCambiarCantidad, onQuitar }: ItemCarritoProps) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.nombre}</p>
        <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
        <p className="text-sm text-primary font-bold mt-0.5">
          {formatARS(item.precio_unitario)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onCambiarCantidad(item.producto_id, item.cantidad - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>

        <Input
          type="number"
          min={1}
          max={999}
          value={item.cantidad}
          onChange={(e) =>
            onCambiarCantidad(item.producto_id, parseInt(e.target.value) || 1)
          }
          className="h-7 w-12 text-center p-0 font-mono text-sm"
        />

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onCambiarCantidad(item.producto_id, item.cantidad + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <div className="text-right">
        <p className="text-sm font-bold tabular-nums">
          {formatARS(item.precio_unitario * item.cantidad)}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-destructive hover:text-destructive"
        onClick={() => onQuitar(item.producto_id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
