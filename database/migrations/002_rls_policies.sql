-- ============================================================
-- 002_rls_policies.sql
-- Cerraduras Tucumán — Row Level Security
-- Ejecutar DESPUÉS de 001_init_tables.sql
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Helper: obtener el rol del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: verificar si es admin
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'admin';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: verificar si es empleado o admin
CREATE OR REPLACE FUNCTION public.es_empleado_o_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('empleado', 'admin');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- POLICIES: users
-- ============================================================

-- Cada usuario ve su propio perfil
CREATE POLICY "usuarios_ver_propio" ON public.users
  FOR SELECT USING (id = auth.uid());

-- Admin ve todos
CREATE POLICY "admin_ver_todos_usuarios" ON public.users
  FOR SELECT USING (public.es_admin());

-- Cada usuario puede actualizar su propio perfil
CREATE POLICY "usuarios_actualizar_propio" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Admin puede gestionar todos los usuarios
CREATE POLICY "admin_gestionar_usuarios" ON public.users
  FOR ALL USING (public.es_admin());

-- ============================================================
-- POLICIES: productos
-- ============================================================

-- Todos los autenticados pueden ver productos activos
CREATE POLICY "ver_productos_activos" ON public.productos
  FOR SELECT USING (activo = true OR public.es_admin());

-- Solo admin puede crear/editar/eliminar
CREATE POLICY "admin_gestionar_productos" ON public.productos
  FOR ALL USING (public.es_admin());

-- ============================================================
-- POLICIES: visitas
-- ============================================================

-- Empleado ve solo sus propias visitas
CREATE POLICY "empleado_ver_propias_visitas" ON public.visitas
  FOR SELECT USING (
    created_by = auth.uid() OR public.es_admin()
  );

-- Empleado puede crear visitas (created_by = auth.uid())
CREATE POLICY "empleado_crear_visitas" ON public.visitas
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND public.es_empleado_o_admin()
  );

-- Empleado puede actualizar sus propias visitas; admin todas
CREATE POLICY "empleado_actualizar_propias_visitas" ON public.visitas
  FOR UPDATE USING (
    created_by = auth.uid() OR public.es_admin()
  );

-- Solo admin puede eliminar visitas
CREATE POLICY "admin_eliminar_visitas" ON public.visitas
  FOR DELETE USING (public.es_admin());

-- ============================================================
-- POLICIES: ventas
-- ============================================================

-- Cliente ve solo sus propias ventas
CREATE POLICY "cliente_ver_propias_ventas" ON public.ventas
  FOR SELECT USING (
    cliente_id = auth.uid() OR public.es_admin()
  );

-- Cualquier autenticado puede crear una venta (en el checkout)
CREATE POLICY "crear_venta" ON public.ventas
  FOR INSERT WITH CHECK (
    cliente_id = auth.uid()
  );

-- Solo admin o service_role pueden actualizar ventas (confirmación webhook)
CREATE POLICY "admin_actualizar_ventas" ON public.ventas
  FOR UPDATE USING (public.es_admin());

-- ============================================================
-- POLICIES: venta_items
-- ============================================================

-- Ver items de las propias ventas
CREATE POLICY "ver_propios_items" ON public.venta_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ventas v
      WHERE v.id = venta_id AND (v.cliente_id = auth.uid() OR public.es_admin())
    )
  );

-- Insertar items al crear la venta
CREATE POLICY "insertar_items_venta" ON public.venta_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ventas v
      WHERE v.id = venta_id AND v.cliente_id = auth.uid()
    )
  );

-- ============================================================
-- POLICIES: stock_alerts
-- ============================================================

-- Solo admin ve y gestiona alertas de stock
CREATE POLICY "admin_gestionar_alertas" ON public.stock_alerts
  FOR ALL USING (public.es_admin());

-- ============================================================
-- POLICIES: admin_settings
-- ============================================================

-- Solo admin gestiona configuración
CREATE POLICY "admin_gestionar_settings" ON public.admin_settings
  FOR ALL USING (public.es_admin());
