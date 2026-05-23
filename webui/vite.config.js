import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import svgLoader from 'vite-svg-loader'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    svgLoader(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true
      }
    }),
    Components({
      dirs: ['src/assets/icons', 'src/components'],
      dts: 'src/components.d.ts',
      extensions: ['vue', 'svg']
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  base: './',
  build: {
    outDir: '../pages/表情管理',
    emptyOutDir: true,
    assetsDir: 'assets',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})