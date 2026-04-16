-- ============================================================
-- 004_add_direccion_to_users.sql
-- Cerraduras Tucumán — Extender perfil de usuario
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- Añadir columnas de dirección y ciudad a la tabla de usuarios
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS direccion TEXT,
ADD COLUMN IF NOT EXISTS ciudad TEXT;

-- Comentario para documentar las columnas
COMMENT ON COLUMN public.users.direccion IS 'Dirección física del usuario para visitas técnicas';
COMMENT ON COLUMN public.users.ciudad IS 'Ciudad de residencia/operación del usuario';
