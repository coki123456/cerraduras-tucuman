import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsigniaEstado } from "@/components/visitas/InsigniaEstado";
import { formatFecha, formatHora, ETIQUETAS_TIPO_SERVICIO } from "@/lib/utils";
import { ArrowLeft, Phone, Clock, Wrench, FileText } from "lucide-react";
import { AccionesVisita } from "./AccionesVisita";
import type { Rol } from "@/types/database";

type PerfilRol = { role: Rol };

type Props = { params: Promise<{ id: string }> };

export default async function PaginaDetalleVisita({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfilRaw } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  const perfil = perfilRaw as PerfilRol | null;

  // Los clientes no tienen acceso a las visitas
  if (perfil?.role !== "admin" && perfil?.role !== "empleado") {
    redirect("/dashboard");
  }

  const { data: visita } = await supabase
    .from("visitas")
    .select("*")
    .eq("id", id)
    .single();

  if (!visita) notFound();

  // Los empleados solo pueden ver sus propias visitas
  if (perfil.role === "empleado" && visita.created_by !== user.id) {
    redirect("/dashboard/visitas");
  }

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

      <AccionesVisita visita={visita} role={perfil.role} />
    </div>
  );
}
