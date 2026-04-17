// @ts-nocheck
import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { obtenerPago, obtenerOrdenMercante } from "@/lib/services/mercadopago.service";
import {
  enviarEmailCompraConfirmada,
  enviarEmailAlertaStock,
} from "@/lib/services/email.service";

/**
 * Cron job: Sincronizar ventas pendientes con MercadoPago
 * Busca ventas con estado_pago='pendiente' creadas hace más de 10 minutos
 * y verifica si el pago fue procesado en MercadoPago
 *
 * Protegido con CRON_SECRET via header Authorization
 */
export async function GET(request: Request) {
  // Verificar que sea una solicitud de cron autorizada
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || !auth || auth !== `Bearer ${secret}`) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const supabase = await createAdminClient();

    // 1. Buscar ventas pendientes de pago creadas hace más de 10 minutos
    const limite = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: ventasPendientes } = await supabase
      .from("ventas")
      .select("*, users(email, nombre_completo)")
      .eq("estado_pago", "pendiente")
      .lt("created_at", limite)
      .order("created_at", { ascending: true });

    let procesadas = 0;
    let confirmadas = 0;
    let rechazadas = 0;

    if (!ventasPendientes || ventasPendientes.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No hay ventas pendientes de sincronización",
        procesadas: 0,
      });
    }

    // 2. Para cada venta pendiente, consultar estado en MercadoPago
    for (const venta of ventasPendientes) {
      try {
        procesadas++;

        // Si no tiene preference_id, saltar (venta sin MP)
        if (!venta.mercadopago_preference_id) {
          continue;
        }

        let paymentId: string | null = null;
        let estadoPago: "pagado" | "rechazado" | null = null;

        // Intentar obtener mediante el pago directo si existe
        if (venta.mercadopago_payment_id) {
          const pago = await obtenerPago(venta.mercadopago_payment_id);
          if (pago.status === "approved") {
            estadoPago = "pagado";
            paymentId = venta.mercadopago_payment_id;
          } else if (
            pago.status === "rejected" ||
            pago.status === "cancelled"
          ) {
            estadoPago = "rechazado";
          }
        } else {
          // Si no, obtener mediante la orden mercante
          const orden = await obtenerOrdenMercante(
            venta.mercadopago_preference_id
          );

          if (orden.status === "closed" || orden.order_status === "paid") {
            estadoPago = "pagado";
            const pagoAprobado = orden.payments?.find(
              (p) => p.status === "approved"
            );
            paymentId = pagoAprobado ? String(pagoAprobado.id) : null;
          } else if (orden.order_status === "cancelled") {
            estadoPago = "rechazado";
          }
        }

        // 3. Actualizar la venta según el estado encontrado
        if (estadoPago === "pagado") {
          const { data: admin } = await supabase
            .from("users")
            .select("id")
            .eq("role", "admin")
            .limit(1)
            .single();

          // Ejecutar RPC confirmar_venta (descuenta stock, etc)
          await supabase.rpc("confirmar_venta", {
            p_venta_id: venta.id,
            p_payment_id: paymentId,
            p_admin_id: admin?.id ?? "",
          });

          confirmadas++;

          // Enviar email de confirmación
          const { data: items } = await supabase
            .from("venta_items")
            .select("*, productos(nombre)")
            .eq("venta_id", venta.id);

          const clienteEmail = (venta as any).users?.email;
          const clienteNombre = (venta as any).users?.nombre_completo ?? "Cliente";

          if (clienteEmail && items) {
            await enviarEmailCompraConfirmada({
              clienteEmail,
              clienteNombre,
              ventaId: venta.id,
              items: items.map((i) => ({
                nombre: (i as any).productos?.nombre ?? "Producto",
                cantidad: i.cantidad,
                precio_unitario: i.precio_unitario,
                subtotal: i.subtotal,
              })),
              totalMonto: venta.total_monto,
            });
          }
        } else if (estadoPago === "rechazado") {
          await supabase
            .from("ventas")
            .update({
              estado_pago: "rechazado",
              estado: "cancelada",
              updated_at: new Date().toISOString(),
            })
            .eq("id", venta.id);

          rechazadas++;
        }
      } catch (err) {
        console.error(
          `Error sincronizando venta ${venta.id}:`,
          err
        );
        // Continuar con la siguiente venta sin romper el flujo
      }
    }

    return NextResponse.json({
      ok: true,
      procesadas,
      confirmadas,
      rechazadas,
      message: `Sincronización completada: ${confirmadas} confirmadas, ${rechazadas} rechazadas`,
    });
  } catch (err) {
    console.error("Cron error en sincronizar-pagos:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
