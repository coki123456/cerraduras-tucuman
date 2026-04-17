import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Rol } from "@/types/database";

type PerfilRol = { role: Rol };

const LIMITE_DEFAULT = 50;
const LIMITE_MAXIMO = 100;

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: perfilRaw } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  const perfil = perfilRaw as PerfilRol | null;

  const { searchParams } = new URL(request.url);
  const pagina = Math.max(1, parseInt(searchParams.get("pagina") ?? "1"));
  const limite = Math.min(
    Math.max(1, parseInt(searchParams.get("limite") ?? String(LIMITE_DEFAULT))),
    LIMITE_MAXIMO
  );
  const desde = (pagina - 1) * limite;

  let query = supabase
    .from("ventas")
    .select(
      `
      *,
      venta_items(
        id,
        cantidad,
        precio_unitario,
        subtotal,
        productos(nombre, sku)
      )
    `,
      { count: "exact" }
    )
    .order("fecha_compra", { ascending: false })
    .range(desde, desde + limite - 1);

  if (perfil?.role === "cliente") {
    query = query.eq("cliente_id", user.id) as typeof query;
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, total: count ?? 0, pagina, limite });
}
