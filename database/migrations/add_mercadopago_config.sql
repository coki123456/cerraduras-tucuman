-- Tabla para guardar configuración de MercadoPago del admin
CREATE TABLE IF NOT EXISTS mercadopago_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  public_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- RLS Policy: Solo el admin puede leer/escribir su configuración
ALTER TABLE mercadopago_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage their mercadopago config"
  ON mercadopago_config
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_mercadopago_config_user_id
  ON mercadopago_config(user_id);
