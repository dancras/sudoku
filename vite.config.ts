/* eslint @typescript-eslint/indent: ["error", 2] */
/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      base: '/sudoku/',
      registerType: 'autoUpdate'
    })
  ],
  base: '/sudoku/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setupTests.ts']
  },
  server: {
    host: '0.0.0.0'
  },
  preview: {
    host: '0.0.0.0',
    port: 8080,
  },
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src')
    }
  }
});
