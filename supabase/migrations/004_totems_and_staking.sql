-- =============================================
-- ZIESTA: Migración 004 — Tótems y Siesta Staking
-- =============================================

-- =====================
-- TABLAS DE TÓTEMS
-- =====================

CREATE TABLE IF NOT EXISTS totems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  last_ping TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS totem_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  totem_id UUID NOT NULL REFERENCES totems(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'image')),
  media_url TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 15,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS totem_surprises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  totem_id UUID NOT NULL REFERENCES totems(id) ON DELETE CASCADE,
  prize_type TEXT NOT NULL CHECK (prize_type IN ('points', 'product', 'discount')),
  prize_value INTEGER, -- Puntos o % descuento
  prize_description TEXT NOT NULL,
  frequency_per_day INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registra cuándo y quién reclamó un premio de tótem (para evitar doble reclamo y llevar control)
CREATE TABLE IF NOT EXISTS totem_surprise_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surprise_id UUID NOT NULL REFERENCES totem_surprises(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id),
  claim_token TEXT NOT NULL UNIQUE, -- Código QR dorado que se mostró
  claimed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- TABLA DE STAKING
-- =====================

CREATE TABLE IF NOT EXISTS staking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  points_earned INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- SEGURIDAD (RLS)
-- =====================

ALTER TABLE totems ENABLE ROW LEVEL SECURITY;
ALTER TABLE totem_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE totem_surprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE totem_surprise_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para Tótems
CREATE POLICY "Tótems are viewable by all" ON totems FOR SELECT USING (true);
CREATE POLICY "Merchants can manage own totems" ON totems FOR ALL
  USING (merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid()));

-- Políticas para Totem Media
CREATE POLICY "Totem media viewable by all" ON totem_media FOR SELECT USING (true);
CREATE POLICY "Merchants manage own totem media" ON totem_media FOR ALL
  USING (totem_id IN (SELECT id FROM totems WHERE merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid())));

-- Políticas para Sorpresas
CREATE POLICY "Totem surprises viewable by all" ON totem_surprises FOR SELECT USING (true);
CREATE POLICY "Merchants manage own surprises" ON totem_surprises FOR ALL
  USING (totem_id IN (SELECT id FROM totems WHERE merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid())));

-- Políticas para Reclamos de sorpresas
CREATE POLICY "Users view own claims" ON totem_surprise_claims FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Merchants view claims on their totems" ON totem_surprise_claims FOR SELECT
  USING (surprise_id IN (SELECT id FROM totem_surprises WHERE totem_id IN (SELECT id FROM totems WHERE merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid()))));
CREATE POLICY "Users can insert own claims" ON totem_surprise_claims FOR INSERT WITH CHECK (client_id = auth.uid());

-- Políticas para Staking
CREATE POLICY "Users view own staking sessions" ON staking_sessions FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Users manage own staking sessions" ON staking_sessions FOR ALL USING (client_id = auth.uid());

-- Función para reclamar premio y asegurar que nadie más lo reclame
CREATE OR REPLACE FUNCTION claim_totem_surprise(
  p_client_id UUID,
  p_surprise_id UUID,
  p_claim_token TEXT
) RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  points_awarded INTEGER
) AS $$
DECLARE
  v_surprise RECORD;
  v_already_claimed BOOLEAN;
BEGIN
  -- Verificar si la sorpresa existe
  SELECT * INTO v_surprise FROM totem_surprises WHERE id = p_surprise_id AND is_active = TRUE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Sorpresa inválida o inactiva'::TEXT, 0;
    RETURN;
  END IF;

  -- Verificar si el token ya fue reclamado
  SELECT EXISTS(SELECT 1 FROM totem_surprise_claims WHERE claim_token = p_claim_token) INTO v_already_claimed;
  IF v_already_claimed THEN
    RETURN QUERY SELECT FALSE, '¡Ups! Alguien fue más rápido y ya reclamó este premio.'::TEXT, 0;
    RETURN;
  END IF;

  -- Registrar reclamo
  INSERT INTO totem_surprise_claims (surprise_id, client_id, claim_token)
  VALUES (p_surprise_id, p_client_id, p_claim_token);

  -- Si el premio son puntos, otorgarlos automáticamente
  IF v_surprise.prize_type = 'points' AND v_surprise.prize_value > 0 THEN
    -- Procesar transacción usando la función existente
    PERFORM process_transaction(
      p_client_id,
      (SELECT merchant_id FROM totems WHERE id = v_surprise.totem_id),
      'stamp_reward', -- Reusamos el tipo de premio
      v_surprise.prize_value,
      'Premio Tótem: ' || v_surprise.prize_description
    );
    RETURN QUERY SELECT TRUE, '¡Felicidades! Has ganado ' || v_surprise.prize_value::TEXT || ' puntos.'::TEXT, v_surprise.prize_value;
  ELSE
    RETURN QUERY SELECT TRUE, '¡Felicidades! Ganaste: ' || v_surprise.prize_description::TEXT, 0;
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
