"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import type { EstadoVisita, Rol, Visita } from "@/types/database";
import { ETIQUETAS_ESTADO_VISITA } from "@/lib/utils";

const TRANSICIONES: Record<EstadoVisita, EstadoVisita | null> = {
  pendiente: "en_proceso",
  en_proceso: "completada",
  completada: null,
  cancelada: null,
};

const ETIQUETA_BOTON: Record<EstadoVisita, string> = {
  pendiente: "Marcar en proceso",
  en_proceso: "Marcar completada",
  completada: "",
  cancelada: "",
};

interface AccionesVisitaProps {
  visita: Visita;
  role: Rol;
}

export function AccionesVisita({ visita, role }: AccionesVisitaProps) {
  const router = useRouter();
  const [actualizando, setActualizando] = useState(false);
  const [estadoActual, setEstadoActual] = useState<EstadoVisita>(visita.estado);

  const siguienteEstado = TRANSICIONES[estadoActual];
  const puedeEditar = role === "admin" || role === "empleado";

  async function cambiarEstado(nuevoEstado: EstadoVisita) {
    setActualizando(true);
    const res = await fetch(`/api/visitas/${visita.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    if (res.ok) {
      setEstadoActual(nuevoEstado);
      toast.success(`Visita marcada como ${ETIQUETAS_ESTADO_VISITA[nuevoEstado]}`);
      router.refresh();
    } else {
      toast.error("Error al actualizar el estado");
    }
    setActualizando(false);
  }

  async function eliminarVisita() {
    const res = await fetch(`/api/visitas/${visita.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Visita eliminada");
      router.push("/dashboard/visitas");
    } else {
      toast.error("Error al eliminar la visita");
    }
  }

  if (!puedeEditar) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {siguienteEstado && (
        <Button onClick={() => cambiarEstado(siguienteEstado)} disabled={actualizando}>
          {actualizando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {ETIQUETA_BOTON[estadoActual]}
        </Button>
      )}

      {estadoActual === "pendiente" && (
        <Button
          variant="outline"
          onClick={() => cambiarEstado("cancelada")}
          disabled={actualizando}
        >
          Cancelar visita
        </Button>
      )}

      <Button variant="outline" asChild>
        <Link href={`/dashboard/visitas/${visita.id}/edit`}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Link>
      </Button>

            {role === "admin" && (
        <AlertDialog>
<<<<<<< HEAD
          <AlertDialogTrigger
            render={
              <Button variant="ghost" className="text-destructive hover:text-destructive" />
            }
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
=======
          {/* Le decimos a TypeScript que ignore temporalmente el error de asChild */}
          {/* @ts-expect-error: La propiedad asChild no está en la definición de tipos, pero es válida en Radix/shadcn */}
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-destructive hover:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
>>>>>>> a1e0cd5285a6c8e5a1ae076fafcf17c3cbafd784
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar visita?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={eliminarVisita}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
