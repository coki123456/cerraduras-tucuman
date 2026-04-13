-- ============================================================
-- seed.sql — Datos de prueba para Cerraduras Tucumán
-- IMPORTANTE: Ejecutar DESPUÉS de crear los usuarios en Supabase Auth
-- y reemplazar los UUIDs con los IDs reales de tus usuarios de prueba.
--
-- Paso 1: Crear en Supabase Auth Dashboard (o via signup):
--   admin@cerradurastucuman.com   → role: admin
--   juan.gomez@empresa.com        → role: empleado
--   maria.lopez@empresa.com       → role: empleado
--   pedro.garcia@gmail.com        → role: cliente
--   lucia.fernandez@gmail.com     → role: cliente
--   carlos.ruiz@gmail.com         → role: cliente
--
-- Paso 2: Actualizar los roles:
-- ============================================================

-- Actualizar roles (reemplazar emails si difieren)
UPDATE public.users SET role = 'admin'    WHERE email = 'esteban_coki@hotmail.com';
UPDATE public.users SET role = 'empleado' WHERE email = 'juan.gomez@empresa.com';
-- Los clientes ya tienen rol 'cliente' por defecto

-- ============================================================
-- PRODUCTOS DE PRUEBA
-- ============================================================
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM public.users WHERE role = 'admin' LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró un usuario admin. Creá primero el admin en Supabase Auth.';
  END IF;

  INSERT INTO public.productos (nombre, descripcion, precio, stock, stock_minimo, categoria, sku, created_by)
  VALUES
    ('Cerradura Seguridad Yale 3 Puntos',
     'Cerradura de alta seguridad con 3 puntos de anclaje. Ideal para puertas principales.',
     85000, 15, 3, 'cerraduras', 'YALE-3PT-001', v_admin_id),

    ('Cerradura Doble Paleta Trabex',
     'Cerradura doble paleta de acero, resistente a forzados. Para puertas de madera y metal.',
     42000, 25, 5, 'cerraduras', 'TRABX-DP-001', v_admin_id),

    ('Cerradura Electromagnética 600kg',
     'Cerradura electromagnética para control de acceso. 600 kg de fuerza de retención.',
     125000, 8, 2, 'cerraduras', 'EMAG-600-001', v_admin_id),

    ('Cerradura Digital Smart Lock',
     'Cerradura inteligente con código, RFID y Bluetooth. Compatible con app móvil.',
     198000, 5, 2, 'cerraduras', 'SMART-DIG-001', v_admin_id),

    ('Cerradura Retrete Baño Aluminio',
     'Cerradura para baños con indicador libre/ocupado. Aluminio anodizado.',
     8500, 40, 10, 'cerraduras', 'BANO-ALU-001', v_admin_id),

    ('Manija Lever Cromada par',
     'Par de manijas tipo lever en cromo pulido. Compatible con cerraduras estándar.',
     15000, 30, 8, 'herrajes', 'MANIJ-LCR-001', v_admin_id),

    ('Bisagra Pesada 4" Acero Inox',
     'Bisagra reforzada para puertas pesadas hasta 80 kg. Acero inoxidable.',
     6500, 60, 15, 'herrajes', 'BISG-4IN-001', v_admin_id),

    ('Pasador Sobrepuesto 25cm Acero',
     'Pasador de sobreponer galvanizado de 25 cm. Refuerzo adicional para portones.',
     4200, 45, 10, 'herrajes', 'PASD-25AC-001', v_admin_id),

    ('Tope de Puerta Goma Negro',
     'Tope de puerta de goma con tornillo. Evita golpes y daños en paredes.',
     1800, 100, 20, 'accesorios', 'TOPE-GOM-001', v_admin_id),

    ('Cilindro Repuesto Yale 45mm',
     'Cilindro de repuesto para cerraduras Yale. 45 mm, con 5 llaves incluidas.',
     22000, 20, 5, 'accesorios', 'CILN-Y45-001', v_admin_id);

  -- Admin settings
  INSERT INTO public.admin_settings (key, value, updated_by)
  VALUES
    ('stock_minimo_default', '5', v_admin_id),
    ('email_admin', 'esteban_coki@hotmail.com', v_admin_id),
    ('nombre_negocio', 'Cerraduras Tucumán', v_admin_id),
    ('whatsapp_negocio', '+5493814000000', v_admin_id)
  ON CONFLICT (key) DO NOTHING;

END $$;
