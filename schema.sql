-- ============================================================
-- SCHÉMA POSTGRESQL POUR CISSÉ MULTI-SERVICE
-- ============================================================
--
-- Utilisez ce script pour créer la base de données PostgreSQL.
-- Avec Neon : https://neon.tech
-- Avec Supabase : Settings → Database → SQL Editor
--
-- Connexion : postgresql://user:password@ep-xxx.aws.neon.tech/cisse-multi-service?sslmode=require
-- ============================================================

-- 1. TABLE CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLE PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
  stock INTEGER NOT NULL DEFAULT '0',
  active BOOLEAN DEFAULT TRUE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  images JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TRIGGER MISE À JOUR DE updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. INSÉRER LES DONNÉES DÉMONSTRATION (FACULTATIF)
-- ============================================================

-- Categories
INSERT INTO categories (name, slug) VALUES
  ('Sacs à dos', 'sacs-a-dos'),
  ('Écouteurs sans fil', 'ecouteurs-sans-fil'),
  ('Bandoulières', 'bandoulieres'),
  ('Montres', 'montres'),
  ('Cagoules', 'cagoules'),
  ('Bracelets & bijouterie', 'bracelets-bijouterie')
ON CONFLICT (slug) DO NOTHING;

-- Produits
INSERT INTO products (name, slug, description, price, stock, active, category_id, images) VALUES
  (
    'Sac à dos urbain antivol',
    'sac-a-dos-urbain-antivol',
    'Sac à dos moderne et résistant à l'eau, compartiment PC renforcé, port USB externe et fermetures discrètes antivol.',
    15000,
    12,
    TRUE,
    1,
    '[{"url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"}]'
  ),
  (
    'Écouteurs sans fil Pro TWS',
    'ecouteurs-sans-fil-pro-tws',
    'Son stéréo haute définition, réduction active du bruit, autonomie de 24h avec boîtier de charge rapide.',
    10000,
    25,
    TRUE,
    2,
    '[{"url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80"}]'
  ),
  (
    'Sacoche bandoulière cuir PU',
    'sacoche-bandouliere-cuir-pu',
    'Sacoche élégante et compacte pour transporter portefeuille, clés, téléphone et documents en toute sérénité.',
    8500,
    15,
    TRUE,
    3,
    '[{"url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80"}]'
  ),
  (
    'Montre chronographe élégance',
    'montre-chronographe-elegance',
    'Cadran noir et boîtier métallique soigné avec bracelet cuir marron, étanche 3ATM.',
    18000,
    7,
    TRUE,
    4,
    '[{"url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80"}]'
  ),
  (
    'Cagoule respirante multi-usages',
    'cagoule-respirante-multi-usages',
    'Tissu respirant et extensible, idéale pour protection poussière, moto ou style streetwear.',
    3000,
    30,
    TRUE,
    5,
    '[{"url": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80"}]'
  ),
  (
    'Bracelet chaîne gourmette dorée',
    'bracelet-chaine-gourmette-doree',
    'Finitions soignées en acier inoxydable plaqué or, éclat durable résistant à l\'eau.',
    4500,
    20,
    TRUE,
    6,
    '[{"url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80"}]'
  ),
  (
    'Sac à main tendance femme',
    'sac-a-main-tendance-femme',
    'Sac élégant en simili-cuir avec fermeture dorée, parfait pour les sorties du quotidien.',
    12000,
    10,
    TRUE,
    1,
    '[{"url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80"}]'
  ),
  (
    'Montre connectée sport',
    'montre-connectee-sport',
    'Suivi activité, fréquence cardiaque, notifications smartphone. Bracelet silicone respirant.',
    22000,
    5,
    TRUE,
    4,
    '[{"url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"}]'
  )
ON CONFLICT (slug) DO NOTHING;
