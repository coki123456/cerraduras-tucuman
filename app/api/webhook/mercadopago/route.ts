import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { obtenerPago } from "@/lib/services/mercadopago.service";
import {
  enviarEmailCompraConfirmada,
  enviarEmailAlertaStock,
} from "@/lib/services/email.service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || body.type !== "payment") {
    return NextResponse.json({ ok: true });
  }

  const paymentId = String(body.data?.id);

  try {
    const pago = await obtenerPago(paymentId);

    if (pago.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    const ventaId = pago.external_reference;
    if (!ventaId) {
      return NextResponse.json({ error: "Sin external_reference" }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Verificar que la venta no fue ya procesada
    const { data: venta } = await supabase
      .from("ventas")
      .select("*, users(email, nombre_completo)")
      .eq("id", ventaId)
      .single();

    if (!venta || venta.estado !== "pendiente") {
      return NextResponse.json({ ok: true });
    }

    // Obtener admin id para las alertas
    const { data: admin } = await supabase
      .from("users")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single();

    // Ejecutar confirmación atómica (descuenta stock + crea alertas)
    await supabase.rpc("confirmar_venta", {
      p_venta_id: ventaId,
      p_payment_id: paymentId,
      p_admin_id: admin?.id ?? "",
    });

    // Obtener items para el email
    const { data: items } = await supabase
      .from("venta_items")
      .select("*, productos(nombre)")
      .eq("venta_id", ventaId);

    // Email de confirmación al cliente
    const clienteEmail = (venta as { users?: { email: string; nombre_completo: string } }).users?.email;
    const clienteNombre = (venta as { users?: { email: string; nombre_completo: string } }).users?.nombre_completo ?? "Cliente";

    if (clienteEmail && items) {
      await enviarEmailCompraConfirmada({
        clienteEmail,
        clienteNombre,
        ventaId,
        items: items.map((i) => ({
          nombre: (i as { productos?: { nombre: string } }).productos?.nombre ?? "Producto",
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
          subtotal: i.subtotal,
        })),
        totalMonto: venta.total_monto,
      });
    }

    // Verificar alertas de stock recién creadas y enviar emails
    const { data: alertasNuevas } = await supabase
      .from("stock_alerts")
      .select("*, productos(nombre)")
      .eq("resuelto", false)
      .eq("leido", false)
      .order("triggered_at", { ascending: false })
      .limit(10);

    for (const alerta of alertasNuevas ?? []) {
      await enviarEmailAlertaStock({
        productoNombre: (alerta as { productos?: { nombre: string } }).productos?.nombre ?? "Producto",
        stockActual: alerta.stock_actual,
        stockMinimo: alerta.stock_minimo,
      });
      // Marcar como notificado
      await supabase
        .from("stock_alerts")
        .update({ leido: true })
        .eq("id", alerta.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook MercadoPago error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
