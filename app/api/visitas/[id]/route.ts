// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { esquemaVisita } from "@/lib/validations/visita";
import { z } from "zod";
import type { RouteContext } from "next/server";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/visitas/[id]">
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("visitas")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Visita no encontrada" }, { status: 404 });
  }

  const { data: perfil } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (perfil?.role === "empleado" && data.created_by !== user.id) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  return NextResponse.json(data);
}

const esquemaActualizacion = esquemaVisita.partial().extend({
  estado: z
    .enum(["pendiente", "en_proceso", "completada", "cancelada"])
    .optional(),
});

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/visitas/[id]">
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Verificar que la visita existe y el usuario tiene permisos
  const { data: visitaExistente } = await supabase
    .from("visitas")
    .select("created_by")
    .eq("id", id)
    .single();

  if (!visitaExistente) {
    return NextResponse.json({ error: "Visita no encontrada" }, { status: 404 });
  }

  const { data: perfil } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    perfil?.role === "empleado" &&
    visitaExistente.created_by !== user.id
  ) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = esquemaActualizacion.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("visitas")
    .update({ ...parsed.data, notas: parsed.data.notas ?? null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/visitas/[id]">
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: perfil } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (perfil?.role !== "admin") {
    return NextResponse.json({ error: "Solo el admin puede eliminar visitas" }, { status: 403 });
  }

  const { error } = await supabase.from("visitas").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
