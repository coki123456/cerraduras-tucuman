import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InsigniaStockProps {
  stock: number;
  stockMinimo: number;
  mostrarNumero?: boolean;
}

/** Átomo: badge verde/amarillo/rojo según nivel de stock */
export function InsigniaStock({ stock, stockMinimo, mostrarNumero = true }: InsigniaStockProps) {
  if (stock === 0) {
    return (
      <Badge variant="destructive" className="font-mono">
        Sin stock
      </Badge>
    );
  }

  if (stock < stockMinimo) {
    return (
      <Badge className={cn("font-mono bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20")}>
        {mostrarNumero ? `${stock} (bajo)` : "Stock bajo"}
      </Badge>
    );
  }

  return (
    <Badge className={cn("font-mono bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20")}>
      {mostrarNumero ? stock : "En stock"}
    </Badge>
  );
}
