# 🔒 Guía de Despliegue Seguro - Cerraduras Tucumán

## Cambios de Seguridad Realizados

### Dockerfile (Mejorado)
✅ **No expone secretos en ARG**
- Los secretos se inyectan como variables de entorno en **runtime**, no en build
- Solo `NEXT_PUBLIC_*` se usan en ARG (variables públicas del cliente)
- Agregado HEALTHCHECK para monitoreo

### docker-compose.yml (Correcto)
✅ Variables secretas en `environment`, no en `args`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `BREVO_API_KEY`
- `CRON_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

### .dockerignore (Correcto)
✅ Excluye todos los `.env*` excepto `.env.example`

---

## 🚀 Cómo Desplegar Correctamente

### 1. **Preparar variables de entorno**

Crea un archivo `.env.production` (NO lo commits a Git):

```bash
# Variables públicas (se incrustan en el cliente)
NEXT_PUBLIC_SUPABASE_URL=https://api-cerradura.coki-n8n.ar
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://cerraduras-tucuman.com

# Variables secretas (solo servidor en runtime)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=...
BREVO_API_KEY=xkeysib-...
CRON_SECRET=...
```

### 2. **Con Docker local**

```bash
docker-compose up --build
```

Las variables se inyectarán desde `.env` automáticamente.

### 3. **Con Coolify (en producción)**

1. **NO uses `.env` en el repositorio**
2. En Coolify, ve a **Variables** y agrega cada variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (marcada como privada)
   - `MERCADOPAGO_ACCESS_TOKEN` (marcada como privada)
   - `MERCADOPAGO_WEBHOOK_SECRET` (marcada como privada)
   - `BREVO_API_KEY` (marcada como privada)
   - `CRON_SECRET` (marcada como privada)

3. Coolify construirá la imagen sin los secretos (están solo en runtime)

---

## ⚠️ NUNCA hagas esto:

```dockerfile
# ❌ INCORRECTO - Los secretos quedan en la imagen
ARG MERCADOPAGO_ACCESS_TOKEN
RUN echo $MERCADOPAGO_ACCESS_TOKEN > /app/config.txt
```

```bash
# ❌ INCORRECTO - Los secretos en el repositorio
git add .env
git commit -m "add env vars"
```

```yaml
# ❌ INCORRECTO - Los secretos en el build
build:
  args:
    MERCADOPAGO_ACCESS_TOKEN: ${MERCADOPAGO_ACCESS_TOKEN}
```

---

## ✅ Verificación

Después de desplegar, verifica que:

1. **Los secretos NO están en el histórico de Git**
   ```bash
   git log --all -S "MERCADOPAGO_ACCESS_TOKEN"
   ```

2. **Los secretos NO están en la imagen Docker**
   ```bash
   docker inspect cerraduras-tucuman:latest | grep MERCADOPAGO
   # No debe mostrar nada
   ```

3. **La aplicación funciona correctamente**
   ```bash
   docker exec cerraduras-tucuman node -e "console.log(process.env.MERCADOPAGO_ACCESS_TOKEN ? '✓ Secret loaded' : '✗ Missing')"
   ```

---

## 📋 Checklist Pre-Despliegue

- [ ] `.env` está en `.gitignore`
- [ ] `.env` NO está en el repositorio
- [ ] Dockerfile NO usa ARG para secretos
- [ ] docker-compose.yml usa `environment:` para secretos
- [ ] Coolify tiene todas las variables configuradas
- [ ] Se ejecutó: `npx supabase db push` (migraciones)
- [ ] El admin configuró MercadoPago en `/dashboard/admin/configuracion`
- [ ] Webhook de MercadoPago apunta a `/api/webhook/mercadopago`

---

## 🔗 Referencias

- [Docker Security Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Secrets in Docker](https://docs.docker.com/compose/use-secrets/)
- [OWASP: Secrets Management](https://owasp.org/www-project-top-10-proactive-controls/)
