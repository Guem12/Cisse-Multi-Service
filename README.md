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

8. **R2_BUCKET** - Nom du bucket de stockage (si utilisé)

9. **FILES_BINDING** - Binding de fichiers (si utilisé)

10. **AI_GATEWAY_BASE_URL** - URL du gateway AI (si utilisé)

11. **AI_GATEWAY_API_KEY** - Clé API du gateway AI (si utilisé)

11. **AI_DEFAULT_PROVIDER** - Provider AI par défaut (ex: `openai`)

12. **PUBLIC_SITE_URL** - URL de votre application Vercel (ex: `https://votre-app.vercel.app`)

13. **PUBLIC_WHATSAPP_1** - Numéro WhatsApp 1

14. **PUBLIC_WHATSAPP_2** - Numéro WhatsApp 2

15. **PUBLIC_CALL_PHONE** - Numéro à appeler (facultatif, utilise `PUBLIC_WHATSAPP_1` par défaut)

16. **PUBLIC_INSTAGRAM_URL**, **PUBLIC_FACEBOOK_URL**, **PUBLIC_TIKTOK_URL** - URLs HTTPS des profils sociaux (facultatives, seuls les profils configurés sont affichés)

17. **PUBLIC_PLAUSIBLE_DOMAIN** - Domaine du site dans Plausible (facultatif ; sans cette variable, aucun script de mesure n'est chargé). L'événement `WhatsApp Click` compte les liens WhatsApp et `WhatsApp Order` les commandes envoyées depuis le panier.

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
5. Exécutez les migrations:
   ```bash
   npx prisma migrate deploy
   ```
   Cette migration ajoute les variantes couleur et taille aux produits.

#### Option B: Utiliser Vercel Postgres

1. Dans Vercel, allez dans **Storage** > **Create Database**
2. Choisissez **Postgres**
3. Copiez le `POSTGRES_URL` généré
4. Utilisez-le comme `DATABASE_URL`

### 5. Lancer le déploiement

1. Cliquez sur **Deploy** dans Vercel
2. Attendez la fin du build
3. Votre application sera disponible à l'URL fournie

### 6. Exécuter les migrations (si nécessaire)

Si les migrations ne s'exécutent pas automatiquement, ajoutez un script de build:

Dans `package.json`, ajoutez:
```json
"scripts": {
  "postinstall": "prisma generate",
  "vercel-build": "prisma migrate deploy && astro build"
}
```

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
