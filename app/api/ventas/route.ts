import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerClient();

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
    `
    )
    .order("fecha_compra", { ascending: false });

  if (perfil?.role === "cliente") {
    query = query.eq("cliente_id", user.id) as typeof query;
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
