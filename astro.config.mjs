import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://construescala.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
