import MercadoPagoConfig, { Preference, Payment } from "mercadopago";

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
