// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TarjetaVisita } from "@/components/visitas/TarjetaVisita";
import { Plus, CalendarX } from "lucide-react";
import type { Visita } from "@/types/database";

export default async function PaginaVisitas() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  let query = supabase
    .from("visitas")
    .select("*")
    .order("fecha", { ascending: false })
    .order("hora_inicio", { ascending: true });

  if (perfil?.role === "empleado") {
    query = query.eq("created_by", user.id) as typeof query;
  }

  const { data: visitas } = await query;

  const puedeCrear =
    perfil?.role === "empleado" || perfil?.role === "admin";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Visitas</h2>
        {puedeCrear && (
          <Button asChild size="sm">
            <Link href="/dashboard/visitas/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Nueva visita
            </Link>
          </Button>
        )}
      </div>

      {!visitas || visitas.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
          <CalendarX className="h-12 w-12" />
          <p className="text-base font-medium">No hay visitas registradas</p>
          {puedeCrear && (
            <Button variant="outline" asChild>
              <Link href="/dashboard/visitas/nueva">
                <Plus className="mr-2 h-4 w-4" />
                Crear primera visita
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(visitas as Visita[]).map((visita) => (
            <TarjetaVisita key={visita.id} visita={visita} />
          ))}
        </div>
      )}
    </div>
  );
}
