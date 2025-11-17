import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills() // Node polyfills for modules like crypto, stream, etc.
  ],

  // ✅ Base path for assets, critical for static hosting like Render
  base: '/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // optional, for clean imports
    },
  },

  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },

  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },

  build: {
    outDir: 'dist', // default output folder
    rollupOptions: {
      // Only externalize libraries if you know they will be loaded globally
      // external: ['url', 'cloudinary'], 
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
  },

  server: {
    port: 5173,
    open: true,
  },

  preview: {
    port: 4173,
  },
});
