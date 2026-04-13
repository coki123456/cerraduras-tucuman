import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";

function getBrevoClient() {
  const apiInstance = new TransactionalEmailsApi();
  // @ts-expect-error: brevo SDK uses non-standard auth config
  apiInstance.authentications["api-key"].apiKey = process.env.BREVO_API_KEY!;
  return apiInstance;
}

interface DatosCompraConfirmada {
  clienteEmail: string;
  clienteNombre: string;
  ventaId: string;
  items: Array<{
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }>;
  totalMonto: number;
}

export async function enviarEmailCompraConfirmada(datos: DatosCompraConfirmada) {
  const brevo = getBrevoClient();

  const formatARS = (n: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(n);

  const itemsHtml = datos.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #333;">${i.nombre}</td>
        <td style="padding:8px;border-bottom:1px solid #333;text-align:center;">${i.cantidad}</td>
        <td style="padding:8px;border-bottom:1px solid #333;text-align:right;">${formatARS(i.subtotal)}</td>
      </tr>`
    )
    .join("");

  const email = new SendSmtpEmail();
  email.to = [{ email: datos.clienteEmail, name: datos.clienteNombre }];
  email.sender = {
    email: process.env.ADMIN_EMAIL ?? "noreply@cerradurastucuman.com",
    name: "Cerraduras Tucumán",
  };
  email.subject = `✅ Compra confirmada #${datos.ventaId.slice(0, 8).toUpperCase()}`;
  email.htmlContent = `
    <div style="background:#0a0a0a;color:#f5f5f5;font-family:sans-serif;padding:32px;max-width:560px;margin:0 auto;border-radius:12px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#f5c518;font-size:24px;margin:0;">Cerraduras Tucumán</h1>
      </div>
      <h2 style="color:#f5f5f5;font-size:18px;">¡Tu compra fue confirmada!</h2>
      <p>Hola ${datos.clienteNombre}, tu pago fue procesado correctamente.</p>
      <p style="color:#888;font-size:12px;font-family:monospace;">Pedido #${datos.ventaId.slice(0, 8).toUpperCase()}</p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#1a1a1a;">
            <th style="padding:8px;text-align:left;color:#888;font-weight:normal;font-size:12px;">Producto</th>
            <th style="padding:8px;text-align:center;color:#888;font-weight:normal;font-size:12px;">Cant.</th>
            <th style="padding:8px;text-align:right;color:#888;font-weight:normal;font-size:12px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 8px;font-weight:bold;color:#f5c518;">Total</td>
            <td style="padding:12px 8px;text-align:right;font-weight:bold;color:#f5c518;font-size:18px;">
              ${formatARS(datos.totalMonto)}
            </td>
          </tr>
        </tfoot>
      </table>

      <p style="color:#888;font-size:12px;">
        Ante cualquier consulta escribinos a ${process.env.ADMIN_EMAIL ?? "admin@cerradurastucuman.com"}
      </p>
    </div>
  `;

  try {
    await brevo.sendTransacEmail(email);
  } catch (err) {
    console.error("Error enviando email de compra:", err);
  }
}

export async function enviarEmailAlertaStock(datos: {
  productoNombre: string;
  stockActual: number;
  stockMinimo: number;
}) {
  const brevo = getBrevoClient();

  const email = new SendSmtpEmail();
  email.to = [
    {
      email: process.env.ADMIN_EMAIL ?? "admin@cerradurastucuman.com",
      name: "Admin",
    },
  ];
  email.sender = {
    email: process.env.ADMIN_EMAIL ?? "noreply@cerradurastucuman.com",
    name: "Cerraduras Tucumán — Sistema",
  };
  email.subject = `⚠️ Stock bajo: ${datos.productoNombre}`;
  email.htmlContent = `
    <div style="background:#0a0a0a;color:#f5f5f5;font-family:sans-serif;padding:32px;max-width:480px;margin:0 auto;border-radius:12px;">
      <h1 style="color:#f5c518;">⚠️ Alerta de stock bajo</h1>
      <p>El producto <strong>${datos.productoNombre}</strong> está por debajo del stock mínimo.</p>
      <ul style="color:#aaa;">
        <li>Stock actual: <strong style="color:#ef4444;">${datos.stockActual}</strong></li>
        <li>Stock mínimo configurado: ${datos.stockMinimo}</li>
      </ul>
      <p>Accedé al panel para reponer el stock.</p>
    </div>
  `;

  try {
    await brevo.sendTransacEmail(email);
  } catch (err) {
    console.error("Error enviando email de alerta:", err);
  }
}
