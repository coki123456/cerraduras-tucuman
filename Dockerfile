# Dockerfile para Cerraduras Tucumán con Coolify
# Multi-stage build: instalación → construcción → runtime
# ⚠️ IMPORTANTE: Los secretos (MERCADOPAGO_ACCESS_TOKEN, BREVO_API_KEY, CRON_SECRET)
# NO deben pasar como ARG. Se inyectan como variables de entorno en runtime via docker-compose.

# Stage 1: Instalar dependencias
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

# Stage 2: Construir la aplicación
# Los secretos NO se usan aquí. Solo variables NEXT_PUBLIC_* que son públicas.
FROM node:24-alpine AS builder
WORKDIR /app

# ARG solo para variables públicas que se incrustan en el cliente
# NUNCA uses ARG para secretos (MERCADOPAGO, BREVO, CRON_SECRET)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build: los secretos del servidor NO se necesitan en build
RUN npm run build

# Stage 3: Runtime (solo dependencias de producción)
FROM node:24-alpine AS runner
WORKDIR /app

# Variables de entorno para runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    apk add --no-cache curl

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

CMD ["node", "server.js"]
