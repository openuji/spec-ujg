// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        // Watch the speculator package dist so HMR works during development
        ignored: ['!**/speculator/packages/speculator/dist/**'],
      }
    }
  },

  integrations: [react()],
  trailingSlash: 'never',
  build: {
    format: 'file'
  }
});