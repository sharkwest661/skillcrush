import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Remove auto-import to avoid conflicts with manual imports
        // additionalData: `
        //   @import "src/styles/_variables.scss";
        //   @import "src/styles/_mixins.scss";
        // `,
      },
    },
    modules: {
      // Generate scoped class names for CSS modules
      generateScopedName: "[name]__[local]__[hash:base64:5]",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@ui": path.resolve(__dirname, "src/ui"),
      "@components": path.resolve(__dirname, "src/components"),
      "@stores": path.resolve(__dirname, "src/stores"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@data": path.resolve(__dirname, "src/data"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          game: ["zustand"],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
