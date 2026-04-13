import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { schemaProducto } from "@/lib/validations/producto";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/productos/[id]">
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/productos/[id]">
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: perfil } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  if (perfil?.role !== "admin") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await request.json();
  const validacion = schemaProducto.partial().safeParse(body);

  if (!validacion.success) {
    return NextResponse.json(
      { error: validacion.error.errors[0].message },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("productos")
    .update({ ...validacion.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/productos/[id]">
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: perfil } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  if (perfil?.role !== "admin") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  // Soft delete: marcar inactivo
  const { error } = await supabase
    .from("productos")
    .update({ activo: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return new Response(null, { status: 204 });
}
