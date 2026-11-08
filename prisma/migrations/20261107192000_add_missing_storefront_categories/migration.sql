INSERT INTO "Category" (id, name, slug, active, "createdAt", "updatedAt")
VALUES
  ('seed_category_bandoulieres', 'Bandoulières', 'bandoulieres', TRUE, NOW(), NOW()),
  ('seed_category_bracelets_bijouterie', 'Bracelets & bijouterie', 'bracelets-bijouterie', TRUE, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

UPDATE "Product" AS product
SET "categoryId" = category.id
FROM "Category" AS category
WHERE product.slug = 'bracelet-chaine-gourmette-doree'
  AND category.slug = 'bracelets-bijouterie';

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
      'sacoche-telephone-bandouliere',
      'Sacoche téléphone bandoulière',
      'Une petite sacoche pratique pour garder votre téléphone et vos essentiels à portée de main.',
      6500,
      10,
      '[{"url":"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80"}]',
      '[{"name":"Couleur","options":["Noir","Marron"]}]',
      'bandoulieres'
    )
) AS product(slug, name, description, price, stock, images, variants, category_slug)
JOIN "Category" AS category ON category.slug = product.category_slug
ON CONFLICT (slug) DO NOTHING;
