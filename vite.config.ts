import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Matches the "@/*" path already declared in tsconfig.json — that alias
    // existed only for the TS compiler until now and was unused anywhere in
    // the codebase; this is what makes it real at build/dev-server time too.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Pure bundling-boundary change — no app code affected. Splits
        // rarely-changing vendor code (loaded on every route, public and
        // admin alike) into its own cacheable chunk instead of bundling it
        // into the same file as application code that changes every deploy.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-motion": ["motion", "framer-motion"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
  },
});

