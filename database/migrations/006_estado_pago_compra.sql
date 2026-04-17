-- ============================================================
-- 006_estado_pago_compra.sql
-- Cerraduras Tucumán — Separar estado de pago y estado de compra
-- Ejecutar DESPUÉS de 005_add_image_url_to_productos.sql
-- ============================================================

-- Crear nuevos tipos ENUM
CREATE TYPE estado_pago AS ENUM ('pendiente', 'pagado', 'rechazado');
CREATE TYPE estado_compra AS ENUM ('en_proceso', 'en_preparacion', 'lista_para_retirar', 'despachado', 'finalizado');

-- Agregar nuevas columnas a ventas
ALTER TABLE public.ventas
ADD COLUMN estado_pago estado_pago NOT NULL DEFAULT 'pendiente',
ADD COLUMN estado_compra estado_compra NOT NULL DEFAULT 'en_proceso';

-- Migrar datos históricos: ventas confirmadas → pagadas
UPDATE public.ventas
SET estado_pago = 'pagado'
WHERE estado = 'confirmada';

-- Migrar datos históricos: canceladas → rechazadas
UPDATE public.ventas
SET estado_pago = 'rechazado'
WHERE estado = 'cancelada';

-- Actualizar la función confirmar_venta para usar los nuevos campos
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
  -- 1. Actualizar estado de la venta (mantener ambos campos por compatibilidad)
  UPDATE public.ventas
  SET estado = 'confirmada',
      estado_pago = 'pagado',
      mercadopago_payment_id = p_payment_id,
      updated_at = now()
  WHERE id = p_venta_id
    AND estado_pago = 'pendiente';

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
