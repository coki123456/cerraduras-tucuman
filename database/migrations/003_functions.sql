-- ============================================================
-- 003_functions.sql
-- Cerraduras Tucumán — Funciones RPC y Triggers de negocio
-- Ejecutar DESPUÉS de 002_rls_policies.sql
-- ============================================================

-- ============================================================
-- RPC: decrement_stock (atómico, con SECURITY DEFINER para
-- poder ejecutarse desde webhook sin importar el rol)
-- ============================================================
CREATE OR REPLACE FUNCTION public.decrement_stock(
  p_producto_id UUID,
  p_cantidad    INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_stock_nuevo INTEGER;
BEGIN
  UPDATE public.productos
  SET stock = stock - p_cantidad,
      updated_at = now()
  WHERE id = p_producto_id
    AND stock >= p_cantidad
  RETURNING stock INTO v_stock_nuevo;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stock insuficiente para el producto %', p_producto_id;
  END IF;

  RETURN v_stock_nuevo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: confirmar_venta
-- Actualiza la venta, descuenta stock de cada item y crea alertas
-- Se llama desde el webhook de MercadoPago vía service_role
-- ============================================================
CREATE OR REPLACE FUNCTION public.confirmar_venta(
  p_venta_id            UUID,
  p_payment_id          TEXT,
  p_admin_id            UUID
)
RETURNS VOID AS $$
DECLARE
  v_item RECORD;
  v_stock_nuevo INTEGER;
BEGIN
  -- 1. Actualizar estado de la venta
  UPDATE public.ventas
  SET estado = 'confirmada',
      mercadopago_payment_id = p_payment_id,
      updated_at = now()
  WHERE id = p_venta_id
    AND estado = 'pendiente';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venta % no encontrada o ya procesada', p_venta_id;
  END IF;

  -- 2. Para cada item, descontar stock
  FOR v_item IN
    SELECT producto_id, cantidad
    FROM public.venta_items
    WHERE venta_id = p_venta_id
  LOOP
    v_stock_nuevo := public.decrement_stock(v_item.producto_id, v_item.cantidad);

    -- 3. Si stock bajó del mínimo, crear alerta (si no existe una sin resolver)
    DECLARE
      v_stock_min INTEGER;
    BEGIN
      SELECT stock_minimo INTO v_stock_min
      FROM public.productos
      WHERE id = v_item.producto_id;

      IF v_stock_nuevo < v_stock_min THEN
        IF NOT EXISTS (
          SELECT 1 FROM public.stock_alerts
          WHERE producto_id = v_item.producto_id
            AND resuelto = false
        ) THEN
          INSERT INTO public.stock_alerts (
            producto_id, stock_actual, stock_minimo, notified_to
          ) VALUES (
            v_item.producto_id, v_stock_nuevo, v_stock_min, p_admin_id
          );
        END IF;
      END IF;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: get_reporte_ventas
-- Totales de ventas en un período
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_reporte_ventas(
  p_desde DATE,
  p_hasta DATE
)
RETURNS TABLE (
  fecha           DATE,
  cantidad_ventas BIGINT,
  total_monto     NUMERIC,
  ticket_promedio NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(v.fecha_compra) AS fecha,
    COUNT(*)             AS cantidad_ventas,
    SUM(v.total_monto)   AS total_monto,
    AVG(v.total_monto)   AS ticket_promedio
  FROM public.ventas v
  WHERE v.estado = 'confirmada'
    AND DATE(v.fecha_compra) BETWEEN p_desde AND p_hasta
  GROUP BY DATE(v.fecha_compra)
  ORDER BY fecha;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- RPC: get_top_productos
-- Top productos más vendidos en un período
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_top_productos(
  p_desde DATE,
  p_hasta DATE,
  p_limite INTEGER DEFAULT 5
)
RETURNS TABLE (
  producto_id   UUID,
  nombre        TEXT,
  categoria     categoria_producto,
  cantidad_total BIGINT,
  monto_total   NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id         AS producto_id,
    p.nombre,
    p.categoria,
    SUM(vi.cantidad)::BIGINT  AS cantidad_total,
    SUM(vi.subtotal)          AS monto_total
  FROM public.venta_items vi
  JOIN public.ventas v ON v.id = vi.venta_id
  JOIN public.productos p ON p.id = vi.producto_id
  WHERE v.estado = 'confirmada'
    AND DATE(v.fecha_compra) BETWEEN p_desde AND p_hasta
  GROUP BY p.id, p.nombre, p.categoria
  ORDER BY cantidad_total DESC
  LIMIT p_limite;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- RPC: get_reporte_clientes
-- Estadísticas de clientes en un período
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_reporte_clientes(
  p_desde DATE,
  p_hasta DATE
)
RETURNS TABLE (
  cliente_id      UUID,
  nombre_completo TEXT,
  email           TEXT,
  total_compras   BIGINT,
  total_gastado   NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id              AS cliente_id,
    u.nombre_completo,
    u.email,
    COUNT(v.id)::BIGINT        AS total_compras,
    COALESCE(SUM(v.total_monto), 0) AS total_gastado
  FROM public.users u
  LEFT JOIN public.ventas v ON v.cliente_id = u.id
    AND v.estado = 'confirmada'
    AND DATE(v.fecha_compra) BETWEEN p_desde AND p_hasta
  WHERE u.role = 'cliente'
  GROUP BY u.id, u.nombre_completo, u.email
  ORDER BY total_gastado DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- SETTINGS iniciales
-- ============================================================
-- Se insertan en seed.sql cuando exista el admin
