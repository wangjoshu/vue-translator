import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://vue-translator-production.up.railway.app/', // 改为你的Railway域名
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    // 注入环境变量
    'import.meta.env.VITE_API_URL': JSON.stringify('https://你的项目名.up.railway.app')
  }
})

