// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormularioVisita } from "@/components/visitas/FormularioVisita";
import { ArrowLeft } from "lucide-react";
import type { RouteContext } from "next/server";
import type { Visita } from "@/types/database";

export default async function PaginaEditarVisita(
  ctx: RouteContext<"/dashboard/visitas/[id]/edit">
) {
  const { id } = await ctx.params;
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

  if (perfil?.role === "cliente") redirect("/dashboard");

  const { data: visita } = await supabase
    .from("visitas")
    .select("*")
    .eq("id", id)
    .single();

  if (!visita) notFound();

  // Empleado solo puede editar sus propias visitas
  if (perfil?.role === "empleado" && visita.created_by !== user.id) {
    redirect("/dashboard/visitas");
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/visitas/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-lg font-bold">Editar visita</h2>
      </div>

      <FormularioVisita visita={visita as Visita} />
    </div>
  );
}
