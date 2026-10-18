import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages: https://maurij13.github.io/Devboard/ -> base muss dem Repo-Namen entsprechen
export default defineConfig({
  base: "/Devboard/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: { api: "modern" },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
