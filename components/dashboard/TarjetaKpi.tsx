import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface TarjetaKpiProps {
  titulo: string;
  valor: string | number;
  descripcion?: string;
  icono: LucideIcon;
  variante?: "default" | "amarillo" | "rojo" | "verde";
  cargando?: boolean;
}

const variantes = {
  default: "text-muted-foreground",
  amarillo: "text-primary",
  rojo: "text-destructive",
  verde: "text-emerald-400",
};

/** Átomo: tarjeta de KPI para el dashboard */
export function TarjetaKpi({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  variante = "default",
  cargando = false,
}: TarjetaKpiProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{titulo}</p>
            {cargando ? (
              <div className="h-8 w-24 rounded bg-muted animate-pulse" />
            ) : (
              <p className="text-2xl font-bold tracking-tight">{valor}</p>
            )}
            {descripcion && (
              <p className="text-xs text-muted-foreground">{descripcion}</p>
            )}
          </div>
          <div
            className={cn(
              "rounded-lg p-2 bg-muted/50",
              variantes[variante]
            )}
          >
            <Icono className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
