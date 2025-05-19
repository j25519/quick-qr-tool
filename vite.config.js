import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import csp from "vite-plugin-csp-guard";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    csp({
      // Enable outlierSupport for Tailwind CSS
      outlierSupport: {
        tailwind: true, // Ensures Tailwind's dynamic styles are CSP-compliant
      },
      // Apply CSP in both development and production
      dev: {
        enabled: true, // Enforce CSP in dev mode
      },
      build: {
        enabled: true, // Enforce CSP in production builds
      },
    }),
  ],
  server: {
    overlay: false, // Disable error overlay in dev mode
  },
})