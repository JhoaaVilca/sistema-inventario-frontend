import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // aquí cambias el puerto
  },
  optimizeDeps: {
    exclude: ['datatables.net-bs5'], // Excluir datatables si no se usa
  },
})
