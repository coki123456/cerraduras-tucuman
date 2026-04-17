// @ts-nocheck
// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { schemaProducto } from "@/lib/validations/producto";

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = user
    ? await supabase.from("productos").select("*").order("nombre")
    : await supabase.from("productos").select("*").eq("activo", true).order("nombre");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: perfil } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  if (perfil?.role !== "admin") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await request.json();
  const validacion = schemaProducto.safeParse(body);

  if (!validacion.success) {
    return NextResponse.json(
      { error: validacion.error.issues[0].message },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("productos")
    .insert({ ...validacion.data, created_by: user.id })
    .select()
    .single();

  if (error) {
    const mensaje = error.message.includes("unique")
      ? "Ya existe un producto con ese nombre o SKU."
      : error.message;
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
