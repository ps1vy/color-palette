import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

console.log("--- Loading vite.config.ts ---"); // Log file load

// https://vite.dev/config/
const config = defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(new URL(import.meta.url).pathname, "..", "./src"),
    },
  },
});

console.log("Vite config object:", JSON.stringify(config.plugins, null, 2)); // Log plugins

export default config;
