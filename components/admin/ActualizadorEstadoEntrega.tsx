"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ETIQUETAS_ESTADO_COMPRA } from "@/lib/utils";
import type { EstadoCompra } from "@/types/database";

interface ActualizadorEstadoEntregaProps {
  ventaId: string;
  estadoCompra: EstadoCompra;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
}

const ESTADOS_COMPRA: EstadoCompra[] = [
  "en_proceso",
  "en_preparacion",
  "lista_para_retirar",
  "despachado",
  "finalizado",
];

export function ActualizadorEstadoEntrega({
  ventaId,
  estadoCompra,
  clienteNombre,
  clienteEmail,
  clienteTelefono,
}: ActualizadorEstadoEntregaProps) {
  const router = useRouter();
  const [actualizando, setActualizando] = useState(false);

  async function cambiarEstado(nuevoEstado: EstadoCompra) {
    setActualizando(true);
    try {
      const response = await fetch(
        `/api/admin/ventas/${ventaId}/estado-compra`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado_compra: nuevoEstado }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Error al cambiar estado");
        return;
      }

      toast.success(
        `Estado actualizado a: ${ETIQUETAS_ESTADO_COMPRA[nuevoEstado]}`
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
      <DropdownMenuTrigger className="p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:pointer-events-none" disabled={actualizando}>
        {actualizando ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MoreVertical className="h-4 w-4" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Cambiar estado de compra</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {ESTADOS_COMPRA.map((estado) => (
          <DropdownMenuItem
            key={estado}
            onClick={() => cambiarEstado(estado)}
            disabled={actualizando || estado === estadoCompra}
            className="cursor-pointer"
          >
            {estado === estadoCompra && (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            )}
            {estado !== estadoCompra && <div className="w-6" />}
            <span>{ETIQUETAS_ESTADO_COMPRA[estado]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
