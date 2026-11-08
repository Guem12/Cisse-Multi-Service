INSERT INTO "Category" (id, name, slug, active, "createdAt", "updatedAt")
VALUES
  ('seed_category_casquettes', 'Casquettes', 'casquettes', TRUE, NOW(), NOW()),
  ('seed_category_lunettes_soleil', 'Lunettes de soleil', 'lunettes-soleil', TRUE, NOW(), NOW()),
  ('seed_category_maroquinerie', 'Maroquinerie', 'maroquinerie', TRUE, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

UPDATE "Product" AS product
SET "categoryId" = category.id
FROM "Category" AS category
WHERE product.slug = 'bracelet-chaine-gourmette-doree'
  AND category.slug = 'bracelets-bijouterie';

UPDATE "Product" AS product
SET "categoryId" = category.id
FROM "Category" AS category
WHERE product.slug = 'sac-a-main-tendance-femme'
  AND category.slug = 'maroquinerie';

INSERT INTO "Product" (
  id, name, slug, description, price, stock, images, variants,
  "categoryId", active, "createdAt", "updatedAt"
)
SELECT
  'seed_product_' || product.slug,
  product.name,
  product.slug,
  product.description,
  product.price,
  product.stock,
  product.images,
  product.variants,
  category.id,
  TRUE,
  NOW(),
  NOW()
FROM (
  VALUES
    (
      'casquette-ajustable-urbaine',
      'Casquette ajustable urbaine',
      'Une casquette au style sobre pour les sorties et le quotidien. Fermeture réglable à l''arrière.',
      4500,
      8,
      '[{"url":"https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80"}]',
      '[{"name":"Couleur","options":["Noir","Beige","Bleu"]}]',
      'casquettes'
    ),
    (
      'lunettes-soleil-classiques',
      'Lunettes de soleil classiques',
      'Une monture classique facile à porter avec vos tenues de tous les jours.',
      5000,
      10,
      '[{"url":"https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80"}]',
      '[{"name":"Couleur","options":["Noir","Marron"]}]',
      'lunettes-soleil'
    ),
    (
      'portefeuille-compact',
      'Portefeuille compact',
      'Un portefeuille compact pour garder cartes et billets à portée de main.',
      6000,
      8,
      '[{"url":"https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80"}]',
      '[{"name":"Couleur","options":["Noir","Marron"]}]',
      'maroquinerie'
    ),
    (
      'sac-banane-compact',
      'Sac banane compact',
      'Un format pratique pour transporter téléphone, clés et petits essentiels lors de vos déplacements.',
      7500,
      8,
      '[{"url":"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"}]',
      '[{"name":"Couleur","options":["Noir","Kaki"]}]',
      'bandoulieres'
    ),
    (
      'bracelet-acier-style-classique',
      'Bracelet en acier style classique',
      'Un bracelet au design simple à porter seul ou avec d''autres accessoires.',
      4000,
      12,
      '[{"url":"https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80"}]',
      '[{"name":"Couleur","options":["Argenté","Doré"]}]',
      'bracelets-bijouterie'
    ),
    (
      'montre-classique-bracelet-metal',
      'Montre classique bracelet métal',
      'Une montre au cadran sobre avec bracelet métallique pour un style élégant au quotidien.',
      14000,
      6,
      '[{"url":"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"}]',
      '[{"name":"Couleur","options":["Argenté","Doré"]}]',
      'montres'
    ),
    (
      'sacoche-telephone-bandouliere',
      'Sacoche téléphone bandoulière',
      'Une petite sacoche pratique pour garder votre téléphone et vos essentiels à portée de main.',
      6500,
      10,
      '[{"url":"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80"}]',
      '[{"name":"Couleur","options":["Noir","Marron"]}]',
      'bandoulieres'
    ),
    (
      'sac-a-main-elegant',
      'Sac à main élégant',
      'Un sac à main au format pratique pour accompagner vos sorties et vos activités du quotidien.',
      12000,
      6,
      '[{"url":"https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80"}]',
      '[{"name":"Couleur","options":["Noir","Beige"]}]',
      'maroquinerie'
    )
) AS product(slug, name, description, price, stock, images, variants, category_slug)
JOIN "Category" AS category ON category.slug = product.category_slug
ON CONFLICT (slug) DO NOTHING;
