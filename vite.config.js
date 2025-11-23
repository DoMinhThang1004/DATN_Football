import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: '/home', // <--- Thêm dòng này: Tự động mở trình duyệt vào đường dẫn /home
    port: 5173,    // (Tùy chọn) Cố định cổng 5173
  },
})