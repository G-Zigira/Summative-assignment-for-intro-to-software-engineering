import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works on GitHub Pages project sites, Netlify,
  // Cloudflare Pages, or any static folder without extra configuration.
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500, // Phaser is large; it is split into its own cacheable chunk
    rollupOptions: {
      output: {
        // Function form: works with both Rollup and Vite 8's Rolldown bundler.
        manualChunks(id) {
          if (id.includes('node_modules/phaser')) return 'phaser';
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
