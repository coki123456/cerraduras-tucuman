import { Badge } from "@/components/ui/badge";
import { ETIQUETAS_ESTADO_VENTA } from "@/lib/utils";
import type { EstadoVenta } from "@/types/database";

interface InsigniaEstadoVentaProps {
  estado: EstadoVenta;
}

const variantes: Record<EstadoVenta, "default" | "secondary" | "destructive" | "outline"> = {
  pendiente: "secondary",
  confirmada: "default",
  cancelada: "destructive",
};

const clases: Record<EstadoVenta, string> = {
  pendiente: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  confirmada: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelada: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function InsigniaEstadoVenta({ estado }: InsigniaEstadoVentaProps) {
  return (
    <Badge variant={variantes[estado]} className={clases[estado]}>
      {ETIQUETAS_ESTADO_VENTA[estado]}
    </Badge>
  );
}
