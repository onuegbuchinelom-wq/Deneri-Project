import { defineConfig } from 'vite'
import react from '@vitejs/react-plugin' 
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Splits large frameworks into a separate file
          }
        }
      }
    }
  }
})
