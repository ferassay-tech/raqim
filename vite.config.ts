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
});

