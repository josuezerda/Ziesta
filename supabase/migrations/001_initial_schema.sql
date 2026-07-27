-- =============================================
-- ZIESTA: Migración completa de base de datos
-- Ecosistema de fidelización inteligente
-- =============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. PERFILES DE USUARIO (extiende auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'merchant', 'admin')),
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  points_balance INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_points_earned INTEGER DEFAULT 0,
  total_points_spent INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. CATEGORÍAS / RUBROS
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar categorías base
INSERT INTO categories (name, slug, icon) VALUES
  ('Gastronomía', 'gastronomia', 'UtensilsCrossed'),
  ('Indumentaria', 'indumentaria', 'Shirt'),
  ('Salud y Belleza', 'salud-belleza', 'Heart'),
  ('Tecnología', 'tecnologia', 'Smartphone'),
  ('Hogar y Decoración', 'hogar-decoracion', 'Home'),
  ('Deportes', 'deportes', 'Trophy'),
  ('Educación', 'educacion', 'GraduationCap'),
  ('Entretenimiento', 'entretenimiento', 'Ticket'),
  ('Servicios', 'servicios', 'Wrench'),
  ('Turismo', 'turismo', 'Plane'),
  ('Supermercados', 'supermercados', 'ShoppingCart'),
  ('Automotor', 'automotor', 'Car')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- 3. COMERCIOS
-- =============================================
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  logo_url TEXT,
  cover_url TEXT,
  address TEXT,
  city TEXT DEFAULT 'Santiago del Estero',
  province TEXT DEFAULT 'Santiago del Estero',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT,
  email TEXT,
  website TEXT,
  points_per_thousand INTEGER DEFAULT 1,
  subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  subscription_active BOOLEAN DEFAULT TRUE,
  subscription_expires_at TIMESTAMPTZ,
  merchant_points_balance INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. PRODUCTOS
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. TARJETAS DE SELLOS (configuración del comercio)
-- =============================================
CREATE TABLE IF NOT EXISTS stamp_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  -- Tipo: product (comprar X producto), amount (gastar más de $X), visit (visitar N veces)
  stamp_type TEXT NOT NULL CHECK (stamp_type IN ('product', 'amount', 'visit')),
  -- Para tipo 'product': qué producto hay que comprar
  target_product_id UUID REFERENCES products(id),
  -- Para tipo 'amount': monto mínimo por compra
  min_amount DECIMAL(12,2),
  -- Cuántos sellos se necesitan para completar
  stamps_required INTEGER NOT NULL DEFAULT 10,
  -- Premio
  reward_type TEXT NOT NULL CHECK (reward_type IN ('free_product', 'discount_percent', 'discount_fixed', 'bonus_points', 'free_service')),
  reward_product_id UUID REFERENCES products(id),
  reward_value DECIMAL(12,2),
  reward_description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. PROGRESO DE SELLOS (por cliente)
-- =============================================
CREATE TABLE IF NOT EXISTS stamp_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stamp_card_id UUID NOT NULL REFERENCES stamp_cards(id) ON DELETE CASCADE,
  current_stamps INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  last_stamp_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, stamp_card_id)
);

-- =============================================
-- 7. TRANSACCIONES DE PUNTOS
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  -- earn: ganar puntos, redeem: canjear puntos, bonus: bonus, stamp_reward: premio de tarjeta
  type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'bonus', 'stamp_reward')),
  points INTEGER NOT NULL,
  description TEXT,
  purchase_amount DECIMAL(12,2),
  -- Token rotativo anti-fraude
  token_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. TOKENS ROTATIVOS (anti-fraude)
-- =============================================
CREATE TABLE IF NOT EXISTS redemption_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id),
  -- Código de 6 dígitos que rota
  token_code TEXT NOT NULL,
  -- Cuántos puntos se quieren canjear
  points_amount INTEGER NOT NULL,
  -- Merchant destino (null = cualquiera)
  target_merchant_id UUID REFERENCES merchants(id),
  -- Validez temporal (30 segundos)
  expires_at TIMESTAMPTZ NOT NULL,
  -- Uso
  used_at TIMESTAMPTZ,
  used_by_merchant_id UUID REFERENCES merchants(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. PROMOCIONES
-- =============================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percent', 'fixed', 'points_multiplier')),
  discount_value DECIMAL(12,2),
  points_cost INTEGER DEFAULT 0,
  min_purchase DECIMAL(12,2),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. INSIGNIAS / BADGES (gamificación)
-- =============================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  -- Tipos: visits, points_earned, merchants_visited, stamps_completed, points_spent
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  bonus_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar insignias base
INSERT INTO badges (name, description, icon, requirement_type, requirement_value, bonus_points) VALUES
  ('Primer Paso', 'Realizaste tu primera compra con Ziesta', 'Star', 'visits', 1, 50),
  ('Explorador Siesta', 'Visitaste 10 comercios distintos', 'Compass', 'merchants_visited', 10, 500),
  ('Fiel Seguidor', 'Acumulaste 1.000 puntos', 'Heart', 'points_earned', 1000, 100),
  ('Gran Ahorrador', 'Acumulaste 10.000 puntos', 'Gem', 'points_earned', 10000, 1000),
  ('Coleccionista', 'Completaste 5 tarjetas de sellos', 'Award', 'stamps_completed', 5, 300),
  ('VIP Siesta', 'Acumulaste 50.000 puntos', 'Crown', 'points_earned', 50000, 5000),
  ('Embajador', 'Visitaste 50 comercios distintos', 'Flag', 'merchants_visited', 50, 2000)
ON CONFLICT DO NOTHING;

-- =============================================
-- 11. INSIGNIAS GANADAS POR USUARIOS
-- =============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- =============================================
-- 12. NIVELES DE USUARIO
-- =============================================
-- Los niveles se calculan dinámicamente basados en total_points_earned
-- Nivel 1: 0-999 puntos (Bronce)
-- Nivel 2: 1000-4999 puntos (Plata)
-- Nivel 3: 5000-14999 puntos (Oro)
-- Nivel 4: 15000-49999 puntos (Platino)
-- Nivel 5: 50000+ puntos (Diamante)

-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- Función: crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: ejecutar cuando se crea un usuario en auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Función: calcular nivel basado en puntos
CREATE OR REPLACE FUNCTION calculate_level(total_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF total_points >= 50000 THEN RETURN 5;
  ELSIF total_points >= 15000 THEN RETURN 4;
  ELSIF total_points >= 5000 THEN RETURN 3;
  ELSIF total_points >= 1000 THEN RETURN 2;
  ELSE RETURN 1;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Función: procesar una transacción de puntos
CREATE OR REPLACE FUNCTION process_transaction(
  p_client_id UUID,
  p_merchant_id UUID,
  p_type TEXT,
  p_points INTEGER,
  p_description TEXT DEFAULT NULL,
  p_purchase_amount DECIMAL DEFAULT NULL,
  p_token_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_new_balance INTEGER;
  v_new_total_earned INTEGER;
  v_new_total_spent INTEGER;
BEGIN
  -- Insertar transacción
  INSERT INTO transactions (client_id, merchant_id, type, points, description, purchase_amount, token_id)
  VALUES (p_client_id, p_merchant_id, p_type, p_points, p_description, p_purchase_amount, p_token_id)
  RETURNING id INTO v_transaction_id;

  -- Actualizar balance del cliente
  IF p_type IN ('earn', 'bonus', 'stamp_reward') THEN
    UPDATE profiles
    SET
      points_balance = points_balance + p_points,
      total_points_earned = total_points_earned + p_points,
      last_activity_at = NOW(),
      level = calculate_level(total_points_earned + p_points),
      updated_at = NOW()
    WHERE id = p_client_id;

    -- Actualizar puntos del comercio (acumula los que acepta)
    UPDATE merchants
    SET merchant_points_balance = merchant_points_balance + p_points
    WHERE id = p_merchant_id;

  ELSIF p_type = 'redeem' THEN
    -- Verificar que el cliente tiene suficientes puntos
    SELECT points_balance INTO v_new_balance FROM profiles WHERE id = p_client_id;
    IF v_new_balance < p_points THEN
      RAISE EXCEPTION 'Puntos insuficientes. Balance: %, Requerido: %', v_new_balance, p_points;
    END IF;

    UPDATE profiles
    SET
      points_balance = points_balance - p_points,
      total_points_spent = total_points_spent + p_points,
      last_activity_at = NOW(),
      updated_at = NOW()
    WHERE id = p_client_id;
  END IF;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: generar token rotativo de canje
CREATE OR REPLACE FUNCTION generate_redemption_token(
  p_client_id UUID,
  p_points INTEGER,
  p_merchant_id UUID DEFAULT NULL
)
RETURNS TABLE(token_id UUID, code TEXT, expires TIMESTAMPTZ) AS $$
DECLARE
  v_token_id UUID;
  v_code TEXT;
  v_expires TIMESTAMPTZ;
  v_balance INTEGER;
BEGIN
  -- Verificar balance
  SELECT points_balance INTO v_balance FROM profiles WHERE id = p_client_id;
  IF v_balance < p_points THEN
    RAISE EXCEPTION 'Puntos insuficientes. Balance: %, Requerido: %', v_balance, p_points;
  END IF;

  -- Invalidar tokens previos no usados del mismo cliente
  UPDATE redemption_tokens
  SET expires_at = NOW()
  WHERE client_id = p_client_id AND used_at IS NULL AND expires_at > NOW();

  -- Generar código de 6 dígitos
  v_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  v_expires := NOW() + INTERVAL '60 seconds';

  INSERT INTO redemption_tokens (client_id, token_code, points_amount, target_merchant_id, expires_at)
  VALUES (p_client_id, v_code, p_points, p_merchant_id, v_expires)
  RETURNING id INTO v_token_id;

  RETURN QUERY SELECT v_token_id, v_code, v_expires;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: validar y usar un token de canje
CREATE OR REPLACE FUNCTION validate_redemption_token(
  p_token_code TEXT,
  p_merchant_id UUID
)
RETURNS TABLE(success BOOLEAN, message TEXT, client_id UUID, points INTEGER) AS $$
DECLARE
  v_token RECORD;
BEGIN
  -- Buscar el token
  SELECT rt.* INTO v_token
  FROM redemption_tokens rt
  WHERE rt.token_code = p_token_code
    AND rt.used_at IS NULL
    AND rt.expires_at > NOW()
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Token inválido o expirado'::TEXT, NULL::UUID, 0;
    RETURN;
  END IF;

  -- Verificar merchant si está restringido
  IF v_token.target_merchant_id IS NOT NULL AND v_token.target_merchant_id != p_merchant_id THEN
    RETURN QUERY SELECT FALSE, 'Este token no es válido para este comercio'::TEXT, NULL::UUID, 0;
    RETURN;
  END IF;

  -- Marcar como usado
  UPDATE redemption_tokens
  SET used_at = NOW(), used_by_merchant_id = p_merchant_id
  WHERE id = v_token.id;

  -- Procesar la transacción de canje
  PERFORM process_transaction(
    v_token.client_id,
    p_merchant_id,
    'redeem',
    v_token.points_amount,
    'Canje con token rotativo'
  );

  RETURN QUERY SELECT TRUE, 'Canje exitoso'::TEXT, v_token.client_id, v_token.points_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamp_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamp_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemption_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- PROFILES: cada usuario ve su propio perfil, admins ven todo
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);

-- CATEGORIES: todos pueden ver categorías
CREATE POLICY "Categories are viewable by all" ON categories FOR SELECT USING (true);

-- MERCHANTS: públicos para leer, dueños para editar
CREATE POLICY "Merchants are viewable by all" ON merchants FOR SELECT USING (true);
CREATE POLICY "Owners can insert merchants" ON merchants FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update merchants" ON merchants FOR UPDATE USING (auth.uid() = owner_id);

-- PRODUCTS: públicos para leer
CREATE POLICY "Products are viewable by all" ON products FOR SELECT USING (true);
CREATE POLICY "Merchant owners can manage products" ON products FOR ALL
  USING (merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid()));

-- STAMP_CARDS: públicas para leer
CREATE POLICY "Stamp cards are viewable by all" ON stamp_cards FOR SELECT USING (true);
CREATE POLICY "Merchant owners can manage stamp cards" ON stamp_cards FOR ALL
  USING (merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid()));

-- STAMP_PROGRESS: cada usuario ve su progreso
CREATE POLICY "Users can view own stamp progress" ON stamp_progress FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can insert own stamp progress" ON stamp_progress FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update own stamp progress" ON stamp_progress FOR UPDATE USING (auth.uid() = client_id);

-- TRANSACTIONS: cada usuario ve sus transacciones
CREATE POLICY "Users view own transactions" ON transactions FOR SELECT
  USING (auth.uid() = client_id OR merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid()));

-- REDEMPTION_TOKENS: cada usuario ve sus tokens
CREATE POLICY "Users view own tokens" ON redemption_tokens FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can create tokens" ON redemption_tokens FOR INSERT WITH CHECK (auth.uid() = client_id);

-- PROMOTIONS: públicas para leer
CREATE POLICY "Promotions are viewable by all" ON promotions FOR SELECT USING (true);
CREATE POLICY "Merchant owners can manage promotions" ON promotions FOR ALL
  USING (merchant_id IN (SELECT id FROM merchants WHERE owner_id = auth.uid()));

-- BADGES: públicas
CREATE POLICY "Badges are viewable by all" ON badges FOR SELECT USING (true);

-- USER_BADGES: cada usuario ve sus insignias
CREATE POLICY "Users view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
