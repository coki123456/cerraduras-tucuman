import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  obtenerPago,
  obtenerOrdenMercante,
  verificarFirmaWebhook,
} from "@/lib/services/mercadopago.service";
import {
  enviarEmailCompraConfirmada,
  enviarEmailAlertaStock,
} from "@/lib/services/email.service";
import type {
  VentaConCliente,
  VentaItemConProducto,
  StockAlertConProducto,
} from "@/types/database";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const signature = request.headers.get("x-signature");

  if (!body) return NextResponse.json({ ok: true });

  const dataId = (body.data as Record<string, unknown>)?.id
    ?? (body.resource as string)?.split("/").pop();
  if (!dataId) return NextResponse.json({ ok: true });

  // 1. Verificar firma (Seguridad)
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (secret && signature) {
    const esValido = verificarFirmaWebhook(signature, String(dataId), secret);
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
      ventaId = pago.external_reference as string;
    } else if (body.topic === "merchant_order" || body.type === "merchant_order") {
      const orden = await obtenerOrdenMercante(String(dataId));
      if (orden.status === "closed" || orden.order_status === "paid") {
        ventaId = orden.external_reference as string;
        const pagoAprobado = (orden.payments as Array<{ status: string; id: string }>)
          ?.find((p) => p.status === "approved");
        paymentId = pagoAprobado ? String(pagoAprobado.id) : null;
      }
    }

    if (!ventaId) return NextResponse.json({ ok: true });

    // 3. Procesar la venta si está pendiente
    const { data: ventaRaw } = await supabase
      .from("ventas")
      .select("*, users(email, nombre_completo)")
      .eq("id", ventaId)
      .single();

    const venta = ventaRaw as VentaConCliente | null;

    if (!venta || venta.estado_pago !== "pendiente") {
      return NextResponse.json({ ok: true });
    }

    // 4. Confirmación Atómica
    const { data: admin } = await supabase
      .from("users")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single();

    const { error: errorConfirmacion } = await supabase.rpc("confirmar_venta", {
      p_venta_id: ventaId,
      p_payment_id: paymentId,
      p_admin_id: admin?.id ?? "",
    });

    // RACE CONDITION / STOCK INSUFICIENTE:
    // Si confirmar_venta falla (ej: stock llegó a 0 por compra simultánea),
    // el cliente YA pagó. Marcamos para reembolso manual en lugar de fallar silenciosamente.
    if (errorConfirmacion) {
      await supabase
        .from("ventas")
        .update({
          estado_pago: "pagado",
          estado: "cancelada",
          mercadopago_payment_id: paymentId,
          notas: `REQUIERE REEMBOLSO MANUAL: Pago recibido (ID: ${paymentId ?? "desconocido"}) pero el stock era insuficiente al confirmar. Error: ${errorConfirmacion.message}`,
        })
        .eq("id", ventaId);

      console.error(
        `[Webhook MP] confirmar_venta falló para venta ${ventaId}. Marcada para reembolso. Error: ${errorConfirmacion.message}`
      );
      return NextResponse.json({ ok: true });
    }

    // 5. Notificaciones (Email)
    const { data: itemsRaw } = await supabase
      .from("venta_items")
      .select("*, productos(nombre)")
      .eq("venta_id", ventaId);

    const items = itemsRaw as VentaItemConProducto[] | null;

    const clienteEmail = venta.users?.email;
    const clienteNombre = venta.users?.nombre_completo ?? "Cliente";

    if (clienteEmail && items) {
      await enviarEmailCompraConfirmada({
        clienteEmail,
        clienteNombre,
        ventaId,
        items: items.map((i) => ({
          nombre: i.productos?.nombre ?? "Producto",
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
          subtotal: i.subtotal,
        })),
        totalMonto: venta.total_monto,
      });
    }

    // 6. Alertas de Stock
    const { data: alertasRaw } = await supabase
      .from("stock_alerts")
      .select("*, productos(nombre)")
      .eq("resuelto", false)
      .eq("leido", false)
      .limit(5);

    const alertasNuevas = alertasRaw as StockAlertConProducto[] | null;

    for (const alerta of alertasNuevas ?? []) {
      await enviarEmailAlertaStock({
        productoNombre: alerta.productos?.nombre ?? "Producto",
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
