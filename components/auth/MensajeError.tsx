import { AlertCircle } from "lucide-react";

interface MensajeErrorProps {
  mensaje: string;
}

/** Átomo: mensaje de error inline para formularios */
export function MensajeError({ mensaje }: MensajeErrorProps) {
  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive"
    >
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{mensaje}</span>
    </div>
  );
}
