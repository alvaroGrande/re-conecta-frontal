import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

function healthcheckPlugin() {
  const handleHealthcheck = (req, res, next) => {
    const url = (req.url || '').split('?')[0]

    if (url === '/healthz/liveness' || url === '/healthz/readiness') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end('OK')
      return
    }

    next()
  }

  return {
    name: 'reconecta-healthcheck',
    configureServer(server) {
      server.middlewares.use(handleHealthcheck)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleHealthcheck)
    },
  }
}

const buildOutDir = process.env.BUILD_OUT_DIR || 'compilado/dist'
const basePath = process.env.VITE_BASE_PATH || '/'
const devHost = process.env.VITE_DEV_HOST || '0.0.0.0'
const devPort = Number(process.env.VITE_DEV_PORT || 5173)
const devOpen = process.env.VITE_DEV_OPEN === 'true'
const devProxyTarget = process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:3000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [healthcheckPlugin(), vue(),tailwindcss(),],
  base: basePath,
  server: {
    host: devHost,
    port: devPort,
    strictPort: true,
    open: devOpen,
    proxy: {
      '/socket.io': {
        target: devProxyTarget,
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: buildOutDir,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@helpers': fileURLToPath(new URL('./src/helpers', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/components/features', import.meta.url)),
      '@layout': fileURLToPath(new URL('./src/components/layout', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/components/shared', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
    },
  },
})
