# Deploy sur Vercel — Cissé Multi-Service

Ce fichier décrit comment déployer **Cissé Multi-Service** sur Vercel.

## 1. Importer le projet

- Va sur [vercel.com](https://vercel.com) → **Add New → Project**.
- Importe ton dépôt Git (GitHub / GitLab / Bitbucket).
- Vercel détecte automatiquement Next.js : pas besoin de configurer `framework`.

## 2. Variables d'environnement

Dans **Project Settings → Environment Variables**, ajoute les variables suivantes (aide-toi de `.env.example` ou `.env.local`) :

| Variable | Exemple | Remarque |
|---|---|---|
| `NEXTAUTH_URL` | `https://mondomaine.vercel.app` | URL publique du site sur Vercel |
| `NEXTAUTH_SECRET` | `une_chaine_longue_et_aléatoire` | Secret de session NextAuth |
| `MONGODB_URI` | `mongodb+srv://...` | Optionnel : si vide, le site utilise les fichiers JSON locaux |
| `ADMIN_EMAIL` | `admin@cisse.ml` | Identifiant admin |
| `ADMIN_PASSWORD` | `admin1234` | Mot de passe admin |
| `NEXT_PUBLIC_WHATSAPP_1` | `22362823995` | Numéro WhatsApp 1 |
| `NEXT_PUBLIC_WHATSAPP_2` | `22373082453` | Numéro WhatsApp 2 |
| `CLOUDINARY_CLOUD_NAME` | `...` | Si tu utilises Cloudinary |
| `CLOUDINARY_API_KEY` | `...` | Si tu utilises Cloudinary |
| `CLOUDINARY_API_SECRET` | `...` | Si tu utilises Cloudinary |

## 3. Build & déploiement

- Vercel lance `next build` automatiquement.
- Le premier déploiement crée le site publié.

## 4. Attention : données locales

Ce projet stocke les produits dans `data/products.json` et le profil admin dans `data/admin-profile.json`. Sur Vercel (serverless), ces fichiers sont dans un filesystem temporaire : les écritures peuvent ne pas persister entre les requêtes ou après un nouveau build.

Si tu modifies des produits depuis l'admin sur Vercel, les changements peuvent être perdus au prochain redéploiement. Pour une persistance fiable, il faut utiliser MongoDB (`MONGODB_URI` renseigné).

## 5. Après déploiement

- Site public : `/` , `/catalogue`, `/produit/[slug]` → accessibles sans connexion.
- Espace admin : `/admin` → nécessite une connexion avec `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## 6. Notes

- Le mode sombre fonctionne côté client (localStorage + CSS).
- Les alertes WhatsApp automatisées via WhatsApp Business Meta sont désactivées.
- Si tu changes de domaine, pense à mettre à jour `NEXTAUTH_URL` dans Vercel.
