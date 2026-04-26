import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const normalizeBasePath = (rawPath: string | undefined) => {
  if (!rawPath || rawPath.trim() === "") {
    return "/";
  }

  const trimmedPath = rawPath.trim();
  const withLeadingSlash = trimmedPath.startsWith("/")
    ? trimmedPath
    : `/${trimmedPath}`;

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
};

const appBasePath = normalizeBasePath(process.env.VITE_APP_BASE_PATH);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: appBasePath,
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
