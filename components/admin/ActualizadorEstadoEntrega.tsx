"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { MapPin, Truck, Check, Loader2, MoreVertical } from "lucide-react";
import { toast } from "sonner";

interface ActualizadorEstadoEntregaProps {
  ventaId: string;
  metodoEntrega: "local" | "envio";
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
}

export function ActualizadorEstadoEntrega({
  ventaId,
  metodoEntrega,
  clienteNombre,
  clienteEmail,
  clienteTelefono,
}: ActualizadorEstadoEntregaProps) {
  const supabase = createClient();
  const [actualizando, setActualizando] = useState(false);

  async function marcarEntregada() {
    setActualizando(true);
    try {
      // Actualizar estado
      const { error: updateError } = await (supabase
        .from("ventas") as any)
        .update({
          estado: "entregado",
          fecha_entrega: new Date().toISOString(),
        })
        .eq("id", ventaId);

      if (updateError) {
        toast.error("Error al marcar como entregado");
        return;
      }

      // Aquí podrías enviar un email de notificación
      // await fetch("/api/email/notificacion-entrega", {
      //   method: "POST",
      //   body: JSON.stringify({
      //     clienteEmail,
      //     clienteNombre,
      //     ventaId,
      //   }),
      // });

      toast.success(`Venta marcada como entregada al cliente ${clienteNombre}`);
    } catch (err) {
      toast.error("Error inesperado");
    } finally {
      setActualizando(false);
    }
  }

  async function marcarEnviada() {
    setActualizando(true);
    try {
      const { error: updateError } = await (supabase
        .from("ventas") as any)
        .update({
          estado: "enviado",
          fecha_entrega: new Date().toISOString(),
        })
        .eq("id", ventaId);

      if (updateError) {
        toast.error("Error al marcar como enviado");
        return;
      }

      toast.success(`Venta marcada como enviada a ${clienteNombre}`);
    } catch (err) {
      toast.error("Error inesperado");
    } finally {
      setActualizando(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="sm" disabled={actualizando}>
          {actualizando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Marcar estado de entrega</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {metodoEntrega === "local" ? (
          <>
            <DropdownMenuCheckboxItem
              onClick={marcarEntregada}
              disabled={actualizando}
              className="cursor-pointer"
            >
              <MapPin className="h-4 w-4 mr-2 text-orange-500" />
              <span>Retirado en local</span>
            </DropdownMenuCheckboxItem>
          </>
        ) : (
          <>
            <DropdownMenuCheckboxItem
              onClick={marcarEnviada}
              disabled={actualizando}
              className="cursor-pointer"
            >
              <Truck className="h-4 w-4 mr-2 text-blue-500" />
              <span>Marcado como enviado</span>
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
