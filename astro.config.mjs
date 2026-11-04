import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import path from 'node:path';
import { loadEnv } from 'vite';

for (const [key, value] of Object.entries(loadEnv(process.env.NODE_ENV || 'development', process.cwd(), ''))) {
  if (process.env[key] === undefined) process.env[key] = value;
}

export default defineConfig({
  root: './',
  srcDir: './src',
  publicDir: './public',
  outDir: './dist',
  output: 'server',
  integrations: [react()],
  adapter: vercel(),
  site: process.env.PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./'),
      },
    },
    server: {
      fs: {
        allow: [path.resolve('./')],
      },
    },
  },
});
