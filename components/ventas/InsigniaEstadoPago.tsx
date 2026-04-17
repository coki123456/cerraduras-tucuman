import { Badge } from "@/components/ui/badge";
import { ETIQUETAS_ESTADO_PAGO } from "@/lib/utils";
import type { EstadoPago } from "@/types/database";

interface InsigniaEstadoPagoProps {
  estado: EstadoPago;
}

const variantes: Record<EstadoPago, "default" | "secondary" | "destructive" | "outline"> = {
  pendiente: "secondary",
  pagado: "default",
  rechazado: "destructive",
};

const clases: Record<EstadoPago, string> = {
  pendiente: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  pagado: "bg-green-500/10 text-green-400 border-green-500/20",
  rechazado: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function InsigniaEstadoPago({ estado }: InsigniaEstadoPagoProps) {
  return (
    <Badge variant={variantes[estado]} className={clases[estado]}>
      {ETIQUETAS_ESTADO_PAGO[estado]}
    </Badge>
  );
}
