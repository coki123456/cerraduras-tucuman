import MercadoPagoConfig, { Preference, Payment, MerchantOrder } from "mercadopago";
import crypto from "crypto";

function getClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  });
}

interface ItemPreference {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export async function crearPreferenciaMP(
  items: ItemPreference[],
  ventaId: string,
  clienteEmail: string
) {
  const preference = new Preference(getClient());

  const { id, init_point } = await preference.create({
    body: {
      items: items.map((i) => ({
        id: i.producto_id,
        title: i.nombre,
        quantity: i.cantidad,
        unit_price: i.precio_unitario,
        currency_id: "ARS",
      })),
      external_reference: ventaId,
      payer: { email: clienteEmail },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pago/exito`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pago/fallo`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pago/pendiente`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/mercadopago`,
    },
  });

  return { preferenceId: id!, initPoint: init_point! };
}

export async function obtenerPago(paymentId: string) {
  const payment = new Payment(getClient());
  return payment.get({ id: paymentId });
}

export async function obtenerOrdenMercante(orderId: string) {
  const order = new MerchantOrder(getClient());
  return order.get({ merchantOrderId: orderId });
}

/**
 * Verifica la firma de un Webhook de Mercado Pago (v2)
 */
export function verificarFirmaWebhook(
  signatureHeader: string,
  dataId: string,
  secret: string
): boolean {
  try {
    const parts = signatureHeader.split(",");
    let ts = "";
    let v1 = "";

    parts.forEach((part) => {
      const [key, value] = part.split("=");
      if (key.trim() === "ts") ts = value.trim();
      if (key.trim() === "v1") v1 = value.trim();
    });

    if (!ts || !v1) return false;

    // El esquema de firma v2 de MP usa: id:[data.id];ts:[timestamp];
    // Pero la documentación oficial dice que se usa el manifest:
    // "template" : "id:${data.id};ts:${timestamp};"
    const manifest = `id:${dataId};ts:${ts};`;
    
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(manifest);
    const sha = hmac.digest("hex");

    return sha === v1;
  } catch (error) {
    console.error("Error verificando firma:", error);
    return false;
  }
}
