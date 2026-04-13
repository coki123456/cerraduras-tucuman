"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsigniaEstado } from "@/components/visitas/InsigniaEstado";
import {
  formatFecha,
  formatHora,
  ETIQUETAS_TIPO_SERVICIO,
  ETIQUETAS_ESTADO_VISITA,
} from "@/lib/utils";
import {
  ArrowLeft,
  Phone,
  Clock,
  Wrench,
  FileText,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
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
import { useAuth } from "@/lib/auth-context";
import type { EstadoVisita, Visita } from "@/types/database";

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

export default function PaginaDetalleVisita() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { role } = useAuth();
  const [visita, setVisita] = useState<Visita | null>(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    fetch(`/api/visitas/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setVisita(data);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, [id]);

  async function cambiarEstado(nuevoEstado: EstadoVisita) {
    setActualizando(true);
    const res = await fetch(`/api/visitas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    if (res.ok) {
      const actualizada = await res.json();
      setVisita(actualizada);
      toast.success(`Visita marcada como ${ETIQUETAS_ESTADO_VISITA[nuevoEstado]}`);
    } else {
      toast.error("Error al actualizar el estado");
    }
    setActualizando(false);
  }

  async function cancelarVisita() {
    await cambiarEstado("cancelada");
  }

  async function eliminarVisita() {
    const res = await fetch(`/api/visitas/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Visita eliminada");
      router.push("/dashboard/visitas");
    } else {
      toast.error("Error al eliminar la visita");
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!visita) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Visita no encontrada
      </div>
    );
  }

  const siguienteEstado = TRANSICIONES[visita.estado];
  const puedeEditar = role === "admin" || role === "empleado";

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/visitas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{visita.cliente_nombre}</h2>
          <p className="text-xs text-muted-foreground">
            {formatFecha(visita.fecha)} a las {formatHora(visita.hora_inicio)}
          </p>
        </div>
        <InsigniaEstado estado={visita.estado} />
      </div>

      {/* Detalle */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detalle de la visita</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <span>{visita.cliente_telefono}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wrench className="h-4 w-4 shrink-0" />
              <span>{ETIQUETAS_TIPO_SERVICIO[visita.tipo_servicio]}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{visita.duracion_estimada} minutos estimados</span>
            </div>
          </div>

          {visita.notas && (
            <div className="flex gap-2 text-sm text-muted-foreground pt-1 border-t border-border/40">
              <FileText className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{visita.notas}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones */}
      {puedeEditar && (
        <div className="flex flex-wrap gap-3">
          {siguienteEstado && (
            <Button
              onClick={() => cambiarEstado(siguienteEstado)}
              disabled={actualizando}
            >
              {actualizando && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {ETIQUETA_BOTON[visita.estado]}
            </Button>
          )}

          {visita.estado === "pendiente" && (
            <Button
              variant="outline"
              onClick={cancelarVisita}
              disabled={actualizando}
            >
              Cancelar visita
            </Button>
          )}

          <Button variant="outline" asChild>
            <Link href={`/dashboard/visitas/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>

          {role === "admin" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-destructive hover:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
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
      )}
    </div>
  );
}
