// @ts-nocheck
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { RouteContext } from "next/server";
import type { EstadoPago } from "@/types/database";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/ventas/[id]/estado-pago">
) {
  try {
    const { id } = await ctx.params;
    const { estado_pago } = await request.json() as { estado_pago: EstadoPago };

    // Validar que sea un estado válido
    if (!["pendiente", "pagado", "rechazado"].includes(estado_pago)) {
      return NextResponse.json(
        { error: "Estado de pago inválido" },
        { status: 400 }
      );
    }

    // Verificar autenticación con el cliente normal (tiene las cookies del request)
    const supabase = await createClient();
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

    // Obtener la venta actual (con admin client para bypasear RLS)
    const adminClient = await createAdminClient();
    const { data: venta } = await adminClient
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

    // Si se marca como pagado y aún no se procesó el stock
    if (estado_pago === "pagado" && venta.estado_pago === "pendiente") {
      const { data: admin } = await adminClient
        .from("users")
        .select("id")
        .eq("role", "admin")
        .limit(1)
        .single();

      // Llamar a la función RPC confirmar_venta
      await adminClient.rpc("confirmar_venta", {
        p_venta_id: id,
        p_payment_id: null, // Sin ID de MercadoPago (pago manual)
        p_admin_id: admin?.id ?? "",
      });
    }
    // Si se marca como rechazado
    else if (estado_pago === "rechazado") {
      await adminClient
        .from("ventas")
        .update({
          estado_pago: "rechazado",
          estado: "cancelada",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    }
    // Si ya estaba pagado, simplemente actualizar
    else if (estado_pago === "pagado" && venta.estado_pago === "pagado") {
      // Ya pagado, no hacer nada
      return NextResponse.json({
        ok: true,
        message: "La venta ya estaba pagada",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al actualizar estado de pago:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
