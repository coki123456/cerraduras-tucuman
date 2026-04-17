// @ts-nocheck
import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { RouteContext } from "next/server";
import type { EstadoCompra } from "@/types/database";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/ventas/[id]/estado-compra">
) {
  try {
    const { id } = await ctx.params;
    const { estado_compra } = await request.json() as { estado_compra: EstadoCompra };

    // Validar que sea un estado válido
    const estadosValidos: EstadoCompra[] = [
      "en_proceso",
      "en_preparacion",
      "lista_para_retirar",
      "despachado",
      "finalizado",
    ];

    if (!estadosValidos.includes(estado_compra)) {
      return NextResponse.json(
        { error: "Estado de compra inválido" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Verificar que sea admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "No tienes permiso" },
        { status: 403 }
      );
    }

    // Obtener la venta actual
    const { data: venta } = await supabase
      .from("ventas")
      .select("*")
      .eq("id", id)
      .single();

    if (!venta) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    // Validar que el pago esté confirmado antes de permitir cambios en la compra
    if (venta.estado_pago !== "pagado") {
      return NextResponse.json(
        {
          error:
            "No se puede cambiar el estado de compra si el pago no está confirmado",
        },
        { status: 400 }
      );
    }

    // Actualizar estado de compra
    await supabase
      .from("ventas")
      .update({
        estado_compra,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({ ok: true, estado_compra });
  } catch (err) {
    console.error("Error al actualizar estado de compra:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
