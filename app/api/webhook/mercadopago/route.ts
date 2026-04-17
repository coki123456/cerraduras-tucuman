// @ts-nocheck -- supabase-js join type inference issues
import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { 
  obtenerPago, 
  obtenerOrdenMercante,
  verificarFirmaWebhook 
} from "@/lib/services/mercadopago.service";
import {
  enviarEmailCompraConfirmada,
  enviarEmailAlertaStock,
} from "@/lib/services/email.service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const signature = request.headers.get("x-signature");
  
  if (!body) return NextResponse.json({ ok: true });

  const dataId = body.data?.id || body.resource?.split("/").pop();
  if (!dataId) return NextResponse.json({ ok: true });

  // 1. Verificar firma (Seguridad)
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (secret && signature) {
    const esValido = verificarFirmaWebhook(signature, dataId, secret);
    if (!esValido) {
      console.warn("Firma de webhook de Mercado Pago inválida");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
  }

  try {
    const supabase = await createAdminClient();
    let paymentId: string | null = null;
    let ventaId: string | null = null;

    // 2. Identificar el tipo de notificación y obtener datos básicos
    if (body.type === "payment") {
      paymentId = String(dataId);
      const pago = await obtenerPago(paymentId);
      if (pago.status !== "approved") return NextResponse.json({ ok: true });
      ventaId = pago.external_reference;
    } 
    else if (body.topic === "merchant_order" || body.type === "merchant_order") {
      const orden = await obtenerOrdenMercante(String(dataId));
      // Si la orden está pagada totalmente
      if (orden.status === "closed" || orden.order_status === "paid") {
        ventaId = orden.external_reference;
        // Buscamos el ID del último pago aprobado
        const pagoAprobado = orden.payments?.find(p => p.status === "approved");
        paymentId = pagoAprobado ? String(pagoAprobado.id) : null;
      }
    }

    if (!ventaId) return NextResponse.json({ ok: true });

    // 3. Procesar la venta si está pendiente
    const { data: venta } = await supabase
      .from("ventas")
      .select("*, users(email, nombre_completo)")
      .eq("id", ventaId)
      .single();

    if (!venta || venta.estado_pago !== "pendiente") {
      return NextResponse.json({ ok: true });
    }

    // 4. Confirmación Atómica
    // Obtener admin id para las alertas
    const { data: admin } = await supabase
      .from("users")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single();

    await supabase.rpc("confirmar_venta", {
      p_venta_id: ventaId,
      p_payment_id: paymentId,
      p_admin_id: admin?.id ?? "",
    });

    // 5. Notificaciones (Email)
    const { data: items } = await supabase
      .from("venta_items")
      .select("*, productos(nombre)")
      .eq("venta_id", ventaId);

    const clienteEmail = (venta as any).users?.email;
    const clienteNombre = (venta as any).users?.nombre_completo ?? "Cliente";

    if (clienteEmail && items) {
      await enviarEmailCompraConfirmada({
        clienteEmail,
        clienteNombre,
        ventaId,
        items: items.map((i) => ({
          nombre: (i as any).productos?.nombre ?? "Producto",
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
          subtotal: i.subtotal,
        })),
        totalMonto: venta.total_monto,
      });
    }

    // 6. Alertas de Stock
    const { data: alertasNuevas } = await supabase
      .from("stock_alerts")
      .select("*, productos(nombre)")
      .eq("resuelto", false)
      .eq("leido", false)
      .limit(5);

    for (const alerta of alertasNuevas ?? []) {
      await enviarEmailAlertaStock({
        productoNombre: (alerta as any).productos?.nombre ?? "Producto",
        stockActual: alerta.stock_actual,
        stockMinimo: alerta.stock_minimo,
      });
      await supabase.from("stock_alerts").update({ leido: true }).eq("id", alerta.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook MercadoPago error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
