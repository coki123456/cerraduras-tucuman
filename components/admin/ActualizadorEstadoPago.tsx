"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreVertical, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { EstadoPago } from "@/types/database";

interface ActualizadorEstadoPagoProps {
  ventaId: string;
  estadoPago: EstadoPago;
}

const ESTADOS_PAGO: EstadoPago[] = ["pendiente", "pagado", "rechazado"];

const ETIQUETAS_ESTADO_PAGO: Record<EstadoPago, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  rechazado: "Rechazado",
};

export function ActualizadorEstadoPago({
  ventaId,
  estadoPago,
}: ActualizadorEstadoPagoProps) {
  const router = useRouter();
  const [actualizando, setActualizando] = useState(false);

  async function cambiarEstado(nuevoEstado: EstadoPago) {
    setActualizando(true);
    try {
      const response = await fetch(`/api/admin/ventas/${ventaId}/estado-pago`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_pago: nuevoEstado }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Error al cambiar estado de pago");
        return;
      }

      toast.success(
        `Estado de pago actualizado a: ${ETIQUETAS_ESTADO_PAGO[nuevoEstado]}`
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Error inesperado");
    } finally {
      setActualizando(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={actualizando}>
          {actualizando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Cambiar estado de pago</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {ESTADOS_PAGO.map((estado) => (
          <DropdownMenuItem
            key={estado}
            onClick={() => cambiarEstado(estado)}
            disabled={actualizando || estado === estadoPago}
            className="cursor-pointer"
          >
            {estado === estadoPago && (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            )}
            {estado !== estadoPago && <div className="w-6" />}
            <span>{ETIQUETAS_ESTADO_PAGO[estado]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
