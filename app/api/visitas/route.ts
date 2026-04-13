// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { esquemaVisita } from "@/lib/validations/visita";

export async function GET() {
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

  let query = supabase
    .from("visitas")
    .select("*")
    .order("fecha", { ascending: false })
    .order("hora_inicio", { ascending: true });

  if (perfil?.role === "empleado") {
    query = query.eq("created_by", user.id) as typeof query;
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = esquemaVisita.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Error de validación" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("visitas")
    .insert({
      ...parsed.data,
      notas: parsed.data.notas ?? null,
      created_by: user.id,
      estado: "pendiente",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
