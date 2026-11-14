# Cisse Multi-Service - Guide de Déploiement Vercel

## Prérequis

- Compte Vercel (https://vercel.com)
- Compte GitHub/GitLab/Bitbucket
- Base de données Neon PostgreSQL (ou autre PostgreSQL)
- Node.js >= 22.23.4

## Configuration des Variables d'Environnement

Avant le déploiement, configurez ces variables dans Vercel:

1. **DATABASE_URL** - URL de connexion PostgreSQL
   ```
   postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
   ```

2. **NEON_BRANCH** - Branche Neon (ex: `production`)

3. **NEON_REALTIME_ENABLED** - `true` ou `false`

4. **AUTH_SECRET** - Clé secrète pour l'authentification (générez une clé aléatoire longue)

5. **ADMIN_EMAIL** - Email administrateur (ex: `admin@cisse.ml`)

6. **ADMIN_PASSWORD** - Mot de passe administrateur fort

7. **ADMIN_TOTP_SECRET** - Secret TOTP Base32 facultatif pour demander un code à usage unique à la connexion

La limitation des tentatives de connexion utilise PostgreSQL lorsqu’il est configuré.

8. **NEON_STORAGE_BUCKET** - `cisse-media`
9. **AWS_ENDPOINT_URL_S3**, **AWS_REGION**, **AWS_ACCESS_KEY_ID**, **AWS_SECRET_ACCESS_KEY** - Identifiants S3 du bucket Neon Object Storage
10. **AI_GATEWAY_BASE_URL** et **AI_GATEWAY_API_KEY** - Variables AI facultatives
11. **AI_DEFAULT_PROVIDER** - Provider AI par défaut (ex: `openai`)
12. **PUBLIC_SITE_URL** - URL de votre application Vercel (ex: `https://votre-app.vercel.app`)
13. **PUBLIC_WHATSAPP_1** et **PUBLIC_WHATSAPP_2** - Numéros WhatsApp
14. **PUBLIC_CALL_PHONE** - Numéro à appeler (facultatif, utilise `PUBLIC_WHATSAPP_1` par défaut)
15. **PUBLIC_INSTAGRAM_URL**, **PUBLIC_FACEBOOK_URL**, **PUBLIC_TIKTOK_URL** - URLs HTTPS des profils sociaux (facultatives)
16. **PUBLIC_PLAUSIBLE_DOMAIN** - Domaine du site dans Plausible (facultatif)

Les variables `AWS_ACCESS_KEY_ID` et `AWS_SECRET_ACCESS_KEY` sont des secrets propres à la branche Neon. Ne les mettez jamais dans le code ou dans le dépôt. Sur la branche de production, créez un identifiant S3 avec `neon credentials create --scope storage:read --scope storage:write`; utilisez son endpoint et sa région pour `AWS_ENDPOINT_URL_S3` et `AWS_REGION`, puis ajoutez les quatre variables `AWS_*` et `NEON_STORAGE_BUCKET` à l'environnement Production de Vercel. Ne collez jamais ces secrets dans une conversation.

## Étapes de Déploiement

### 1. Préparer le dépôt Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <votre-repo-url>
git push -u origin main
```

### 2. Importer sur Vercel

1. Connectez-vous sur https://vercel.com
2. Cliquez sur "Add New Project"
3. Importez votre dépôt Git
4. Vercel détectera automatiquement la configuration Astro

### 3. Configurer les variables d'environnement

Dans les paramètres du projet Vercel:
1. Allez dans **Settings** > **Environment Variables**
2. Ajoutez toutes les variables listées ci-dessus
3. Sélectionnez les environnements (Production, Preview, Development)

### 4. Configurer la base de données

#### Option A: Utiliser Neon (recommandé)

1. Créez un compte sur https://neon.tech
2. Créez un nouveau projet
3. Copiez le `DATABASE_URL` depuis Neon
4. Ajoutez-le comme variable d'environnement sur Vercel
5. Avant de déployer le nouveau code, exécutez les migrations:
   ```bash
   npx prisma migrate deploy
   ```
   Cela applique uniquement les migrations Prisma en attente, dont la table des commandes.

#### Option B: Utiliser Vercel Postgres

1. Dans Vercel, allez dans **Storage** > **Create Database**
2. Choisissez **Postgres**
3. Copiez le `POSTGRES_URL` généré
4. Utilisez-le comme `DATABASE_URL`

### 5. Appliquer le schéma et migrer les anciennes données

Avant le nouveau déploiement, vérifiez que `.env.local` contient la variable `DATABASE_URL` de la branche de production, puis appliquez les migrations avec ce fichier sans afficher sa valeur:

```bash
node --env-file=.env.local .\node_modules\prisma\build\index.js migrate deploy
```

Ensuite, configurez `.env.local` avec la même URL, `NEON_STORAGE_BUCKET=cisse-media` et les quatre variables `AWS_*` de cette branche Neon. Depuis la racine du projet, lancez:

```bash
npx prisma generate
npm run migrate:data
```

Le script importe les anciennes données JSON sans remplacer les enregistrements déjà présents, téléverse `public/uploads` vers Neon Object Storage et remplace les anciennes références d'images dans le catalogue et les réglages. Vérifiez que les deux configurations locales ciblent bien la même base et branche avant de lancer ces commandes. Les paniers conservés uniquement dans le `localStorage` des visiteurs et l'historique déjà présent uniquement dans WhatsApp ne peuvent pas être récupérés rétroactivement; les nouvelles commandes sont enregistrées en base lorsqu'elles sont envoyées vers WhatsApp.

### 6. Lancer le déploiement

Après vérification des migrations et des images, déployez le dépôt dans Vercel. Les variables de stockage doivent être configurées dans **Settings > Environment Variables** pour l'environnement **Production** avant le redéploiement.

Ou configurez dans `vercel.json`:
```json
{
  "buildCommand": "npx prisma migrate deploy && npm run build"
}
```

## Configuration Actuelle

Le projet est déjà configuré avec:
- **Framework**: Astro avec adapter Vercel
- **Output**: Server-side rendering
- **Build Command**: `npm run build`
- **Headers de sécurité**: Configurés dans `vercel.json`

## Déploiement Continu

Chaque push vers votre branche principale déclenchera automatiquement un nouveau déploiement sur Vercel.

## Dépannage

### Erreur de connexion à la base de données
- Vérifiez que `DATABASE_URL` est correctement configuré
- Assurez-vous que la base de données accepte les connexions externes

### Erreur de build
- Vérifiez que Node.js >= 22.23.4 est utilisé (configuré dans `package.json`)
- Vérifiez que toutes les dépendances sont installées

### Variables d'environnement non chargées
- Redéployez après avoir ajouté/modifié les variables
- Vérifiez que les variables sont dans le bon environnement (Production/Preview)

## Monitoring

- Consultez les logs dans le tableau de bord Vercel
- Utilisez Vercel Analytics pour les métriques de performance
- Surveillez l'utilisation de la base de données Neon
