import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import svgr from "vite-plugin-svgr";

const manifest = {"theme_color":"#384fff","background_color":"#94ffa6","icons":[{"purpose":"maskable","sizes":"512x512","src":"icon512_maskable.png","type":"image/png"},{"purpose":"any","sizes":"512x512","src":"icon512_rounded.png","type":"image/png"}],"orientation":"any","display":"standalone","dir":"auto","lang":"ru-RU","name":"ТНС бригада","short_name":"ТНС"}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr(), VitePWA({registerType: "autoUpdate", workbox: {
    globPatterns: ['**/*{html,css,js,png,svg,ico}'],
  },
  manifest: manifest
})],
})
