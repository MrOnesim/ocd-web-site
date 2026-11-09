import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ocdApiPlugin(): Plugin {
  return {
    name: "ocd-live-api",
    async configureServer(server) {
      const { createApiHandler } = await import("./server/api.mjs");
      const { handleApi } = createApiHandler();
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith("/api/")) {
          void handleApi(req, res);
          return;
        }
        next();
      });
    },
    async configurePreviewServer(server) {
      const { createApiHandler } = await import("./server/api.mjs");
      const { handleApi } = createApiHandler();
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith("/api/")) {
          void handleApi(req, res);
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), ocdApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    cors: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    cors: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler")) {
            return "react";
          }
          if (id.includes("node_modules/lenis") || id.includes("node_modules/lucide-react")) {
            return "motion";
          }
        },
      },
    },
  },
});
