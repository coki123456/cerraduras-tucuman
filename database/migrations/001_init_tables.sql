-- ============================================================
-- 001_init_tables.sql
-- Cerraduras Tucumán — Tablas principales
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('cliente', 'empleado', 'admin');
CREATE TYPE categoria_producto AS ENUM ('cerraduras', 'herrajes', 'accesorios');
CREATE TYPE tipo_servicio AS ENUM ('instalacion', 'reparacion', 'consulta');
CREATE TYPE estado_visita AS ENUM ('pendiente', 'en_proceso', 'completada', 'cancelada');
CREATE TYPE estado_venta AS ENUM ('pendiente', 'confirmada', 'cancelada');
CREATE TYPE metodo_pago AS ENUM ('mercadopago', 'efectivo');

-- ============================================================
-- TABLA: users (extiende auth.users de Supabase)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT NOT NULL UNIQUE,
  role              user_role NOT NULL DEFAULT 'cliente',
  nombre_completo   TEXT NOT NULL,
  telefono          TEXT,
  empresa           TEXT,
  activo            BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLA: productos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.productos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre          TEXT NOT NULL UNIQUE,
  descripcion     TEXT,
  precio          DECIMAL(12,2) NOT NULL CHECK (precio > 0),
  stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_minimo    INTEGER NOT NULL DEFAULT 5,
  categoria       categoria_producto NOT NULL,
  sku             TEXT NOT NULL UNIQUE,
  activo          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      UUID NOT NULL REFERENCES public.users(id)
);

-- ============================================================
-- TABLA: visitas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.visitas (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha               DATE NOT NULL,
  hora_inicio         TIME NOT NULL,
  duracion_estimada   INTEGER,  -- minutos
  cliente_nombre      TEXT NOT NULL,
  cliente_telefono    TEXT NOT NULL,
  tipo_servicio       tipo_servicio NOT NULL,
  estado              estado_visita NOT NULL DEFAULT 'pendiente',
  notas               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by          UUID NOT NULL REFERENCES public.users(id)
);

-- ============================================================
-- TABLA: ventas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ventas (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id                  UUID REFERENCES public.users(id),
  fecha_compra                TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_monto                 DECIMAL(12,2) NOT NULL CHECK (total_monto >= 0),
  estado                      estado_venta NOT NULL DEFAULT 'pendiente',
  metodo_pago                 metodo_pago NOT NULL DEFAULT 'mercadopago',
  mercadopago_payment_id      TEXT UNIQUE,
  mercadopago_preference_id   TEXT,
  notas                       TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLA: venta_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.venta_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venta_id         UUID NOT NULL REFERENCES public.ventas(id) ON DELETE CASCADE,
  producto_id      UUID NOT NULL REFERENCES public.productos(id),
  cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario  DECIMAL(12,2) NOT NULL CHECK (precio_unitario > 0),
  subtotal         DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLA: stock_alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stock_alerts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id   UUID NOT NULL REFERENCES public.productos(id),
  stock_actual  INTEGER NOT NULL,
  stock_minimo  INTEGER NOT NULL,
  triggered_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_to   UUID NOT NULL REFERENCES public.users(id),
  leido         BOOLEAN NOT NULL DEFAULT false,
  resuelto      BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================
-- TABLA: admin_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT NOT NULL UNIQUE,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID NOT NULL REFERENCES public.users(id)
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON public.productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON public.productos(stock);

CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON public.visitas(fecha);
CREATE INDEX IF NOT EXISTS idx_visitas_estado ON public.visitas(estado);
CREATE INDEX IF NOT EXISTS idx_visitas_created_by ON public.visitas(created_by);

CREATE INDEX IF NOT EXISTS idx_ventas_cliente_id ON public.ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON public.ventas(estado);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_compra ON public.ventas(fecha_compra);

CREATE INDEX IF NOT EXISTS idx_venta_items_venta_id ON public.venta_items(venta_id);
CREATE INDEX IF NOT EXISTS idx_venta_items_producto_id ON public.venta_items(producto_id);

CREATE INDEX IF NOT EXISTS idx_stock_alerts_producto_id ON public.stock_alerts(producto_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_resuelto ON public.stock_alerts(resuelto);

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_productos_updated_at
  BEFORE UPDATE ON public.productos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_visitas_updated_at
  BEFORE UPDATE ON public.visitas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_ventas_updated_at
  BEFORE UPDATE ON public.ventas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TRIGGER: crear perfil de usuario al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nombre_completo, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', split_part(NEW.email, '@', 1)),
    -- Agregamos "public." antes de "user_role"
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'cliente')
  );
  RETURN NEW;
END;
-- Agregamos SET search_path = public por seguridad y contexto
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
