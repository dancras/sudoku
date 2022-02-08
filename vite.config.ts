/* eslint @typescript-eslint/indent: ["error", 2] */
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
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
  },
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src')
    }
  }
});
