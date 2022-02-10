/* eslint @typescript-eslint/indent: ["error", 2] */
/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
