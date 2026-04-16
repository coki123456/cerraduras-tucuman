-- ============================================================
-- 005_add_image_url_to_productos.sql
-- Cerraduras Tucumán — Fotos de productos
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- 1. Añadir columna a la tabla de productos
ALTER TABLE public.productos 
ADD COLUMN IF NOT EXISTS imagen_url TEXT;

-- 2. Crear el bucket en Storage (si no existe)
-- Nota: En algunas versiones de Supabase, esto requiere permisos de superusuario.
-- Si falla, crea el bucket "productos" manualmente en el dashboard.
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos', 'productos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de Acceso para el bucket "productos"

-- Permitir acceso público de lectura
CREATE POLICY "Acceso público de lectura para productos"
ON storage.objects FOR SELECT
USING (bucket_id = 'productos');

-- Permitir a los administradores subir fotos
-- Nota: La lógica asume que el usuario tiene el campo "role" en public.users
CREATE POLICY "Admins pueden subir fotos de productos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'productos' AND
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- Permitir a los administradores actualizar/borrar fotos
CREATE POLICY "Admins pueden actualizar/borrar fotos de productos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'productos' AND
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins pueden borrar fotos de productos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'productos' AND
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
