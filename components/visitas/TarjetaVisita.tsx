import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { InsigniaEstado } from "@/components/visitas/InsigniaEstado";
import { formatFecha, formatHora, ETIQUETAS_TIPO_SERVICIO } from "@/lib/utils";
import { Phone, Clock, Wrench } from "lucide-react";
import type { Visita } from "@/types/database";

interface TarjetaVisitaProps {
  visita: Visita;
}

export function TarjetaVisita({ visita }: TarjetaVisitaProps) {
  return (
    <Link href={`/dashboard/visitas/${visita.id}`}>
      <Card className="border-border/50 hover:border-primary/40 transition-colors cursor-pointer">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{visita.cliente_nombre}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Phone className="h-3 w-3" />
                <span>{visita.cliente_telefono}</span>
              </div>
            </div>
            <InsigniaEstado estado={visita.estado} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {formatFecha(visita.fecha)}
            </span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {formatHora(visita.hora_inicio)} · {visita.duracion_estimada}{" "}
                min
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              <span>{ETIQUETAS_TIPO_SERVICIO[visita.tipo_servicio]}</span>
            </div>
          </div>

          {visita.notas && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {visita.notas}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
