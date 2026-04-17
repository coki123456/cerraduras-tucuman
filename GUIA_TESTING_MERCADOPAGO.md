# Guía de Testing - MercadoPago Sandbox

**Fecha**: Abril 2026
**Versión**: 1.0
**Propósito**: Documentación completa para probar pagos con MercadoPago en ambiente sandbox

---

## 1. Configuración de Credenciales Sandbox

### 1.1 Obtener Credenciales de MercadoPago

1. Ir a https://www.mercadopago.com.ar/developers/panel
2. Iniciar sesión con tu cuenta de MercadoPago
3. En el menú de la izquierda, seleccionar **Credenciales**
4. Verás dos secciones:
   - **Producción** (para ventas reales)
   - **Sandbox** (para pruebas)

### 1.2 Variables de Entorno Necesarias

En tu archivo `.env.local`, necesitas:

```env
# MercadoPago - Sandbox (para testing)
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Webhook Secret (para verificar firmas autenticadas)
MERCADOPAGO_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# URLs de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Para producción**, cambiar a:
```env
# MercadoPago - Producción
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADOPAGO_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 2. Crear Cuentas de Prueba

### 2.1 Vendedor (Tu negocio)

1. En https://www.mercadopago.com.ar/developers/panel
2. En la sección **Sandbox**, copiar el **Access Token**
3. Este es tu account como vendedor para recibir pagos

### 2.2 Comprador (Cliente de prueba)

1. En https://www.mercadopago.com/mla/account/create
2. Crear una cuenta de correo ficticia:
   - Email: `test_buyer_xxxxx@testuser.com`
   - Nombre: Tu nombre
   - País: Argentina
   - Tipo de documento: Seleccionar DNI o pasaporte
   - Documento: 12345678 (cualquier número)

3. La contraseña será enviada al email

**O usar directamente los test users proporcionados por MercadoPago:**
- Ver en https://www.mercadopago.com.ar/developers/es/guides/additional-resources/test-cards

---

## 3. Tarjetas de Crédito para Testing

### 3.1 Tarjetas Visa Test

| Escenario | Tarjeta | CVV | Fecha |
|-----------|---------|-----|-------|
| **Aprobado** | 4509953566233576 | 123 | 11/25 |
| **Rechazado** | 4013888888888888 | 123 | 12/25 |
| **Pendiente** | 4170068410393976 | 123 | 01/26 |
| **Pago Parcial** | 5031433215406351 | 123 | 03/26 |

### 3.2 Tarjetas Mastercard Test

| Escenario | Tarjeta | CVV | Fecha |
|-----------|---------|-----|-------|
| **Aprobado** | 5031755734530604 | 123 | 11/25 |
| **Rechazado** | 5575958374173440 | 123 | 12/25 |

### 3.3 Datos del Pagador

```
Nombre: Aprobado
Apellido: Aprobado
Email: test_comprador@gmail.com
Tipo de documento: DNI
Documento: 12345678
```

---

## 4. Flujo de Testing Completo

### 4.1 Escenario 1: Pago Exitoso

**Pasos:**

1. Abre http://localhost:3000/dashboard/productos
2. Agrega un producto al carrito
3. Vas a `/dashboard/carrito` → Ir a checkout
4. En `/dashboard/checkout`, click "Pagar con Mercadopago"
5. Serás redirigido a la UI de MercadoPago sandbox
6. **Usar tarjeta**: `4509953566233576` (Visa - Aprobado)
7. Completar formulario con los datos de arriba
8. Click "Pagar"
9. **Redirección esperada**: `/dashboard/pago/exito`

**Verificaciones:**

```bash
# En Supabase, verificar la venta
select id, estado, mercadopago_preference_id, fecha_compra
from ventas
where estado = 'pagado'
order by fecha_compra desc
limit 1;
```

**El webhook debería:**
- Cambiar `estado` de `pendiente` → `pagado`
- Crear `stock_alerts` si corresponde
- Enviar email de confirmación al cliente

---

### 4.2 Escenario 2: Pago Rechazado

**Pasos:**

1. Repetir flujo de checkout
2. **Usar tarjeta**: `4013888888888888` (Visa - Rechazado)
3. Completar formulario
4. Click "Pagar"
5. **Redirección esperada**: `/dashboard/pago/fallo`

**Verificaciones:**

```bash
# La venta debe seguir en estado "pendiente"
select id, estado
from ventas
where mercadopago_preference_id = 'PREFERENCE_ID_HERE'
```

---

### 4.3 Escenario 3: Pago Pendiente

**Pasos:**

1. Repetir flujo de checkout
2. **Usar tarjeta**: `4170068410393976` (Visa - Pendiente)
3. Completar formulario
4. Click "Pagar"
5. **Redirección esperada**: `/dashboard/pago/pendiente`

**Verificaciones:**

- La venta debe estar en `estado = 'pendiente'`
- El webhook tardará más tiempo en confirmar (simula revisión de banco)

---

## 5. Testing del Webhook

### 5.1 Verificar que el Webhook se Registró

En https://www.mercadopago.com.ar/developers/panel:

1. Ir a **Configuración** → **Notificaciones**
2. En **Webhook**, agregar URL:
   ```
   http://localhost:3000/api/webhook/mercadopago
   ```

> **Nota**: Para testing local, usar ngrok:
> ```bash
> npm install -g ngrok
> ngrok http 3000
> # Copiar el URL https generado
> # Usarlo como: https://xxxxx.ngrok.io/api/webhook/mercadopago
> ```

### 5.2 Simular Webhook Manualmente

Si el webhook no llega (testing local sin ngrok), simular con curl:

```bash
curl -X POST http://localhost:3000/api/webhook/mercadopago \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=1234567890,v1=abc123" \
  -d '{
    "id": 1234567890,
    "type": "payment",
    "data": {
      "id": "123456789"
    }
  }'
```

### 5.3 Logs del Webhook

En `app/api/webhook/mercadopago/route.ts`, los logs aparecerán en:

```bash
# Vercel (si está deployado)
vercel logs

# O en la consola del dev server
npm run dev
```

---

## 6. Verificar Pagos en MercadoPago

### 6.1 Panel de Actividad

1. Ir a https://www.mercadopago.com.ar/admin/notifications
2. Ver la lista de notificaciones recibidas
3. Expandir cada una para ver el payload

### 6.2 Consultar Venta Específica

En Supabase, para una venta con ID `abc123def456`:

```sql
select
  v.id,
  v.cliente_id,
  v.estado,
  v.total_monto,
  v.mercadopago_preference_id,
  v.mercadopago_payment_id,
  v.fecha_compra,
  v.fecha_pago,
  u.nombre_completo,
  u.email
from ventas v
join users u on v.cliente_id = u.id
where v.id = 'abc123def456';
```

---

## 7. Testing de Roles (Admin)

### 7.1 Pantalla de Ventas Pendientes

Después de crear una venta en estado `pagado`:

1. Acceder como **admin** a `/dashboard/admin/ventas-pendientes`
2. Debe aparecer la venta en la tabla de "Pendientes"
3. Hacer click en el menú de acciones (⋯) para la venta
4. Opciones según método de entrega:
   - **Si es "Retirar al local"**: Click "Retirado en local" → Estado cambia a `entregado`
   - **Si es "Envío"**: Click "Marcado como enviado" → Estado cambia a `enviado`

### 7.2 Verificar en Supabase

```sql
-- Ver venta y estado
select id, estado, metodo_entrega, fecha_entrega
from ventas
where cliente_id = 'USER_ID'
order by fecha_compra desc;
```

---

## 8. Checklist de Testing Completo

### 8.1 Antes de Ir a Producción

- [ ] ✅ Crear cuenta de vendedor en MercadoPago
- [ ] ✅ Obtener Access Token de sandbox
- [ ] ✅ Configurar `.env.local` con credenciales sandbox
- [ ] ✅ Crear cuenta de comprador de prueba
- [ ] ✅ Configurar webhook en panel de MercadoPago
- [ ] ✅ Probar pago exitoso (tarjeta aprobada)
- [ ] ✅ Probar pago rechazado (tarjeta rechazada)
- [ ] ✅ Probar pago pendiente (tarjeta pendiente)
- [ ] ✅ Verificar que webhook actualice el estado
- [ ] ✅ Verificar emails de confirmación se envían
- [ ] ✅ Probar admin panel de ventas pendientes
- [ ] ✅ Marcar entrega en admin panel
- [ ] ✅ Verificar estado final en Supabase

### 8.2 Cambio a Producción

Cuando esté listo:

1. En MercadoPago panel, obtener **Access Token de Producción**
2. Cambiar variables en Vercel:
   ```bash
   vercel env add MERCADOPAGO_ACCESS_TOKEN
   # Pegar token de producción
   vercel env add MERCADOPAGO_WEBHOOK_SECRET
   # Pegar webhook secret de producción
   ```
3. Configurar webhook de producción:
   ```
   https://tu-dominio.com/api/webhook/mercadopago
   ```
4. Desplegar cambios:
   ```bash
   git push
   # Automáticamente despliega a Vercel
   ```

---

## 9. Troubleshooting

### 9.1 El webhook no llega

**Solución:**
- Asegurar que `NEXT_PUBLIC_APP_URL` es correcto
- Si está en localhost, usar ngrok
- Verificar que el webhook esté registrado en el panel
- Revisar los logs en Vercel

### 9.2 Error "Firma inválida"

**Solución:**
- Verificar que `MERCADOPAGO_WEBHOOK_SECRET` es correcto
- El secret debe coincidir exactamente con el del panel
- Revisar la implementación de `verificarFirmaWebhook()`

### 9.3 La venta no cambia de estado

**Solución:**
- Verificar que el webhook llegó (buscar en logs)
- Revisar que `external_reference` en la preferencia sea el `ventaId`
- Verificar que la venta existe en Supabase con ese ID

### 9.4 Email de confirmación no se envía

**Solución:**
- Verificar credenciales de Brevo en `.env`
- Revisar logs de la función de email
- Confirmar que el email del cliente es válido

---

## 10. URLs Importantes

| Recurso | URL |
|---------|-----|
| Panel de Desarrollador | https://www.mercadopago.com.ar/developers/panel |
| Documentación SDK | https://github.com/mercadopago/sdk-nodejs |
| Test Cards | https://www.mercadopago.com.ar/developers/es/guides/additional-resources/test-cards |
| API Reference | https://www.mercadopago.com.ar/developers/es/reference |
| Webhook Docs | https://www.mercadopago.com.ar/developers/es/guides/notifications/webhooks |

---

**Próximos pasos**: Una vez completado el testing, pasar a **Task #8** (Generar tutorial de cerraduras y buscar imágenes).
