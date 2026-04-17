import { Badge } from "@/components/ui/badge";
import { ETIQUETAS_ESTADO_COMPRA } from "@/lib/utils";
import type { EstadoCompra } from "@/types/database";

interface InsigniaEstadoCompraProps {
  estado: EstadoCompra;
}

const variantes: Record<EstadoCompra, "default" | "secondary" | "destructive" | "outline"> = {
  en_proceso: "secondary",
  en_preparacion: "outline",
  lista_para_retirar: "default",
  despachado: "default",
  finalizado: "default",
};

const clases: Record<EstadoCompra, string> = {
  en_proceso: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  en_preparacion: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  lista_para_retirar: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  despachado: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  finalizado: "bg-green-500/10 text-green-400 border-green-500/20",
};

export function InsigniaEstadoCompra({ estado }: InsigniaEstadoCompraProps) {
  return (
    <Badge variant={variantes[estado]} className={clases[estado]}>
      {ETIQUETAS_ESTADO_COMPRA[estado]}
    </Badge>
  );
}
