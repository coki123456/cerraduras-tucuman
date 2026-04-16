# Configuración de Webhook — Mercado Pago

Para que el sistema procese los pagos automáticamente, debés configurar la URL de notificaciones en tu panel de Mercado Pago.

## Pasos para la configuración:

1. Ingresá a tu [Panel de Desarrollador de Mercado Pago](https://www.mercadopago.com.ar/developers/panel/notifications/webhooks).
2. Seleccioná tu aplicación actual.
3. En el menú lateral, buscá **"Notificaciones"** -> **"Webhooks"**.
4. En **"Modo Producción"** (o Prueba según corresponda), configurá la siguiente URL:
   `https://tu-dominio.com/api/webhook/mercadopago`
5. En **"Eventos"**, seleccioná al menos:
   - `Pagos` (payment)
   - `Órdenes comerciales` (merchant_order)
6. Guardá los cambios.

## Seguridad (Webhook Secret)

El sistema ya está configurado para verificar la autenticidad de las notificaciones usando tu **Webhook Secret**. 

- El secreto configurado es: `043898d4...3f3`
- Asegurate de que la variable `MERCADOPAGO_WEBHOOK_SECRET` en tu archivo `.env` coincida con el valor que te proporciona Mercado Pago.

## ¿Qué sucede cuando llega una notificación?

1. El sistema verifica la **firma digital** para asegurar que la notificación viene de Mercado Pago.
2. Identifica si es un pago aprobado o una orden pagada.
3. Busca la venta correspondiente en la base de datos mediante la `external_reference`.
4. Si la venta está pendiente:
   - Cambia el estado a **"Confirmada"**.
   - Descuenta el stock de los productos comprados.
   - Crea alertas de stock si algún producto baja del mínimo.
   - Envía un email de confirmación automática al cliente.
