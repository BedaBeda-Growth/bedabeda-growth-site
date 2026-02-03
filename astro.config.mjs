import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';

export default defineConfig({
  site: 'https://bedabedagrowth.com',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    keystatic(),
    sitemap(),
  ],
  output: 'static',
  adapter: vercel(),
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
