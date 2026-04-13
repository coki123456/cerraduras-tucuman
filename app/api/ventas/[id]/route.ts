import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { RouteContext } from "next/server";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/ventas/[id]">
) {
  const { id } = await ctx.params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: venta, error } = await supabase
    .from("ventas")
    .select(
      `
      *,
      venta_items(
        id,
        cantidad,
        precio_unitario,
        subtotal,
        productos(nombre, sku, categoria)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !venta) {
    return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
  }

  // Verificar acceso: cliente solo puede ver sus propias ventas
  const { data: perfil } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (perfil?.role === "cliente" && venta.cliente_id !== user.id) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  return NextResponse.json(venta);
}
