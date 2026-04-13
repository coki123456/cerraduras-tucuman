import { Badge } from "@/components/ui/badge";
import { ETIQUETAS_ESTADO_VISITA } from "@/lib/utils";
import type { EstadoVisita } from "@/types/database";

interface InsigniaEstadoProps {
  estado: EstadoVisita;
}

const clases: Record<EstadoVisita, string> = {
  pendiente: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  en_proceso: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completada: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelada: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function InsigniaEstado({ estado }: InsigniaEstadoProps) {
  return (
    <Badge variant="outline" className={clases[estado]}>
      {ETIQUETAS_ESTADO_VISITA[estado]}
    </Badge>
  );
}
