import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiServerPort = Number(env.API_PORT || env.API_SERVER_PORT || 8787)

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api/hf-proxy": {
          target: `http://localhost:${apiServerPort}`,
          changeOrigin: true,
          rewrite: (path) => path,
        },
      },
    },
  }
})
